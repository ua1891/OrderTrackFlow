const { PrismaClient } = require("@prisma/client");
const { sendWhatsAppConfirmation } = require("../services/whatsappService");
const prisma = new PrismaClient();

async function runTest() {
  const customerName = "Usman Ashfaq";
  const customerPhone = "+923154361297";
  const orderNumber = "REAL-TEST-001";
  const shopifyOrderId = "manual_" + Date.now();

  console.log(`Starting manual test for ${customerName} (${customerPhone})...`);

  try {
    // 1. Create the order in DB
    const order = await prisma.shopifyOrder.create({
      data: {
        shopifyOrderId,
        orderNumber,
        customerName,
        customerPhone,
        confirmationStatus: "PENDING",
        whatsappSentAt: new Date(),
      }
    });
    console.log("✅ Step 1: Order created in Database.");

    // 2. Send the WhatsApp Message
    console.log("Sending WhatsApp message via Meta API...");
    await sendWhatsAppConfirmation(customerPhone, customerName, orderNumber);
    console.log("✅ Step 2: WhatsApp API call successful!");

    console.log("\n--- TEST SUCCESSFUL! ---");
    console.log("Check your phone! You should receive a WhatsApp message shortly.");
    console.log("After you get it, reply with 'YES' to see if your system processes it.");

  } catch (error) {
    console.error("\n❌ TEST FAILED!");
    console.error("Error Detail:", error.message);
    if (error.response?.data) {
      console.error("API Response Error:", JSON.stringify(error.response.data, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
