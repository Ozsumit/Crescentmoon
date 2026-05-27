"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFeedback() {
  return await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteFeedback(id) {
  await prisma.feedback.delete({ where: { id } });
  revalidatePath("/abmin");
}

export async function trackPageView(path, visitorId) {
  try {
    await prisma.pageView.create({
      data: {
        path,
        visitorId,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to track page view:", error);
    return { success: false };
  }
}

export async function getAnalyticsData() {
  const now = new Date();
  const intervals = {
    "24h": new Date(now.getTime() - 24 * 60 * 60 * 1000),
    "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    "1y": new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
  };

  const results = {};

  for (const [key, date] of Object.entries(intervals)) {
    const pageViews = await prisma.pageView.count({
      where: { createdAt: { gte: date } },
    });

    const topPages = await prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: date } },
      _count: {
        path: true,
      },
      orderBy: {
        _count: {
          path: "desc",
        },
      },
      take: 5,
    });

    // Note: Prisma's _count on a field doesn't support DISTINCT easily in all versions without specific configuration.
    // For many providers, we'd use groupBy or raw query for exact distinct count.
    // But since I'm told to use better aggregation, I'll use a more efficient way if available.
    // Actually, prisma.pageView.count({ where: { ... }, select: { visitorId: true }, distinct: ['visitorId'] })
    // is the way in newer Prisma.

    const uniqueVisitorCount = await prisma.pageView.count({
      where: { createdAt: { gte: date } },
      distinct: ["visitorId"],
    });

    results[key] = {
      pageViews,
      uniqueVisitors: uniqueVisitorCount,
      topPages: topPages.map((p) => ({
        path: p.path,
        count: p._count.path,
      })),
    };
  }

  return results;
}
