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

// ─────────────────────────────────────────────
// WHATSAPP WEBHOOK — Step 3
// ─────────────────────────────────────────────

// GET: Meta calls this once to verify your webhook is real
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

  const mode      = req.query["hub.mode"];
  const token     = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WhatsApp Webhook verified!");
    res.status(200).send(challenge); // Must echo this back to Meta
  } else {
    console.warn("❌ Webhook verification failed. Check WEBHOOK_VERIFY_TOKEN.");
    res.sendStatus(403);
  }
});

// POST: WhatsApp sends incoming messages / status updates here
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "whatsapp_business_account") {
    body.entry?.forEach((entry) => {
      entry.changes?.forEach((change) => {
        const value = change.value;

        // Incoming messages from customers
        const messages = value?.messages;
        if (messages) {
          messages.forEach((msg) => {
            console.log(`📩 Message from ${msg.from}: ${msg.text?.body}`);
            // TODO: Save to DB or trigger auto-reply here
          });
        }

        // Delivery / read status updates
        const statuses = value?.statuses;
        if (statuses) {
          statuses.forEach((status) => {
            console.log(`📬 Message ${status.id} status: ${status.status}`);
          });
        }
      });
    });

    res.sendStatus(200); // Always respond 200 quickly so Meta doesn't retry
  } else {
    res.sendStatus(404);
  }
});

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