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

// --- HELPER FUNCTION FOR CHARTS ---
// This takes raw rows from the DB and bins them into chronological intervals
function generateHistory(rawData, timeframe, now) {
  const buckets = [];
  const map = new Map(); // Maps unique time keys to bucket objects

  // 1. Pre-fill chronological buckets so charts don't have visual gaps
  if (timeframe === "24h") {
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      const key = d.getDate() + "-" + d.getHours(); // e.g. "15-14" (15th, 2 PM)
      const name = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      });
      const bucket = { name, views: 0, visitors: new Set() };
      map.set(key, bucket);
      buckets.push(bucket);
    }
  } else if (timeframe === "7d") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.getDay();
      const name = d.toLocaleDateString("en-US", { weekday: "short" });
      const bucket = { name, views: 0, visitors: new Set() };
      map.set(key, bucket);
      buckets.push(bucket);
    }
  } else if (timeframe === "30d") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.getMonth() + "-" + d.getDate();
      const name = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const bucket = { name, views: 0, visitors: new Set() };
      map.set(key, bucket);
      buckets.push(bucket);
    }
  } else if (timeframe === "1y") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.getFullYear() + "-" + d.getMonth();
      const name = d.toLocaleDateString("en-US", { month: "short" });
      const bucket = { name, views: 0, visitors: new Set() };
      map.set(key, bucket);
      buckets.push(bucket);
    }
  }

  // 2. Iterate through all page views and slot them into the correct bucket
  rawData.forEach((row) => {
    const d = new Date(row.createdAt);
    let key;

    if (timeframe === "24h") key = d.getDate() + "-" + d.getHours();
    else if (timeframe === "7d") key = d.getDay();
    else if (timeframe === "30d") key = d.getMonth() + "-" + d.getDate();
    else if (timeframe === "1y") key = d.getFullYear() + "-" + d.getMonth();

    if (map.has(key)) {
      const bucket = map.get(key);
      bucket.views += 1;
      if (row.visitorId) bucket.visitors.add(row.visitorId);
    }
  });

  // 3. Convert Sets back to raw numbers for the frontend Recharts component
  return buckets.map((b) => ({
    name: b.name,
    views: b.views,
    visitors: b.visitors.size,
  }));
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
      // Add a new query here to get raw timeline data for the charts
      const [pageViews, topPages, uniqueVisitorsGrouped, rawTimelineData] =
        await Promise.all([
          // Total page views
          prisma.pageView.count({
            where: { createdAt: { gte: date } },
          }),

          // Top pages
          prisma.pageView.groupBy({
            by: ["path"],
            where: { createdAt: { gte: date } },
            _count: { path: true },
            orderBy: { _count: { path: "desc" } },
            take: 5,
          }),

          // Unique visitors using groupBy
          prisma.pageView.groupBy({
            by: ["visitorId"],
            where: { createdAt: { gte: date } },
          }),

          // ---> NEW: Get raw data for the charts (Select only what we need to save memory)
          prisma.pageView.findMany({
            where: { createdAt: { gte: date } },
            select: { createdAt: true, visitorId: true },
          }),
        ]);

      results[key] = {
        pageViews,
        uniqueVisitors: uniqueVisitorsGrouped.length,
        topPages: topPages.map((page) => ({
          path: page.path,
          count: page._count.path,
        })),
        // ---> NEW: Process the raw data into the format the Chart expects!
        history: generateHistory(rawTimelineData, key, now),
      };
    }),
  );

  return results;
}
