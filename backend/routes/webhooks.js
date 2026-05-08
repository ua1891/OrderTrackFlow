const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const prisma = require("../utils/prisma");
const { sendWhatsAppConfirmation } = require("../services/whatsappService");

// ─────────────────────────────────────────────────────────────
// SHOPIFY WEBHOOK — Verify HMAC Signature
// Shopify signs every request. We must verify it is really from Shopify.
// ─────────────────────────────────────────────────────────────
function verifyShopifyWebhook(req) {
  const hmacHeader = req.headers["x-shopify-hmac-sha256"];
  if (!hmacHeader) return false;

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[SHOPIFY WEBHOOK] SHOPIFY_WEBHOOK_SECRET is not set in .env");
    return false;
  }

  // req.rawBody is set by our custom middleware in server.js
  const digest = crypto
    .createHmac("sha256", secret)
    .update(req.rawBody, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
}

// ─────────────────────────────────────────────────────────────
// Helper — Extract customer phone from Shopify order payload
// Shopify can have phone in multiple places, we check all of them.
// ─────────────────────────────────────────────────────────────
function extractPhone(order) {
  return (
    order.customer?.phone ||
    order.billing_address?.phone ||
    order.shipping_address?.phone ||
    null
  );
}

// ─────────────────────────────────────────────────────────────
// POST /api/webhooks/shopify
// Shopify calls this when a new order is created in the store.
// ─────────────────────────────────────────────────────────────
router.post("/shopify", async (req, res) => {
  // Step 1: Verify the request is genuinely from Shopify
  if (!verifyShopifyWebhook(req)) {
    console.warn("[SHOPIFY WEBHOOK] Invalid HMAC — request rejected.");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const shopifyOrder = req.body;

  // Step 2: Extract the data we need
  const shopifyOrderId  = String(shopifyOrder.id);
  const orderNumber     = shopifyOrder.order_number || shopifyOrderId;
  const customerName    = shopifyOrder.customer
    ? `${shopifyOrder.customer.first_name || ""} ${shopifyOrder.customer.last_name || ""}`.trim()
    : "Valued Customer";
  const customerPhone   = extractPhone(shopifyOrder);
  const customerEmail   = shopifyOrder.customer?.email || shopifyOrder.email || null;

  console.log(`[SHOPIFY WEBHOOK] New order received: #${orderNumber} | Customer: ${customerName} | Phone: ${customerPhone}`);

  // Step 3: If no phone number, we cannot send WhatsApp — log and exit gracefully
  if (!customerPhone) {
    console.warn(`[SHOPIFY WEBHOOK] Order #${orderNumber} has no customer phone. Skipping WhatsApp.`);
    return res.status(200).json({ message: "Order received, no phone available." });
  }

  try {
    // Step 4: Save the Shopify order to our DB for tracking
    const existingOrder = await prisma.shopifyOrder.findUnique({
      where: { shopifyOrderId },
    });

    if (existingOrder) {
      console.log(`[SHOPIFY WEBHOOK] Order #${orderNumber} already exists. Skipping duplicate.`);
      return res.status(200).json({ message: "Duplicate order ignored." });
    }

    const savedOrder = await prisma.shopifyOrder.create({
      data: {
        shopifyOrderId,
        orderNumber:    String(orderNumber),
        customerName,
        customerPhone,
        customerEmail,
        confirmationStatus: "PENDING",
        whatsappSentAt:     new Date(),
      },
    });

    // Step 5: Send WhatsApp confirmation message to the customer
    await sendWhatsAppConfirmation(customerPhone, customerName, orderNumber);

    console.log(`[SHOPIFY WEBHOOK] WhatsApp sent to ${customerPhone} for order #${orderNumber}`);
    return res.status(200).json({ message: "Order processed. WhatsApp sent.", orderId: savedOrder.id });

  } catch (error) {
    console.error(`[SHOPIFY WEBHOOK] Error processing order #${orderNumber}:`, error.message);
    // Always return 200 to Shopify — otherwise Shopify will retry repeatedly
    return res.status(200).json({ message: "Received with internal error." });
  }
// ─────────────────────────────────────────────────────────────
// POST /api/webhooks/test-trigger
// MANUAL TEST TRIGGER — Use this to test the flow on Render/Production
// ─────────────────────────────────────────────────────────────
router.post("/test-trigger", async (req, res) => {
  const { phone, name, orderNumber } = req.body;

  if (!phone || !name) {
    return res.status(400).json({ error: "Phone and Name are required" });
  }

  const shopifyOrderId = "MANUAL_TEST_" + Date.now();
  const testOrderNumber = orderNumber || "TEST-" + Math.floor(1000 + Math.random() * 9000);

  console.log(`[TEST TRIGGER] Starting manual test: #${testOrderNumber} for ${name} (${phone})`);

  try {
    const savedOrder = await prisma.shopifyOrder.create({
      data: {
        shopifyOrderId,
        orderNumber:    String(testOrderNumber),
        customerName:   name,
        customerPhone:  phone,
        customerEmail:  "ua9118@gmail.com",
        confirmationStatus: "PENDING",
        whatsappSentAt:     new Date(),
      },
    });

    await sendWhatsAppConfirmation(phone, name, testOrderNumber);

    console.log(`[TEST TRIGGER] ✅ Success! Order saved and WhatsApp sent.`);
    return res.status(200).json({ message: "Test triggered successfully", orderId: savedOrder.id });

  } catch (error) {
    console.error(`[TEST TRIGGER] ❌ Error:`, error.message);
    return res.status(500).json({ error: error.message });
  }
});


// ─────────────────────────────────────────────────────────────
// GET /api/webhooks/whatsapp
// Meta calls this ONCE to verify your endpoint is real.
// You set WHATSAPP_VERIFY_TOKEN in .env AND in the Meta dashboard.
// ─────────────────────────────────────────────────────────────
router.get("/whatsapp", (req, res) => {
  const mode      = req.query["hub.mode"];
  const token     = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("[WHATSAPP WEBHOOK] Verification successful.");
    return res.status(200).send(challenge); // Must send challenge back to Meta
  }

  console.warn("[WHATSAPP WEBHOOK] Verification failed — token mismatch.");
  return res.sendStatus(403);
});

// ─────────────────────────────────────────────────────────────
// POST /api/webhooks/whatsapp
// Meta calls this every time a customer sends a WhatsApp message.
// We read their reply (YES / NO) and act accordingly.
// ─────────────────────────────────────────────────────────────
router.post("/whatsapp", async (req, res) => {
  // Always respond 200 immediately — Meta will retry if we don't
  res.sendStatus(200);

  try {
    const body = req.body;

    // Validate it's a WhatsApp message event
    if (body.object !== "whatsapp_business_account") return;

    const entry   = body.entry?.[0];
    const change  = entry?.changes?.[0];
    const value   = change?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== "text") return; // Ignore non-text (images, etc.)

    const customerPhone = message.from;         // e.g. "923001234567"
    const replyText     = message.text.body.trim().toLowerCase();

    console.log(`[WHATSAPP WEBHOOK] Reply from ${customerPhone}: "${replyText}"`);

    // Find the matching ShopifyOrder by phone number with PENDING status
    const order = await prisma.shopifyOrder.findFirst({
      where: {
        customerPhone:      { contains: customerPhone.slice(-10) }, // match last 10 digits
        confirmationStatus: "PENDING",
      },
      orderBy: { createdAt: "desc" }, // get the most recent pending order
    });

    if (!order) {
      console.log(`[WHATSAPP WEBHOOK] No pending order found for ${customerPhone}`);
      return;
    }

    if (replyText.includes("yes") || replyText === "y" || replyText === "1") {
      // ✅ Customer confirmed — update DB and email vendor
      await prisma.shopifyOrder.update({
        where: { id: order.id },
        data:  {
          confirmationStatus: "CONFIRMED",
          vendorNotifiedAt:   new Date(),
        },
      });

      await sendVendorEmail(
        order,
        "✅ Order Confirmed — Please Ship!",
        `Customer ${order.customerName} (${order.customerPhone}) has CONFIRMED their order #${order.orderNumber}.\n\nPlease process and ship the order immediately.`
      );

      console.log(`[WHATSAPP WEBHOOK] Order #${order.orderNumber} CONFIRMED. Vendor emailed.`);

    } else if (replyText.includes("no") || replyText === "n" || replyText === "0") {
      // ❌ Customer cancelled — update DB and email vendor
      await prisma.shopifyOrder.update({
        where: { id: order.id },
        data:  {
          confirmationStatus: "CANCELLED",
          vendorNotifiedAt:   new Date(),
        },
      });

      await sendVendorEmail(
        order,
        "❌ Order Cancelled by Customer",
        `Customer ${order.customerName} (${order.customerPhone}) has CANCELLED their order #${order.orderNumber}.\n\nPlease do NOT ship this order.`
      );

      console.log(`[WHATSAPP WEBHOOK] Order #${order.orderNumber} CANCELLED. Vendor emailed.`);

    } else {
      // Unrecognized reply — log it, do nothing
      console.log(`[WHATSAPP WEBHOOK] Unrecognized reply "${replyText}" from ${customerPhone}. Ignoring.`);
    }

  } catch (error) {
    console.error("[WHATSAPP WEBHOOK] Error processing reply:", error.message);
  }
});

// ─────────────────────────────────────────────────────────────
// Helper — Send email to vendor
// ─────────────────────────────────────────────────────────────
async function sendVendorEmail(order, subject, text) {
  const { sendAlertEmail } = require("../services/email");
  try {
    // We reuse the existing sendAlertEmail service which uses Brevo
    await sendAlertEmail(order, subject, text);
    console.log(`[EMAIL] Notification sent to vendor for order #${order.orderNumber}`);
  } catch (error) {
    console.error(`[EMAIL] Failed to send vendor notification:`, error.message);
  }
}

module.exports = router;

