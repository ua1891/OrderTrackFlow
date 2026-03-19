const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

const { getTrackingDetail } = require("../services/tcs");

// Helper function to get the date 'n' days ago
const getPastDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Create New Order
router.post("/", async (req, res) => {
  try {
    const { trackingNumber, customerName, destination } = req.body;

    if (!trackingNumber) {
      return res.status(400).json({ error: "Tracking number is required" });
    }

    // Basic verify with TCS
    const tcsData = await getTrackingDetail(trackingNumber);
    if (tcsData && tcsData.status === "FAIL") {
      return res.status(400).json({ error: "Invalid tracking number or not found in TCS." });
    }

    // Determine initial status from TCS if possible
    let initialStatus = "In Transit";
    let statusDetails = null;
    if (tcsData && tcsData.deliveryinfo && tcsData.deliveryinfo.length > 0) {
       const latestTcsStatus = tcsData.deliveryinfo[0].status;
       statusDetails = latestTcsStatus;
       if (latestTcsStatus === "Delivered") initialStatus = "Delivered";
       else if (latestTcsStatus === "Awaiting Receiver Collection") initialStatus = "Pickup Ready";
       else if (latestTcsStatus.includes("Return")) initialStatus = "Returned";
       else if (latestTcsStatus.includes("Delay")) initialStatus = "Delayed Shipment";
       else if (latestTcsStatus === "Out For Delivery") initialStatus = "In Transit";
    } else {
        initialStatus = "Pending";
    }

    // Attempt to extract Consignee details from TCS response to automatically fill name & destination
    let autoCustomerName = customerName || "Unknown Customer";
    let autoDestination = destination || "Unknown Destination";
    if (tcsData && tcsData.deliveryinfo && tcsData.deliveryinfo.length > 0) {
      if (tcsData.consignment) {
        autoCustomerName = tcsData.consignment.consigneeName || autoCustomerName;
        autoDestination = tcsData.consignment.destinationCity || autoDestination;
      }
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

    res.status(201).json(newOrder);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Tracking number already exists." });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get Dashboard Data
router.get("/dashboard", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { alerts: { orderBy: { createdAt: "desc" } } }
    });

    // Calculate metrics
    const activeOrdersCount = orders.filter(o => !["Delivered", "Returned"].includes(o.status)).length;
    const deliveredTodayCount = orders.filter(o => 
      o.status === "Delivered" && 
      new Date(o.updatedAt).toDateString() === new Date().toDateString()
    ).length;
    const returnsCount = orders.filter(o => o.status === "Returned").length;
    const pendingPickupCount = orders.filter(o => o.status === "Pickup Ready").length;

    // Get Recent Alerts
    const alerts = await prisma.alert.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { order: true }
    });

    // Group for chart dynamically
    const graphData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Create an array of the last 7 days
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      const dayName = days[targetDate.getDay()];
      
      const targetDateString = targetDate.toDateString();
      
      const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === targetDateString);
      const dayDelivered = orders.filter(o => o.status === "Delivered" && new Date(o.updatedAt).toDateString() === targetDateString);
      const dayPending = orders.filter(o => !["Delivered", "Returned"].includes(o.status) && new Date(o.createdAt).toDateString() === targetDateString);

      graphData.push({
        name: dayName,
        Total: dayOrders.length,
        Delivered: dayDelivered.length,
        Pending: dayPending.length,
      });
    }

    res.json({
      metrics: {
        activeOrders: activeOrdersCount,
        deliveredToday: deliveredTodayCount,
        returns: returnsCount,
        pendingPickup: pendingPickupCount
      },
      orders,
      alerts,
      graphData
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simulate Alert for an Order (Evaluation Feature)
router.post("/:id/simulate-alert", async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: "Order not found" });

    let alertType = "";
    let message = "";
    let newStatus = order.status;

    if (type === "Delivered") {
      alertType = "Delivery Confirmed";
      message = "Success! Parcel successfully delivered to the customer.";
      newStatus = "Delivered";
    } else if (type === "Returned") {
      alertType = "Return Initiated";
      message = "Warning: Parcel was marked as returned by TCS. Action needed.";
      newStatus = "Returned";
    } else if (type === "Pickup") {
      alertType = "Pickup Ready";
      message = "Information: Parcel has arrived at TCS office and is ready for pickup.";
      newStatus = "Pickup Ready";
    } else if (type === "Delayed") {
      alertType = "Delayed Shipment";
      message = "Alert: Parcel is experiencing a significant delay in transit.";
      newStatus = "Delayed Shipment";
    }

    // Update Order
    await prisma.order.update({
      where: { id },
      data: { status: newStatus }
    });

    // Create Alert record
    await prisma.alert.create({
      data: {
        orderId: id,
        type: alertType,
        message: message
      }
    });

    // Send Email via existing service
    const { sendAlertEmail } = require("../services/email");
    await sendAlertEmail(order, alertType, message);

    res.json({ success: true, message: `Simulated ${alertType} alert and sent email.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const { sendWhatsAppMessage } = require("../services/whatsappService");

router.post("/test-whatsapp", async (req, res) => {
  await sendWhatsAppMessage("923102501142");
  res.send("Message trigger done");
});


module.exports = router;
