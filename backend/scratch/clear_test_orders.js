const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearOrders() {
  console.log("🧹 Cleaning ShopifyOrder table...");
  try {
    const deleted = await prisma.shopifyOrder.deleteMany({});
    console.log(`✅ SUCCESS! Deleted ${deleted.count} records.`);
  } catch (error) {
    console.error("❌ FAILED to clear table:", error.message);
    console.log("\nIf this is running on your computer, make sure your DATABASE_URL is correct.");
  } finally {
    await prisma.$disconnect();
  }
}

clearOrders();
