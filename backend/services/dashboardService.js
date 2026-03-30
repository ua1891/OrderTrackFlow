const prisma = require("../utils/prisma");

async function getDashboardData(userId) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { alerts: { orderBy: { createdAt: "desc" } } }
  });

  // Calculate metrics
  const activeOrdersCount = orders.filter(o => !["Delivered", "Returned"].includes(o.status)).length;
  const deliveredTodayCount = orders.filter(o => 
    o.status === "Delivered" && 
    new Date(o.updatedAt).toDateString() === new Date().toDateString()
  ).length;
  const returnsCount = orders.filter(o => o.status === "Returned").length;
  const pendingPickupCount = orders.filter(o => o.status === "Pickup Ready").length;

  // Get Recent Alerts
  const alerts = await prisma.alert.findMany({
    where: { order: { userId } },
    take: 20,
    orderBy: { createdAt: "desc" },
    include: { order: true }
  });

  // Group for chart dynamically
  const graphData = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Create an array of the last 7 days
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - i);
    const dayName = days[targetDate.getDay()];
    
    const targetDateString = targetDate.toDateString();
    
    const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === targetDateString);
    const dayDelivered = orders.filter(o => o.status === "Delivered" && new Date(o.updatedAt).toDateString() === targetDateString);
    const dayPending = orders.filter(o => !["Delivered", "Returned"].includes(o.status) && new Date(o.createdAt).toDateString() === targetDateString);

    graphData.push({
      name: dayName,
      Total: dayOrders.length,
      Delivered: dayDelivered.length,
      Pending: dayPending.length,
    });
  }

  return {
    metrics: {
      activeOrders: activeOrdersCount,
      deliveredToday: deliveredTodayCount,
      returns: returnsCount,
      pendingPickup: pendingPickupCount
    },
    // We only return active/returned orders to the main list to keep it clean
    orders: orders.filter(o => o.status !== "Delivered"),
    alerts,
    graphData
  };
}

module.exports = {
  getDashboardData
};
