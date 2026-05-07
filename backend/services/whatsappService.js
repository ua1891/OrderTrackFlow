require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`;

// ─────────────────────────────────────────────────────────────
// Send a FREE-FORM text message (only valid within 24h of customer
// initiating contact — used for replies in our flow)
// ─────────────────────────────────────────────────────────────
async function sendTextMessage(to, text) {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`[WHATSAPP] Text message sent to ${to}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[WHATSAPP] Failed to send text to ${to}:`, error.response?.data || error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// Send Order Confirmation Request to Customer
// NOTE: This uses a Template message because we are initiating
// the conversation (not replying within 24h).
// Template name "order_confirmation" must be approved on Meta first.
// For now we use the hello_world template for initial testing.
// ─────────────────────────────────────────────────────────────
async function sendWhatsAppConfirmation(to, customerName, orderNumber) {
  try {
    // Format phone: WhatsApp needs international format without '+' or spaces
    // e.g. "03001234567" → "923001234567"
    const formattedPhone = formatPhone(to);

    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
          name: "hello_world", // ← Replace with your approved template name later
          language: { code: "en_US" },
          // When you have an approved custom template, pass components here:
          // components: [
          //   { type: "body", parameters: [
          //     { type: "text", text: customerName },
          //     { type: "text", text: String(orderNumber) }
          //   ]}
          // ]
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`[WHATSAPP] Confirmation sent to ${formattedPhone} for order #${orderNumber}`);
    return response.data;
  } catch (error) {
    console.error(
      `[WHATSAPP] Failed to send confirmation to ${to}:`,
      error.response?.data || error.message
    );
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// Format phone number to WhatsApp international format
// Handles Pakistani numbers like 0300... → 92300...
// ─────────────────────────────────────────────────────────────
function formatPhone(phone) {
  // Remove all spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, "");

  // If starts with 0 (local Pakistani format), replace with 92
  if (cleaned.startsWith("0")) {
    cleaned = "92" + cleaned.slice(1);
  }

  // If already starts with 92 or other country code, keep as is
  return cleaned;
}

module.exports = {
  sendWhatsAppConfirmation,
  sendTextMessage,
};