"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { formatInTimeZone } from "date-fns-tz";

const TIMEZONE = process.env.ANALYTICS_TIMEZONE || "Asia/Kathmandu";

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
 * Generates chart history with
 * timezone-safe bucket grouping
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
   */
  if (timeframe === "24h") {
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);

      const key = formatInTimeZone(d, TIMEZONE, "yyyy-MM-dd-HH");

      const label = formatInTimeZone(d, TIMEZONE, "h a");

      createBucket(key, label, d.getTime());
    }
  } else if (timeframe === "7d") {
    /**
     * 7 DAYS
     */
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

      const key = formatInTimeZone(d, TIMEZONE, "yyyy-MM-dd");

      const label = formatInTimeZone(d, TIMEZONE, "EEE d");

      createBucket(key, label, d.getTime());
    }
  } else if (timeframe === "30d") {
    /**
     * 30 DAYS
     */
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

      const key = formatInTimeZone(d, TIMEZONE, "yyyy-MM-dd");

      const label = formatInTimeZone(d, TIMEZONE, "MMM d");

      createBucket(key, label, d.getTime());
    }
  } else if (timeframe === "1y") {
    /**
     * 1 YEAR
     */
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

      const key = formatInTimeZone(d, TIMEZONE, "yyyy-MM");

      const label = formatInTimeZone(d, TIMEZONE, "MMM yy");

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
      key = formatInTimeZone(d, TIMEZONE, "yyyy-MM-dd-HH");
    } else if (timeframe === "7d") {
      key = formatInTimeZone(d, TIMEZONE, "yyyy-MM-dd");
    } else if (timeframe === "30d") {
      key = formatInTimeZone(d, TIMEZONE, "yyyy-MM-dd");
    } else if (timeframe === "1y") {
      key = formatInTimeZone(d, TIMEZONE, "yyyy-MM");
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

export async function getVideoSources(type) {
  return await prisma.videoSource.findMany({
    where: type ? { type } : {},
    orderBy: {
      priority: "desc",
    },
  });
}

export async function saveVideoSource(data) {
  const { id, ...rest } = data;
  if (id) {
    await prisma.videoSource.update({
      where: { id },
      data: rest,
    });
  } else {
    await prisma.videoSource.create({
      data: rest,
    });
  }
  revalidatePath("/abmin");
}

export async function deleteVideoSource(id) {
  await prisma.videoSource.delete({
    where: { id },
  });
  revalidatePath("/abmin");
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
         * CHART HISTORY
         */
        history: generateHistory(rawTimelineData, key, now),
      };
    }),
  );

  return results;
}
