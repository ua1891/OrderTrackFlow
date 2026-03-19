const axios = require('axios');

const sendWhatsAppMessage = async (to, message) => {
  try {
    const res = await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("WhatsApp sent:", res.data);
  } catch (err) {
    console.log("WhatsApp error:", err.response?.data || err.message);
  }
};

module.exports = sendWhatsAppMessage;