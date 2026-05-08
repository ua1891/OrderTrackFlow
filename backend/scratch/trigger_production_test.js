const axios = require('axios');

async function triggerProductionTest() {
  console.log("🚀 Triggering Production Test on Render...");

  const payload = {
    phone: "923154361297",
    name: "Saman (Production Test)",
    orderNumber: "PROD-" + Math.floor(1000 + Math.random() * 9000)
  };

  try {
    const response = await axios.post("https://trackflow-backend-rog0.onrender.com/api/webhooks/test-trigger", payload);
    console.log("✅ SUCCESS!");
    console.log("Server Response:", response.data);
    console.log("\n📲 Check your WhatsApp now!");
  } catch (error) {
    console.error("❌ FAILED!");
    console.error("Error Message:", error.response?.data || error.message);
    console.log("\nMake sure your Render server is 'Live' and the URL is correct.");
  }
}

triggerProductionTest();
