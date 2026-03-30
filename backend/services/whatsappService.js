require('dotenv').config();
const axios = require('axios');

const sendWhatsAppMessage = async (to, message) => {
    try {
        await axios({
            url: `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`,
            method: 'post',
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            },
            data: {
                messaging_product: 'whatsapp',
                to: to,
                type: 'text',
                text: {
                    body: message
                }
            }
        });
    } catch (error) {
        console.error("WhatsApp Error:", error.response?.data || error.message);
    }
};

module.exports = { sendWhatsAppMessage };