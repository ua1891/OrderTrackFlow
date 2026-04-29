const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");

const { createOrder } = require("../services/orderService");
const { getDashboardData } = require("../services/dashboardService");
const authenticateToken = require("../middleware/auth");

router.use(authenticateToken); // Protect all routes below

// Create New Order
router.post("/", async (req, res) => {
  try {
    const { trackingNumber, customerName, destination } = req.body;
    
    // createOrder handles validation, TCS check, and DB creation
    const newOrder = await createOrder(req.user.id, trackingNumber, customerName, destination);

    res.status(201).json(newOrder);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Tracking number already exists." });
    }
    if (error.message === "Tracking number is required" || 
        error.message === "Invalid tracking number or not found in TCS." ||
        error.message.includes("already delivered")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get Dashboard Data
router.get("/dashboard", async (req, res) => {
  try {
    const dashboardData = await getDashboardData(req.user.id);
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
