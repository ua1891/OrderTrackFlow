const getAlertEmailHTML = (order, alertType, message) => {
  // Determine color theme based on alert type
  let themeColor = "#2563eb"; // Default Blue
  let icon = "🔔";

  const type = alertType.toLowerCase();
  if (type.includes("confirmed") || type.includes("delivered")) {
    themeColor = "#16a34a"; // Green
    icon = "✅";
  } else if (type.includes("cancelled") || type.includes("return") || type.includes("failed")) {
    themeColor = "#dc2626"; // Red
    icon = "❌";
  } else if (type.includes("pickup") || type.includes("transit")) {
    themeColor = "#ea580c"; // Orange
    icon = "📦";
  }

  // Handle both regular orders (trackingNumber) and Shopify orders (orderNumber)
  const identifier = order.trackingNumber || order.orderNumber || "Unknown";

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: ${themeColor}; padding: 20px; text-align: center; color: white;">
        <div style="font-size: 40px; margin-bottom: 10px;">${icon}</div>
        <h1 style="margin: 0; font-size: 20px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">TrackFlow Alert</h1>
      </div>
      
      <div style="padding: 30px; background-color: #ffffff;">
        <h2 style="margin-top: 0; color: #111827; font-size: 18px; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">${alertType}</h2>
        
        <div style="margin: 20px 0; background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid ${themeColor};">
          <p style="margin: 0 0 10px 0; color: #4b5563;"><strong>Order / Tracking ID:</strong> <span style="color: #111827; font-family: monospace;">#${identifier}</span></p>
          <p style="margin: 0 0 10px 0; color: #4b5563;"><strong>Customer Name:</strong> <span style="color: #111827;">${order.customerName}</span></p>
          <p style="margin: 0; color: #4b5563;"><strong>Time:</strong> <span style="color: #111827;">${new Date().toLocaleString()}</span></p>
        </div>

        <div style="line-height: 1.6; color: #374151; font-size: 15px;">
          <p style="font-weight: 600; color: #111827; margin-bottom: 5px;">Message Details:</p>
          <p style="margin: 0; padding: 15px; background-color: #f3f4f6; border-radius: 6px; font-style: italic;">"${message}"</p>
        </div>

        <div style="margin-top: 30px; text-align: center;">
          <a href="https://trackflow-portal.vercel.app" style="display: inline-block; padding: 12px 24px; background-color: ${themeColor}; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">View in Dashboard</a>
        </div>
      </div>

      <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">This is an automated production alert from your TrackFlow System.</p>
        <p style="margin: 5px 0 0 0; font-size: 11px; color: #d1d5db;">&copy; 2026 TrackFlow Logistics Integration</p>
      </div>
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
