const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");

const { createOrder } = require("../services/orderService");
const { getDashboardData } = require("../services/dashboardService");
const authenticateToken = require("../middleware/auth");
const { sendError, sendSuccess } = require("../utils/apiError");

router.use(authenticateToken); // Protect all routes below

function validateOrderInput(req, res, next) {
  const { trackingNumber } = req.body;
  if (!trackingNumber || typeof trackingNumber !== 'string' || trackingNumber.trim() === '') {
    return sendError(res, 400, 'Tracking number is required and must be a non-empty string.');
  }
  req.body.trackingNumber = trackingNumber.trim();
  next();
}

// Create New Order
router.post("/", validateOrderInput, async (req, res) => {
  try {
    const { trackingNumber, customerName, destination } = req.body;
    
    // createOrder handles validation, TCS check, and DB creation
    const newOrder = await createOrder(req.user.id, trackingNumber, customerName, destination);

    return sendSuccess(res, newOrder, 201);
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, 400, "Tracking number already exists.");
    }
    if (error.message === "Tracking number is required" || 
        error.message === "Invalid tracking number or not found in TCS." ||
        error.message.includes("already delivered")) {
      return sendError(res, 400, error.message);
    }
    return sendError(res, 500, error.message);
  }
});

// Get Dashboard Data
router.get("/dashboard", async (req, res) => {
  try {
    const dashboardData = await getDashboardData(req.user.id);
    return sendSuccess(res, dashboardData);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
});

module.exports = router;
