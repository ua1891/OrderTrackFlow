const prisma = require("../utils/prisma");
const { getTrackingDetail: getTcsTrackingDetail } = require("./tcs");
const { getTrackingDetail: getPostexTrackingDetail } = require("./postex");

async function createOrder(userId, trackingNumber, customerName, destination) {
  if (!trackingNumber) {
    throw new Error("Tracking number is required");
  }

  const isPostex = trackingNumber.toLowerCase().startsWith('cx-');

  // Basic verify
  let trackingData;
  if (isPostex) {
    trackingData = await getPostexTrackingDetail(trackingNumber);
  } else {
    trackingData = await getTcsTrackingDetail(trackingNumber);
  }

  if (trackingData && trackingData.status === "FAIL") {
    throw new Error(`Invalid tracking number or not found in ${isPostex ? 'PostEx' : 'TCS'}.`);
  }

  let initialStatus = "In Transit";
  let statusDetails = null;
  let autoCustomerName = customerName || "Unknown Customer";
  let autoDestination = destination || "Unknown Destination";

  if (isPostex) {
    const dist = trackingData.dist;
    if (dist) {
      autoCustomerName = dist.customerName || autoCustomerName;
      autoDestination = dist.cityName || autoDestination;
      
      const latestStatusMsg = dist.transactionStatus || "In Transit";
      statusDetails = latestStatusMsg;
      
      const status = latestStatusMsg.trim().toLowerCase();
      if (status.includes("delivered")) {
          throw new Error("This parcel is already delivered. No need to track! Please enter a different number.");
      }
      else if (status.includes("warehouse") || status.includes("unbooked") || status.includes("booked")) initialStatus = "Pending";
      else if (status.includes("picked") || status.includes("pickup")) initialStatus = "Pickup Ready";
      else if (status.includes("return")) initialStatus = "Returned";
      else if (status.includes("review") || status.includes("attempt") || status.includes("delay")) initialStatus = "Delayed Shipment";
      else initialStatus = "In Transit";
    } else {
      initialStatus = "Pending";
    }
  } else {
    // Determine initial status from TCS if possible
    const dInfo = trackingData && trackingData.deliveryinfo && trackingData.deliveryinfo.length > 0 ? trackingData.deliveryinfo[0] : null;

    if (dInfo && dInfo.status) {
      const latestTcsStatus = dInfo.status;
      statusDetails = latestTcsStatus;
      
      const status = latestTcsStatus.trim().toLowerCase();
      
      if (status.includes("delivered")) {
          throw new Error("This parcel is already delivered. No need to track! Please enter a different number.");
      }
      else if (status.includes("awaiting receiver") || status.includes("awaiting consignee") || status.includes("pickup")) initialStatus = "Pickup Ready";
      else if (status.includes("return")) initialStatus = "Returned";
      else if (status.includes("delay")) initialStatus = "Delayed Shipment";
      else initialStatus = "In Transit"; // default fallback for 'Arrived at TCS Facility', 'Out For Delivery'
    } else {
      initialStatus = "Pending";
    }

    const sInfo = trackingData && trackingData.shipmentinfo && trackingData.shipmentinfo.length > 0 ? trackingData.shipmentinfo[0] : null;
    if (sInfo) {
      autoCustomerName = sInfo.consignee || autoCustomerName;
      autoDestination = sInfo.destination || autoDestination;
    }
  }

  const newOrder = await prisma.order.create({
    data: {
      userId,
      trackingNumber,
      customerName: autoCustomerName,
      destination: autoDestination,
      status: initialStatus,
      statusDetails,
    }
  });

  return newOrder;
}

module.exports = {
  createOrder
};
