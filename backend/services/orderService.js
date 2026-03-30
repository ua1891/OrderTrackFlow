const prisma = require("../utils/prisma");
const { getTrackingDetail } = require("./tcs");

async function createOrder(userId, trackingNumber, customerName, destination) {
  if (!trackingNumber) {
    throw new Error("Tracking number is required");
  }

  // Basic verify with TCS
  const tcsData = await getTrackingDetail(trackingNumber);
  if (tcsData && tcsData.status === "FAIL") {
    throw new Error("Invalid tracking number or not found in TCS.");
  }

  // Determine initial status from TCS if possible
  let initialStatus = "In Transit";
  let statusDetails = null;
  
  const dInfo = tcsData && tcsData.deliveryinfo && tcsData.deliveryinfo.length > 0 ? tcsData.deliveryinfo[0] : null;

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

  // Attempt to extract Consignee details from TCS response to automatically fill name & destination
  let autoCustomerName = customerName || "Unknown Customer";
  let autoDestination = destination || "Unknown Destination";
  
  const sInfo = tcsData && tcsData.shipmentinfo && tcsData.shipmentinfo.length > 0 ? tcsData.shipmentinfo[0] : null;

  if (sInfo) {
    autoCustomerName = sInfo.consignee || autoCustomerName;
    autoDestination = sInfo.destination || autoDestination;
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
