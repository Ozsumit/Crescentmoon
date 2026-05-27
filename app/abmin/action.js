"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFeedback() {
  return await prisma.feedback.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function deleteFeedback(id) {
  await prisma.feedback.delete({
    where: {
      id,
    },
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

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to track page view:", error);

    return {
      success: false,
    };
  }
}

/**
 * Better timestamp formatting
 * + stable chronological labels
 * + avoids duplicate labels
 * + improves charts dramatically
 */
function generateHistory(rawData, timeframe, now) {
  const buckets = [];
  const map = new Map();

  const createBucket = (key, label, timestamp) => {
    const bucket = {
      key,
      timestamp,
      name: label,
      views: 0,
      visitors: new Set(),
    };

    map.set(key, bucket);
    buckets.push(bucket);
  };

  /**
   * 24 HOURS
   * hourly labels
   * ex: 1 AM, 2 AM
   */
  if (timeframe === "24h") {
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);

      d.setMinutes(0, 0, 0);

      const key = d.toISOString();

      const label = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      });

      createBucket(key, label, d.getTime());
    }
  } else if (timeframe === "7d") {
    /**
     * 7 DAYS
     * ex: Mon 27
     */
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

      d.setHours(0, 0, 0, 0);

      const key = d.toISOString();

      const label = d.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
      });

      createBucket(key, label, d.getTime());
    }
  } else if (timeframe === "30d") {
    /**
     * 30 DAYS
     * ex: May 21
     */
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

      d.setHours(0, 0, 0, 0);

      const key = d.toISOString();

      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      createBucket(key, label, d.getTime());
    }
  } else if (timeframe === "1y") {
    /**
     * 1 YEAR
     * ex: Jan 2026
     */
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

      d.setHours(0, 0, 0, 0);

      const key = `${d.getFullYear()}-${d.getMonth()}`;

      const label = d.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      createBucket(key, label, d.getTime());
    }
  }

  /**
   * SLOT DATABASE ROWS INTO BUCKETS
   */
  rawData.forEach((row) => {
    const d = new Date(row.createdAt);

    let key;

    if (timeframe === "24h") {
      d.setMinutes(0, 0, 0);
      key = d.toISOString();
    } else if (timeframe === "7d") {
      d.setHours(0, 0, 0, 0);
      key = d.toISOString();
    } else if (timeframe === "30d") {
      d.setHours(0, 0, 0, 0);
      key = d.toISOString();
    } else if (timeframe === "1y") {
      key = `${d.getFullYear()}-${d.getMonth()}`;
    }

    if (map.has(key)) {
      const bucket = map.get(key);

      bucket.views += 1;

      if (row.visitorId) {
        bucket.visitors.add(row.visitorId);
      }
    }
  });

  /**
   * FINAL CLEAN DATA
   */
  return buckets.map((b) => ({
    timestamp: b.timestamp,
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

  await Promise.all(
    Object.entries(intervals).map(async ([key, date]) => {
      const [pageViews, topPages, uniqueVisitorsGrouped, rawTimelineData] =
        await Promise.all([
          /**
           * TOTAL PAGE VIEWS
           */
          prisma.pageView.count({
            where: {
              createdAt: {
                gte: date,
              },
            },
          }),

          /**
           * TOP PAGES
           */
          prisma.pageView.groupBy({
            by: ["path"],

            where: {
              createdAt: {
                gte: date,
              },
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

          /**
           * UNIQUE VISITORS
           */
          prisma.pageView.groupBy({
            by: ["visitorId"],

            where: {
              createdAt: {
                gte: date,
              },
            },
          }),

          /**
           * RAW TIMELINE DATA
           */
          prisma.pageView.findMany({
            where: {
              createdAt: {
                gte: date,
              },
            },

            select: {
              createdAt: true,
              visitorId: true,
            },

            orderBy: {
              createdAt: "asc",
            },
          }),
        ]);

      results[key] = {
        pageViews,

        uniqueVisitors: uniqueVisitorsGrouped.length,

        topPages: topPages.map((page) => ({
          path: page.path,
          count: page._count.path,
        })),

        /**
         * CLEAN HISTORY
         */
        history: generateHistory(rawTimelineData, key, now),
      };
    }),
  );

  return results;
}
