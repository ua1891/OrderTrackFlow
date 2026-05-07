require("dotenv").config();

// ─── Environment Validation (run BEFORE any other imports) ──────
const REQUIRED_ENV_VARS = ['JWT_SECRET', 'DATABASE_URL'];
const WARN_ENV_VARS = ['TCS_BEARER_TOKEN', 'BREVO_API_KEY', 'POSTEX_TOKEN'];

const missing = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error(`[STARTUP ERROR] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1); // Exit before anything else starts
}

const warnMissing = WARN_ENV_VARS.filter(v => !process.env[v]);
if (warnMissing.length > 0) {
  console.warn(`[STARTUP WARN] Optional env vars not set (some features disabled): ${warnMissing.join(', ')}`);
}

const express = require("express");
const cors = require("cors");
const prisma = require("./utils/prisma");
const { startCronJobs } = require("./services/poller");

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// ─── Raw Body Capture (MUST be before express.json) ─────────────────────────
// Shopify HMAC verification requires the raw, unparsed request body.
// We capture it here and attach it to req.rawBody for use in the webhook route.
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Routes
const rateLimit = require('express-rate-limit');

// Limit auth endpoints: max 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/webhooks", require("./routes/webhooks"));

// ─────────────────────────────────────────────


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`TrackFlow API running on http://localhost:${PORT}`);
  
  try {
    startCronJobs();
  } catch (error) {
    console.error("Failed to start CronJobs", error);
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

module.exports = app;