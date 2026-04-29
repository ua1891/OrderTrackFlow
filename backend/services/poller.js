const cron = require("node-cron");
const prisma = require("../utils/prisma");
const { getTrackingDetail: getTcsTracking } = require("./tcs");
const { getTrackingDetail: getPostexTracking } = require("./postex");
const { sendAlertEmail } = require("./email");

// Helper to determine status and alerts
function determineNewStatus(currentStatus, latestStatusRaw) {
  const status = latestStatusRaw.trim().toLowerCase();
  let newStatus = currentStatus;
  let alertType = null;
  let message = "";

  if (status.includes("delivered") && currentStatus !== "Delivered") {
    newStatus = "Delivered";
    alertType = "Delivery Confirmed";
    message = "Parcel successfully delivered to the customer.";
  } else if (
    (status.includes("awaiting receiver") || status.includes("awaiting consignee") || status.includes("pickup") || status.includes("picked") || status.includes("warehouse")) &&
    currentStatus !== "Pickup Ready" && currentStatus !== "In Transit" && currentStatus !== "Delivered" && currentStatus !== "Returned"
  ) {
    newStatus = "Pickup Ready";
    alertType = "Pickup Ready";
    message = "Parcel has arrived at the facility and is ready for pickup or processing.";
  } else if (
    status.includes("return") &&
    currentStatus !== "Returned"
  ) {
    newStatus = "Returned";
    alertType = "Return Initiated";
    message = "Parcel was marked as returned by the courier. Immediate action needed.";
  } else if (
    (status.includes("delay") || status.includes("review") || status.includes("attempt")) &&
    currentStatus !== "Delayed Shipment"
  ) {
    newStatus = "Delayed Shipment";
    alertType = "Delayed Shipment";
    message = "Parcel is experiencing a delay or an attempt issue in transit.";
  } else if (
    (status.includes("in transit") || status.includes("arrived") || status.includes("out for delivery") || status.includes("route")) &&
    (currentStatus === "Pending" || currentStatus === "Returned" || currentStatus === "Delayed Shipment" || currentStatus === "Pickup Ready")
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
async function processOrderUpdate(order, trackingData, isPostex) {
  let latestStatus = null;

  if (isPostex) {
    if (trackingData.dist && trackingData.dist.transactionStatus) {
      latestStatus = trackingData.dist.transactionStatus;
    }
  } else {
    // We need deliveryinfo or checkpoints for status
    const dInfo = trackingData.deliveryinfo && trackingData.deliveryinfo.length > 0 ? trackingData.deliveryinfo[0] : null;
    const cInfo = trackingData.checkpoints && trackingData.checkpoints.length > 0 ? trackingData.checkpoints[0] : null;

    if(dInfo && dInfo.status) {
        latestStatus = dInfo.status;
    } else if(cInfo && cInfo.status) {
        latestStatus = cInfo.status;
    }
  }

  if (!latestStatus) return; // No status available yet

  const currentStatus = order.status;

  const { newStatus, alertType, message } = determineNewStatus(currentStatus, latestStatus);

  // Update DB and Send Email if status changed
  if (newStatus !== currentStatus || latestStatus !== order.statusDetails) {
    if (newStatus !== currentStatus) {
      console.log(`Order ${order.trackingNumber}: Status changed ${currentStatus} -> ${newStatus}`);
    }
    
    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: newStatus, statusDetails: latestStatus }
    });

    // Create alert and trigger email if it's a significant alertType
    if (alertType && newStatus !== currentStatus) {
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
      const isPostex = order.trackingNumber.toLowerCase().startsWith('cx-');
      let trackingData;
      
      if (isPostex) {
        trackingData = await getPostexTracking(order.trackingNumber);
      } else {
        trackingData = await getTcsTracking(order.trackingNumber);
      }

      if (trackingData && trackingData.status !== "FAIL") {
        await processOrderUpdate(order, trackingData, isPostex);
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
  console.log("[POLLER] Running PostEx & TCS tracking check...");
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
