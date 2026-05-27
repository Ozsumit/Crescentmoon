"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFeedback() {
  return await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteFeedback(id) {
  await prisma.feedback.delete({
    where: { id },
  });

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

  // Run all interval queries in parallel
  await Promise.all(
    Object.entries(intervals).map(async ([key, date]) => {
      // Run all DB operations in parallel
      const [pageViews, topPages, uniqueVisitorsGrouped] = await Promise.all([
        // Total page views
        prisma.pageView.count({
          where: {
            createdAt: { gte: date },
          },
        }),

        // Top pages
        prisma.pageView.groupBy({
          by: ["path"],
          where: {
            createdAt: { gte: date },
          },
          _count: {
            path: true,
          },
          orderBy: {
            _count: {
              path: "desc",
            },
          },
          take: 5,
        }),

        // Unique visitors using groupBy
        prisma.pageView.groupBy({
          by: ["visitorId"],
          where: {
            createdAt: { gte: date },
          },
        }),
      ]);

      results[key] = {
        pageViews,

        // groupBy returns unique rows already
        uniqueVisitors: uniqueVisitorsGrouped.length,

        topPages: topPages.map((page) => ({
          path: page.path,
          count: page._count.path,
        })),
      };
    }),
  );

  return results;
}
