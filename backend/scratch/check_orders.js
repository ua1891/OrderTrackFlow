const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkOrders() {
  try {
    const order = await prisma.shopifyOrder.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (order) {
      console.log("SUCCESS! Found a new order in the database:");
      console.log(`Order Number: ${order.orderNumber}`);
      console.log(`Customer: ${order.customerName}`);
      console.log(`Status: ${order.confirmationStatus}`);
      console.log(`Created At: ${order.createdAt}`);
    } else {
      console.log("No orders found in the database yet.");
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrders();
