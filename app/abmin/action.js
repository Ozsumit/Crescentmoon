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

/**
 * 1. UPDATED TRACKING FUNCTION
 * Pass 'host' from your frontend (e.g., window.location.hostname)
 * so Prisma can explicitly filter it later.
 */
export async function trackPageView(path, visitorId, host = "") {
  try {
    // Pro-Tip Alternative: Block saving locally before it hits the database
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      return { success: true, skipped: "Localhost excluded" };
    }

    await prisma.pageView.create({
      data: {
        path,
        visitorId,
        host, // Ensure your Prisma schema has a 'host' string field (optional or default "")
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to track page view:", error);
    return { success: false };
  }
}

/**
 * Generates chart history with timezone-safe bucket grouping
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

  if (timeframe === "24h") {
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      const key = formatInTimeZone(d, TIMEZONE, "yyyy-MM-dd-HH");
      const label = formatInTimeZone(d, TIMEZONE, "h a");
      createBucket(key, label, d.getTime());
    }
  } else if (timeframe === "7d") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = formatInTimeZone(d, TIMEZONE, "yyyy-MM-dd");
      const label = formatInTimeZone(d, TIMEZONE, "EEE d");
      createBucket(key, label, d.getTime());
    }
  } else if (timeframe === "30d") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = formatInTimeZone(d, TIMEZONE, "yyyy-MM-dd");
      const label = formatInTimeZone(d, TIMEZONE, "MMM d");
      createBucket(key, label, d.getTime());
    }
  } else if (timeframe === "1y") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = formatInTimeZone(d, TIMEZONE, "yyyy-MM");
      const label = formatInTimeZone(d, TIMEZONE, "MMM yy");
      createBucket(key, label, d.getTime());
    }
  }

  rawData.forEach((row) => {
    const d = new Date(row.createdAt);
    let key;

    if (timeframe === "24h") {
      key = formatInTimeZone(d, TIMEZONE, "yyyy-MM-dd-HH");
    } else if (timeframe === "7d" || timeframe === "30d") {
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

  return buckets.map((b) => ({
    timestamp: b.timestamp,
    name: b.name,
    views: b.views,
    visitors: b.visitors.size,
  }));
}

/**
 * 2. UPDATED ANALYTICS INTERACTION
 * Filters out localhost data cleanly across all queries.
 */
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
      /**
       * 1. FETCH RAW TIMELINE DATA FIRST
       * We fetch the path and visitorId along with createdAt.
       */
      const rawTimelineData = await prisma.pageView.findMany({
        where: {
          createdAt: {
            gte: date,
          },
        },
        select: {
          createdAt: true,
          visitorId: true,
          path: true, // Added path so we can calculate top pages in-memory
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      /**
       * 2. FILTER LOCALHOST IN-MEMORY
       * Since 'host' isn't in your DB, we inspect the 'path' property.
       * If your local testing saves paths like "http://localhost:3000/dashboard",
       * this will catch and remove them.
       */
      const filteredData = rawTimelineData.filter((row) => {
        const pathString = row.path || "";
        return (
          !pathString.includes("localhost") && !pathString.includes("127.0.0.1")
        );
      });

      /**
       * 3. CALCULATE AGGREGATIONS MANUALLY From Filtered Data
       */

      // A. Total Page Views
      const pageViews = filteredData.length;

      // B. Unique Visitors Count
      const uniqueVisitorsSet = new Set(
        filteredData.map((row) => row.visitorId).filter(Boolean),
      );
      const uniqueVisitors = uniqueVisitorsSet.size;

      // C. Top Pages (Group & Count)
      const pageCounts = {};
      filteredData.forEach((row) => {
        pageCounts[row.path] = (pageCounts[row.path] || 0) + 1;
      });

      const topPages = Object.entries(pageCounts)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Take top 5

      /**
       * 4. ASSIGN RESULTS
       */
      results[key] = {
        pageViews,
        uniqueVisitors,
        topPages,
        /**
         * CHART HISTORY
         * Passes the filtered dataset into your existing bucket system
         */
        history: generateHistory(filteredData, key, now),
      };
    }),
  );

  return results;
}
// Keeping your video source code intact below...
export async function getVideoSources(type) {
  return await prisma.videoSource.findMany({
    where: type ? { type } : {},
    orderBy: { priority: "desc" },
  });
}

export async function saveVideoSource(data) {
  const { id, ...rest } = data;
  if (id) {
    await prisma.videoSource.update({ where: { id }, data: rest });
  } else {
    await prisma.videoSource.create({ data: rest });
  }
  revalidatePath("/abmin");
}

export async function deleteVideoSource(id) {
  await prisma.videoSource.delete({ where: { id } });
  revalidatePath("/abmin");
}

export async function seedVideoSources() {
  const movieSources = [
    {
      name: "vidking",
      url: "https://www.vidking.net/embed/movie/",
      params: "?color=c3f0c2&icons=default&autoplay=true&nextbutton=true",
      icon: "Crown",
      features: ["Recommended", "Fast"],
      description: "Fast loading with a modern player.",
      type: "movie",
      priority: 100,
    },
    {
      name: "VidLink",
      url: "https://vidlink.pro/movie/",
      params:
        "?primaryColor=6a5fef&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=jw&title=true&poster=true&autoplay=true&nextbutton=true",
      icon: "Play",
      features: ["Recommended", "Fast"],
      description: "Fast loading with a modern player.",
      type: "movie",
      priority: 95,
    },
    {
      name: "VidAPI",
      url: "https://vaplayer.ru/embed/movie/",
      params: "?skin=cinematic",
      icon: "Webhook",
      features: ["Recommended", "Fast"],
      description: "Fast loading with a modern player.",
      type: "movie",
      priority: 90,
    },
    {
      name: "VidSrc",
      url: "https://v2.vidsrc.me/embed/movie/",
      params: "?multiLang=true",
      icon: "Languages",
      features: ["Multi-Language"],
      description: "Good source for non-English audio.",
      type: "movie",
      priority: 85,
    },
    {
      name: "MoviesAPI",
      url: "https://moviesapi.club/movie/",
      params: "?multiLang=true",
      icon: "List",
      features: ["Multi-Language", "Fast"],
      description: "A reliable alternative with good subtitle support.",
      type: "movie",
      priority: 80,
    },
    {
      name: "videasy",
      url: "https://player.videasy.net/movie/",
      params: "?multiLang=true",
      icon: "Clapperboard",
      features: ["Multi-sub", "Clean UI"],
      description: "Features a clean player with multiple subtitle choices.",
      type: "movie",
      priority: 75,
    },
    {
      name: "Vidsrc 2",
      url: "https://vidsrc.net/embed/movie/",
      params: "?multiLang=true",
      icon: "Server",
      features: ["Multi-Language", "Backup"],
      description: "A secondary backup source for language options.",
      type: "movie",
      priority: 70,
    },
    {
      name: "VidSrc 3",
      url: "https://vidsrc.icu/embed/movie/",
      params: "?multiLang=true",
      icon: "Languages",
      features: ["Multi-Language", "Backup"],
      description: "Alternative source for subtitles.",
      type: "movie",
      priority: 65,
    },
    {
      name: "VidSrc 4",
      url: "https://player.vidsrc.co/embed/movie/",
      params:
        "?autoplay=true&autonext=true&nextbutton=true&poster=true&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&fontcolor=FFFFFF&fontsize=16px&opacity=0.5&font=Poppins",
      icon: "Clapperboard",
      features: [],
      description: "A reliable classic player.",
      type: "movie",
      priority: 60,
    },
    {
      name: "2Embed",
      url: "https://2embed.cc/embed/movie/",
      params: "?multiLang=true",
      icon: "Film",
      features: ["Ads"],
      description: "May have more pop-up ads.",
      type: "movie",
      priority: 55,
    },
    {
      name: "Binge",
      url: "https://vidbinge.dev/embed/movie/",
      params: "",
      icon: "Zap",
      features: ["Fast"],
      description: "Quick-loading, lightweight player.",
      type: "movie",
      priority: 50,
    },
    {
      name: "Filmu",
      url: "https://embed.filmu.in/movie/",
      params: "",
      icon: "Zap",
      features: ["Backup"],
      description: "",
      type: "movie",
      priority: 96,
    },
    {
      name: "Cinesrc",
      url: "https://cinesrc.st/embed/movie/",
      params: "",
      icon: "Play",
      features: ["Reliable"],
      description: "",
      type: "movie",
      priority: 95,
    },
    {
      name: "Stigstream",
      url: "https://stigstream.ru/movie/watch/",
      params: "",
      icon: "Zap",
      features: [],
      description: "",
      type: "movie",
      priority: 94,
    },
  ];

  const tvSources = [
    {
      name: "vidking",
      url: "https://www.vidking.net/embed/tv/",
      paramStyle: "path-slash",
      icon: "Crown",
      features: ["Recommended", "Fast"],
      description: "Fast loading with a modern player.",
      type: "tv",
      priority: 100,
    },
    {
      name: "VidLink",
      url: "https://vidlink.pro/tv/",
      paramStyle: "path-slash",
      icon: "Play",
      features: ["Recommended"],
      description: "Fast loading with a modern player.",
      type: "tv",
      priority: 95,
    },
    {
      name: "VidAPI",
      url: "https://vaplayer.ru/embed/tv/",
      paramStyle: "path-slash",
      icon: "Webhook",
      features: ["Recommended"],
      description: "Fast loading with a modern player.",
      type: "tv",
      priority: 90,
    },
    {
      name: "VidSrc",
      url: "https://v2.vidsrc.me/embed/tv/",
      paramStyle: "path-slash",
      icon: "Languages",
      features: ["Multi-Language"],
      description: "Good for non-English audio.",
      type: "tv",
      priority: 85,
    },
    {
      name: "MoviesAPI",
      url: "https://moviesapi.club/tv/",
      paramStyle: "path-hyphen-mapi",
      icon: "List",
      features: ["Multi-Language"],
      description: "Reliable alternative.",
      type: "tv",
      priority: 80,
    },
    {
      name: "videasy",
      url: "https://player.videasy.net/tv/",
      paramStyle: "path-slash",
      icon: "Clapperboard",
      features: ["Multi-sub"],
      description: "Clean player with subtitle choices.",
      type: "tv",
      priority: 75,
    },
    {
      name: "Vidsrc 2",
      url: "https://vidsrc.to/embed/tv/",
      paramStyle: "path-slash",
      icon: "Server",
      features: ["Backup"],
      description: "Secondary backup source.",
      type: "tv",
      priority: 70,
    },
    {
      name: "2Embed",
      url: "https://2embed.cc/embed/tv/",
      paramStyle: "path-slash",
      icon: "ShieldAlert",
      features: ["Ads"],
      description: "Adblocker is highly recommended.",
      type: "tv",
      priority: 65,
    },
    {
      name: "Filmu",
      url: "https://embed.filmu.in/tv/",
      paramStyle: "path-slash",
      icon: "Zap",
      features: ["Backup"],
      description: "",
      type: "tv",
      priority: 96,
    },
    {
      name: "Cinesrc",
      url: "https://cinesrc.st/embed/tv",
      paramStyle: "path-hyphen-mapi",
      icon: "Play",
      features: [],
      description: "",
      type: "tv",
      priority: 95,
    },
  ];

  const allSources = [...movieSources, ...tvSources];

  for (const source of allSources) {
    const exists = await prisma.videoSource.findFirst({
      where: { name: source.name, type: source.type },
    });

    if (!exists) {
      await prisma.videoSource.create({ data: source });
    }
  }

  revalidatePath("/abmin");
}
