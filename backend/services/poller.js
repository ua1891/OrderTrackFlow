const cron = require("node-cron");
const prisma = require("../utils/prisma");
const { getTrackingDetail } = require("./tcs");
const { sendAlertEmail } = require("./email");

// Helper to determine status and alerts
function determineNewStatus(currentStatus, latestTcsStatus) {
  const status = latestTcsStatus.trim().toLowerCase();
  let newStatus = currentStatus;
  let alertType = null;
  let message = "";

  if (status.includes("delivered") && currentStatus !== "Delivered") {
    newStatus = "Delivered";
    alertType = "Delivery Confirmed";
    message = "Parcel successfully delivered to the customer.";
  } else if (
    (status.includes("awaiting receiver") || status.includes("awaiting consignee") || status.includes("pickup")) &&
    currentStatus !== "Pickup Ready"
  ) {
    newStatus = "Pickup Ready";
    alertType = "Pickup Ready";
    message = "Parcel has arrived at TCS office and is ready for pickup.";
  } else if (
    status.includes("return") &&
    currentStatus !== "Returned"
  ) {
    newStatus = "Returned";
    alertType = "Return Initiated";
    message = "Parcel was marked as returned by TCS. Immediate action needed.";
  } else if (
    status.includes("delay") &&
    currentStatus !== "Delayed Shipment"
  ) {
    newStatus = "Delayed Shipment";
    alertType = "Delayed Shipment";
    message = "Parcel is experiencing a delay in transit.";
  } else if (
    (status.includes("in transit") || status.includes("arrived") || status.includes("out for delivery")) &&
    (currentStatus === "Pending" || currentStatus === "Returned" || currentStatus === "Delayed Shipment")
  ) {
    newStatus = "In Transit";
    if (currentStatus === "Returned") {
      alertType = "Re-attempted";
      message = "A previously returned parcel is now back in transit for re-attempt.";
    }
  }

  return { newStatus, alertType, message };
}

// Detect status changes and trigger alerts
async function processOrderUpdate(order, tcsData) {
  // We need deliveryinfo or checkpoints for status
  const dInfo = tcsData.deliveryinfo && tcsData.deliveryinfo.length > 0 ? tcsData.deliveryinfo[0] : null;
  const cInfo = tcsData.checkpoints && tcsData.checkpoints.length > 0 ? tcsData.checkpoints[0] : null;

  let latestTcsStatus = null;
  if(dInfo && dInfo.status) {
      latestTcsStatus = dInfo.status;
  } else if(cInfo && cInfo.status) {
      latestTcsStatus = cInfo.status;
  }

  if (!latestTcsStatus) return; // No status available yet

  const currentStatus = order.status;

  const { newStatus, alertType, message } = determineNewStatus(currentStatus, latestTcsStatus);

  // Update DB and Send Email if status changed
  if (newStatus !== currentStatus) {
    console.log(`Order ${order.trackingNumber}: Status changed ${currentStatus} -> ${newStatus}`);
    
    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: newStatus, statusDetails: latestTcsStatus }
    });

    // Create alert and trigger email if it's a significant alertType
    if (alertType) {
      await prisma.alert.create({
        data: {
          orderId: order.id,
          type: alertType,
          message: message,
        }
      });

      // Send Email to Vendor
      await sendAlertEmail(order, alertType, message);
    }
  }
}

// Fetch orders that are not Delivered (we keep tracking Returned for re-attempts)
async function fetchActiveOrders() {
  return await prisma.order.findMany({
    where: {
      status: {
        notIn: ["Delivered"]
      }
    },
    include: {
      user: true
    }
  });
}

// Track each order and process updates
async function trackAndProcessOrders(activeOrders) {
  for (const order of activeOrders) {
    try {
      const tcsData = await getTrackingDetail(order.trackingNumber);
      if (tcsData.status !== "FAIL") {
        await processOrderUpdate(order, tcsData);
      }
    } catch (error) {
      console.error(`Failed to track ${order.trackingNumber}: ${error.message}`);
    }
    
    // Add a small delay between requests to avoid rate limits
    await new Promise(res => setTimeout(res, 500));
  }
}

// Main logic for the tracking cycle
async function runTrackingCycle() {
  console.log("[POLLER] Running TCS tracking check...");
  try {
    const activeOrders = await fetchActiveOrders();
    await trackAndProcessOrders(activeOrders);
  } catch (error) {
    console.error("[POLLER] Error during tracking cycle:", error.message);
  }
}

// Run cron job based on frequency
function startCronJobs() {
  const CRON_SCHEDULE = process.env.POLLING_SCHEDULE || "*/5 * * * *";
  
  cron.schedule(CRON_SCHEDULE, runTrackingCycle);
  
  console.log(`Cron jobs initialized with schedule: ${CRON_SCHEDULE}`);
}

module.exports = { startCronJobs, processOrderUpdate, runTrackingCycle, fetchActiveOrders };
