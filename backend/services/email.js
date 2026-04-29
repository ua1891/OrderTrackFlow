const nodemailer = require("nodemailer");
const { getAlertEmailHTML, getWelcomeEmailHTML } = require("../utils/emailTemplates");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendAlertEmail(order, alertType, message) {
  try {
    const targetEmail = order.user?.email || process.env.VENDOR_EMAIL;

    const mailOptions = {
      from: `"TrackFlow System" <${process.env.SMTP_USER}>`,
      to: targetEmail,
      subject: `[TrackFlow] Alert for Order #${order.trackingNumber}: ${alertType}`,
      html: getAlertEmailHTML(order, alertType, message),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Alert email sent for ${order.trackingNumber}: ${info.messageId}`);
  } catch (error) {
    console.error(`Failed to send email for ${order.trackingNumber}:`, error.message);
  }
}

async function sendWelcomeEmail(user, generatedPassword) {
  try {
    const mailOptions = {
      from: `"TrackFlow System" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `Welcome to TrackFlow - Your Account Credentials`,
      html: getWelcomeEmailHTML(user.name, user.email, generatedPassword),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent for ${user.email}: ${info.messageId}`);
  } catch (error) {
    console.error(`Failed to send welcome email for ${user.email}:`, error.message);
  }
}

module.exports = { sendAlertEmail, sendWelcomeEmail };
