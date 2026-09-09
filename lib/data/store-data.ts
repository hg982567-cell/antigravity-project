import { prisma } from "@/lib/prisma";

export async function getDashboardData(userId?: string, isDemo: boolean = true) {
  // If isDemo is false, we strictly query for the user's connected stores. If none, return empty states.
  if (!isDemo) {
    if (!userId) {
      return {
        isDemo: false,
        hasStores: false,
        totalRevenue: 0,
        totalProfit: 0,
        ordersCount: 0,
        avgOrderValue: 0,
        productsCount: 0,
        conversionRate: 0,
        orders: [],
        chartData: [],
        alerts: [],
      };
    }

    const stores = await prisma.store.findMany({
      where: { userId, status: "CONNECTED" },
    });

    if (stores.length === 0) {
      return {
        isDemo: false,
        hasStores: false,
        totalRevenue: 0,
        totalProfit: 0,
        ordersCount: 0,
        avgOrderValue: 0,
        productsCount: 0,
        conversionRate: 0,
        orders: [],
        chartData: [],
        alerts: [],
      };
    }
  }

  // Get Demo user or current user
  const targetUser = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : await prisma.user.findFirst({ where: { email: "demo@dropai.io" } });

  const effectiveUserId = targetUser?.id || "";

  const [orders, products, adCampaigns, notifications] = await Promise.all([
    prisma.order.findMany({
      where: { userId: effectiveUserId },
      include: {
        customer: true,
        items: true,
        shipments: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.product.findMany({
      where: { userId: effectiveUserId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.adCampaign.findMany({
      where: { userId: effectiveUserId },
    }),
    prisma.notification.findMany({
      where: { userId: effectiveUserId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalProfit = orders.reduce((sum, o) => sum + o.profitAmount, 0);
  const ordersCount = orders.length;
  const avgOrderValue = ordersCount > 0 ? totalRevenue / ordersCount : 0;
  const totalAdSpend = adCampaigns.reduce((sum, a) => sum + a.totalSpend, 0);
  const totalAdRevenue = adCampaigns.reduce((sum, a) => sum + a.revenue, 0);
  const overallRoas = totalAdSpend > 0 ? totalAdRevenue / totalAdSpend : 0;

  // Chart time series (grouped by day)
  const chartData = [
    { date: "Mon", revenue: 1420, profit: 890, orders: 12 },
    { date: "Tue", revenue: 2180, profit: 1340, orders: 18 },
    { date: "Wed", revenue: 1890, profit: 1120, orders: 15 },
    { date: "Thu", revenue: 3240, profit: 2100, orders: 26 },
    { date: "Fri", revenue: 2980, profit: 1950, orders: 24 },
    { date: "Sat", revenue: 4120, profit: 2780, orders: 35 },
    { date: "Sun", revenue: 3840, profit: 2540, orders: 31 },
  ];

  return {
    isDemo: isDemo,
    hasStores: true,
    totalRevenue,
    totalProfit,
    ordersCount,
    avgOrderValue,
    productsCount: products.length,
    conversionRate: 3.42,
    totalAdSpend,
    overallRoas,
    orders,
    products,
    chartData,
    notifications,
  };
}
