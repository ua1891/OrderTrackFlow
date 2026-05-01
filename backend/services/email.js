const axios = require('axios');
const { getAlertEmailHTML, getWelcomeEmailHTML } = require("../utils/emailTemplates");

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_EMAIL = process.env.SMTP_USER || 'ua9118@gmail.com'; 

async function sendEmailViaBrevo(to, subject, htmlContent) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not set in environment variables");
  }

  const payload = {
    sender: { name: "TrackFlow System", email: SENDER_EMAIL },
    to: [{ email: to }],
    subject: subject,
    htmlContent: htmlContent
  };

  try {
    const response = await axios.post(BREVO_API_URL, payload, {
      headers: {
        'Accept': 'application/json',
        'api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.error("Brevo API Error:", errorMsg);
    throw new Error(`Brevo API Error: ${errorMsg}`);
  }
}

async function sendAlertEmail(order, alertType, message) {
  try {
    const targetEmail = order.user?.email || process.env.VENDOR_EMAIL;
    const subject = `[TrackFlow] Alert for Order #${order.trackingNumber}: ${alertType}`;
    const html = getAlertEmailHTML(order, alertType, message);
    
    await sendEmailViaBrevo(targetEmail, subject, html);
    console.log(`Alert email sent via Brevo for ${order.trackingNumber}`);
  } catch (error) {
    console.error(`Failed to send alert email for ${order.trackingNumber}:`, error.message);
    throw error;
  }
}

async function sendWelcomeEmail(user, generatedPassword) {
  try {
    const subject = `Welcome to TrackFlow - Your Account Credentials`;
    const html = getWelcomeEmailHTML(user.name, user.email, generatedPassword);
    
    await sendEmailViaBrevo(user.email, subject, html);
    console.log(`Welcome email sent via Brevo for ${user.email}`);
  } catch (error) {
    console.error(`Failed to send welcome email for ${user.email}:`, error.message);
    throw error;
  }
}

module.exports = { sendAlertEmail, sendWelcomeEmail };
