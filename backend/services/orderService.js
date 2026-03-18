const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getTrackingDetail } = require("./tcs");

async function createOrder(trackingNumber, customerName, destination) {
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
  
  const info = tcsData && tcsData.shipmentinfo && tcsData.shipmentinfo.length > 0 ? tcsData.shipmentinfo[0] : null;

  if (info) {
    const latestTcsStatus = info.status;
    statusDetails = latestTcsStatus;
    
    const status = latestTcsStatus.trim().toLowerCase();
    
    if (status === "delivered") initialStatus = "Delivered";
    else if (status === "awaiting receiver collection" || status.includes("pickup")) initialStatus = "Pickup Ready";
    else if (status.includes("return")) initialStatus = "Returned";
    else if (status.includes("delay")) initialStatus = "Delayed Shipment";
    else if (status === "out for delivery" || status.includes("transit")) initialStatus = "In Transit";
  } else {
    initialStatus = "Pending";
  }

  // Attempt to extract Consignee details from TCS response to automatically fill name & destination
  let autoCustomerName = customerName || "Unknown Customer";
  let autoDestination = destination || "Unknown Destination";
  
  if (info) {
    autoCustomerName = info.consignee || autoCustomerName;
    autoDestination = info.destination || autoDestination;
  }

  const newOrder = await prisma.order.create({
    data: {
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
