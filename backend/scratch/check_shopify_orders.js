const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shopifyOrders = await prisma.shopifyOrder.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(shopifyOrders, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
