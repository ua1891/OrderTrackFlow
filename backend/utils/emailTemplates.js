const getAlertEmailHTML = (order, alertType, message) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">TrackFlow Automated Alert</h2>
      <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
      <p><strong>Customer:</strong> ${order.customerName}</p>
      <p><strong>Status Changed to:</strong> ${alertType}</p>
      <p><strong>Details:</strong> ${message}</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">This is an automated message from your TrackFlow System.</p>
    </div>
  `;
};

const getWelcomeEmailHTML = (userName, userEmail, generatedPassword) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #2563eb;">Welcome to TrackFlow, ${userName}!</h2>
      <p>Thank you for creating an account on the **TrackFlow Portal**.</p>
      <p>Our system will help you track your TCS shipments automatically and send you alerts whenever your parcel status changes.</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">Your Account Credentials</h3>
        <p style="margin: 5px 0;"><strong>Username / Email:</strong></p>
        <p style="margin: 5px 0 15px 0; font-family: monospace; font-size: 16px;">${userEmail}</p>
        <p style="margin: 5px 0;"><strong>Auto-Generated Password:</strong></p>
        <p style="margin: 5px 0; font-family: monospace; font-size: 18px; font-weight: bold; padding: 8px; background-color: #e5e7eb; display: inline-block; border-radius: 4px;">${generatedPassword}</p>
        <p style="margin-top: 10px; font-size: 14px; color: #dc2626;">Please copy this password. You will need it to log in.</p>
      </div>

      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Log in to your dashboard.</li>
        <li>Add your TCS Tracking Numbers.</li>
        <li>Relax while we monitor your shipments 24/7.</li>
      </ul>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">If you did not sign up for this account, please ignore this email.</p>
    </div>
  `;
};

module.exports = {
  getAlertEmailHTML,
  getWelcomeEmailHTML
};
