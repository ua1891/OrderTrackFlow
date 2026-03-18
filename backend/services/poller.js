const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const { getTrackingDetail } = require("./tcs");
const { sendAlertEmail } = require("./email");

const prisma = new PrismaClient();

// Helper to determine status and alerts
function determineNewStatus(currentStatus, latestTcsStatus) {
  const status = latestTcsStatus.trim().toLowerCase();
  let newStatus = currentStatus;
  let alertType = null;
  let message = "";

  if (status === "delivered" && currentStatus !== "Delivered") {
    newStatus = "Delivered";
    alertType = "Delivery Confirmed";
    message = "Parcel successfully delivered to the customer.";
  } else if (
    (status === "awaiting receiver collection" || status.includes("pickup")) &&
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
    (status === "out for delivery" || status.includes("transit")) &&
    currentStatus === "Pending"
  ) {
    newStatus = "In Transit";
  }

  return { newStatus, alertType, message };
}

// Detect status changes and trigger alerts
async function processOrderUpdate(order, tcsData) {
  // If there's no shipment info, skip
  if (!tcsData.shipmentinfo || tcsData.shipmentinfo.length === 0) return;

  // The latest status is usually the first element
  const info = tcsData.shipmentinfo[0];
  const latestTcsStatus = info.status;
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

// Fetch orders that are not Delivered and not Returned
async function fetchActiveOrders() {
  return await prisma.order.findMany({
    where: {
      status: {
        notIn: ["Delivered", "Returned"]
      }
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
