const { PrismaClient } = require('@prisma/client');
const { sendWhatsAppConfirmation } = require('../services/whatsappService');
const prisma = new PrismaClient();

// CONFIGURATION: Change these to test with different data
const TEST_NAME = "Usman (TrackFlow Test)"; // User's name
const TEST_PHONE = "923154361297"; // User's phone number (with country code, no +)
const TEST_ORDER_NUMBER = "TEST-" + Math.floor(1000 + Math.random() * 9000);

async function triggerTest() {
  console.log(`\n🚀 Starting WhatsApp Trigger Test...`);
  console.log(`-----------------------------------`);
  console.log(`Name:  ${TEST_NAME}`);
  console.log(`Phone: ${TEST_PHONE}`);
  console.log(`Order: #${TEST_ORDER_NUMBER}\n`);

  try {
    // 1. Create a mock Shopify order in the database
    // This mimics what the Shopify Webhook does.
    const shopifyOrderId = "TEST_ID_" + Date.now();
    
    /* 
    console.log(`[DB] Creating test ShopifyOrder record...`);
    const savedOrder = await prisma.shopifyOrder.create({
      data: {
        shopifyOrderId,
        orderNumber: TEST_ORDER_NUMBER,
        customerName: TEST_NAME,
        customerPhone: TEST_PHONE,
        confirmationStatus: "PENDING",
        whatsappSentAt: new Date(),
      },
    });
    console.log(`[DB] ✅ Record created with ID: ${savedOrder.id}`);
    */
    console.log(`[DB] ⚠️ Skipping DB record creation (DB inaccessible in this environment)`);
    const savedOrder = { id: "MOCK_ID", orderNumber: TEST_ORDER_NUMBER };

    // 2. Trigger the WhatsApp API
    console.log(`[WHATSAPP] Sending confirmation message via API...`);
    const result = await sendWhatsAppConfirmation(TEST_PHONE, TEST_NAME, TEST_ORDER_NUMBER);
    
    console.log(`[WHATSAPP] ✅ API Response success!`);
    console.log(`\n🎉 TEST COMPLETED SUCCESSFULLY! Check your phone at ${TEST_PHONE}.`);

  } catch (error) {
    console.error(`\n❌ TEST FAILED:`);
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    if (error.response && error.response.data) {
      console.error("API Error Details:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Full Error Object:", error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

triggerTest();
