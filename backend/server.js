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
// WHATSAPP HELPER
// ─────────────────────────────────────────────

const sendWhatsAppMessage = async (to, text) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v25.0/${process.env.WA_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to,
          type: "text",
          text: { body: text },
        }),
      }
    );
    const data = await response.json();
    console.log("📤 WhatsApp message sent:", data);
  } catch (error) {
    console.error("❌ Failed to send WhatsApp message:", error);
  }
};

// Normalize phone: strip +, spaces, dashes for flexible matching
const normalizePhone = (phone) => phone.replace(/[\s\-\+]/g, "");

const findOrderByPhone = async (rawPhone) => {
  const normalized = normalizePhone(rawPhone); // e.g. "919876543210"
  const last10     = normalized.slice(-10);    // e.g. "9876543210"

  // Try all possible formats stored in DB
  return await prisma.order.findFirst({
    where: {
      customerPhone: {
        in: [
          normalized,         // "919876543210"
          `+${normalized}`,   // "+919876543210"
          last10,             // "9876543210"
          `+91${last10}`,     // "+919876543210" (India specific)
        ],
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// ─────────────────────────────────────────────
// WHATSAPP WEBHOOK
// ─────────────────────────────────────────────

// GET: Meta calls this once to verify your webhook is real
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

  const mode      = req.query["hub.mode"];
  const token     = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WhatsApp Webhook verified!");
    res.status(200).send(challenge);
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
          messages.forEach(async (msg) => {
            const phone = msg.from;
            const text  = msg.text?.body;
            console.log(`📩 Message from ${phone}: ${text}`);

            try {
              const order = await findOrderByPhone(phone);

              if (order) {
                await sendWhatsAppMessage(
                  phone,
                  `Hi ${order.customerName}! 👋\n\nYour order *#${order.trackingNumber}* is currently:\n*${order.status}* 🚚\n\n${order.statusDetails ? order.statusDetails + "\n\n" : ""}Reply anytime to check your latest order status.`
                );
              } else {
                await sendWhatsAppMessage(
                  phone,
                  `Hi! 👋 We couldn't find an order linked to your number.\n\nPlease contact support or check your tracking number.`
                );
              }
            } catch (err) {
              console.error("❌ Error handling incoming message:", err);
            }
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