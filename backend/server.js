require("dotenv").config();
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
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/orders", require("./routes/orders"));

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
