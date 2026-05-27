"use client";

import { useMemo, useState, useEffect } from "react";
import { Users, Eye, TrendingUp, Globe, Film } from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";

// --- GLOBAL MEDIA CACHE ---
// Prevents duplicate API calls when hovering over the same movie multiple times
const mediaCache = new Map();

const fetchMediaInfo = async (path) => {
  if (mediaCache.has(path)) return mediaCache.get(path);

  // Extract type (movie/tv) and ID from paths like /movie/12345 or /tv/67890
  const match = path.match(/\/(movie|tv|series)\/(\d+)/i);
  if (!match) {
    mediaCache.set(path, null);
    return null;
  }

  const type =
    match[1].toLowerCase() === "series" ? "tv" : match[1].toLowerCase();
  const id = match[2];

  try {
    // ⚠️ REPLACE THIS WITH YOUR ACTUAL TMDB API KEY OR INTERNAL API ROUTE
    const TMDB_KEY =
      process.env.NEXT_PUBLIC_TMDB_API_KEY || "YOUR_TMDB_API_KEY";

    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_KEY}`,
    );
    if (!res.ok) throw new Error("Fetch failed");

    const data = await res.json();
    const info = {
      title: data.title || data.name,
      poster: data.poster_path
        ? `https://image.tmdb.org/t/p/w200${data.poster_path}`
        : null,
      year: (data.release_date || data.first_air_date || "").split("-")[0],
      type: type === "tv" ? "Series" : "Movie",
    };

    mediaCache.set(path, info);
    return info;
  } catch (err) {
    // Fallback if TMDB key is missing or fetch fails
    const fallback = {
      title: `ID: ${id}`,
      poster: null,
      year: null,
      type: type === "tv" ? "Series" : "Movie",
    };
    mediaCache.set(path, fallback);
    return fallback;
  }
};

// --- CUSTOM COMPONENTS ---

const SmartChartTooltip = ({ active, payload }) => {
  const [media, setMedia] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (active && payload && payload.length) {
      const path = payload[0].payload.path;
      setMedia(mediaCache.get(path) || null); // Load from cache instantly if available

      fetchMediaInfo(path).then((data) => {
        if (isMounted && data) setMedia(data);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [active, payload]);

  if (!active || !payload || !payload.length) return null;

  const path = payload[0].payload.path;
  const views = payload[0].value;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white/95 p-3 shadow-xl backdrop-blur-sm max-w-[220px]">
      <p className="mb-2 truncate border-b border-neutral-100 pb-1.5 font-mono text-[10px] text-neutral-400">
        {path}
      </p>

      {media ? (
        <div className="mb-2 flex items-start gap-3">
          {media.poster ? (
            <img
              src={media.poster}
              alt={media.title}
              className="h-14 w-10 shrink-0 rounded bg-neutral-100 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded bg-neutral-100">
              <Film size={14} className="text-neutral-300" />
            </div>
          )}
          <div className="flex flex-col overflow-hidden">
            <span
              className="truncate text-xs font-bold text-neutral-900"
              title={media.title}
            >
              {media.title}
            </span>
            <span className="mt-0.5 text-[10px] font-medium text-neutral-500">
              {media.year ? `${media.year} • ` : ""}
              {media.type}
            </span>
          </div>
        </div>
      ) : null}

      <div className="mt-1 flex items-center gap-1.5 pt-1 text-xs font-bold text-indigo-600">
        <Eye size={14} />
        {views.toLocaleString()} Views
      </div>
    </div>
  );
};

const SmartPathDisplay = ({ path }) => {
  const [media, setMedia] = useState(mediaCache.get(path) || null);

  useEffect(() => {
    let isMounted = true;
    fetchMediaInfo(path).then((data) => {
      if (isMounted && data) setMedia(data);
    });
    return () => {
      isMounted = false;
    };
  }, [path]);

  if (media) {
    return (
      <div className="flex flex-1 items-center gap-2 overflow-hidden pr-2">
        <span
          className="truncate font-sans text-xs font-semibold text-neutral-800"
          title={media.title}
        >
          {media.title}
        </span>
        <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-neutral-500">
          {media.type}
        </span>
      </div>
    );
  }

  return (
    <span className="flex-1 truncate font-mono pr-2" title={path}>
      {path}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-md backdrop-blur-sm">
        <p className="mb-1.5 text-xs font-semibold text-neutral-500">{label}</p>
        <div className="space-y-1">
          {payload.map((item, idx) => (
            <div
              key={item.name || idx}
              className="flex items-center justify-between gap-4"
            >
              <span className="flex items-center gap-1.5 text-xs text-neutral-600">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: item.stroke || item.fill || "#ccc",
                  }}
                />
                {item.name === "views"
                  ? "Views"
                  : item.name === "visitors"
                    ? "Visitors"
                    : item.name}
              </span>
              <span className="text-xs font-semibold text-neutral-900">
                {item.value ? item.value.toLocaleString() : "0"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const StatCard = ({ icon: Icon, label, value, subtext, colorClass }) => (
  <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {label}
        </p>
        <h3 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950">
          {typeof value === "number" ? value.toLocaleString() : value || "0"}
        </h3>
        <p className="mt-1 text-xs text-neutral-500">{subtext}</p>
      </div>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-50 ${colorClass}`}
      >
        <Icon size={20} />
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export default function AnalyticsDashboard({ data }) {
  const [timeframe, setTimeframe] = useState("24h");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const currentData = useMemo(() => data?.[timeframe] || {}, [data, timeframe]);

  const chartData = useMemo(() => {
    const possibleKeys = [
      "history",
      "chartData",
      "traffic",
      "series",
      "data",
      "graph",
    ];
    for (const key of possibleKeys) {
      if (
        currentData[key] &&
        Array.isArray(currentData[key]) &&
        currentData[key].length > 0
      ) {
        return currentData[key];
      }
    }
    return [];
  }, [currentData]);

  const pageViews = currentData.pageViews ?? 0;
  const uniqueVisitors = currentData.uniqueVisitors ?? 0;
  const avgViews =
    uniqueVisitors > 0 ? (pageViews / uniqueVisitors).toFixed(1) : "0.0";
  const topPagesCount = currentData.topPages?.length ?? 0;

  const maxPageViews = useMemo(() => {
    if (!currentData.topPages || currentData.topPages.length === 0) return 1;
    const max = Math.max(...currentData.topPages.map((p) => p.count));
    return max > 0 ? max : 1;
  }, [currentData.topPages]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 md:text-3xl">
            Analytics
          </h1>
          <p className="text-sm text-neutral-500">
            Performance metrics and traffic overview
          </p>
        </div>

        <div className="inline-flex self-start rounded-lg border border-neutral-200 bg-neutral-50 p-1">
          {["24h", "7d", "30d", "1y"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
                timeframe === t
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Eye}
          label="Page Views"
          value={pageViews}
          subtext="Total recorded hits"
          colorClass="text-indigo-600"
        />
        <StatCard
          icon={Users}
          label="Unique Visitors"
          value={uniqueVisitors}
          subtext="Distinct user agents"
          colorClass="text-cyan-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Views / Visitor"
          value={avgViews}
          subtext="Average session depth"
          colorClass="text-emerald-600"
        />
        <StatCard
          icon={Globe}
          label="Active Routes"
          value={topPagesCount}
          subtext="Configured targets"
          colorClass="text-amber-600"
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* TRAFFIC OVERVIEW */}
        <div className="min-w-0 lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                Traffic Overview
              </h3>
              <p className="text-xs text-neutral-500">
                Compare views and visitor flow
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Views
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Visitors
              </span>
            </div>
          </div>

          <div className="h-[300px] w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: -20, right: 10 }}>
                  <CartesianGrid vertical={false} stroke="#f5f5f5" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#888888" }}
                    dy={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#888888" }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: "#e5e5e5" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="visitors"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full animate-pulse rounded-lg bg-neutral-50" />
            )}
          </div>
        </div>

        {/* ENGAGEMENT WAVE */}
        <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-neutral-900">
              Engagement Wave
            </h3>
            <p className="text-xs text-neutral-500">
              Volume distribution over time
            </p>
          </div>

          <div className="h-[300px] w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -20, right: 10 }}>
                  <defs>
                    <linearGradient
                      id="viewsGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f5f5f5" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#888888" }}
                    dy={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#888888" }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: "#e5e5e5" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#4f46e5"
                    fill="url(#viewsGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full animate-pulse rounded-lg bg-neutral-50" />
            )}
          </div>
        </div>
      </div>

      {/* MOST VISITED PAGES */}
      <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-neutral-900">
            Most Visited Content
          </h3>
          <p className="text-xs text-neutral-500">
            Popular media resolved by incoming traffic
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          {/* RESOLVED LIST VIEW */}
          <div className="overflow-hidden rounded-xl border border-neutral-200">
            <div className="divide-y divide-neutral-100">
              {currentData.topPages && currentData.topPages.length > 0 ? (
                currentData.topPages.map((page, index) => {
                  const percentage = Math.max(
                    5,
                    Math.round((page.count / maxPageViews) * 100),
                  );
                  return (
                    <div
                      key={index}
                      className="relative flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-neutral-50/50"
                    >
                      <div
                        className="absolute bottom-0 left-0 top-0 bg-neutral-100/60 transition-all duration-500"
                        style={{ width: `${percentage}%`, zIndex: 0 }}
                      />

                      <div className="relative z-10 flex w-full max-w-[70%] items-center gap-3 text-xs text-neutral-700">
                        <span className="text-[10px] font-bold text-neutral-400 shrink-0">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        {/* Smart component to resolve Title instead of showing Path */}
                        <SmartPathDisplay path={page.path} />
                      </div>

                      <div className="relative z-10 flex shrink-0 items-center gap-3 pl-2">
                        <span className="text-sm font-semibold text-neutral-900">
                          {page.count.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-semibold uppercase text-neutral-400">
                          views
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-neutral-400">
                  No page views found for this period.
                </div>
              )}
            </div>
          </div>

          {/* BAR CHART DISPLAY */}
          <div className="h-[280px] rounded-xl border border-neutral-200 p-4">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={currentData.topPages || []}
                  margin={{ top: 10, bottom: 5, left: -20, right: 10 }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="#f5f5f5"
                  />
                  <XAxis
                    dataKey="path"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 9, fill: "#888888" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#888888" }}
                  />

                  {/* Smart Tooltip for Bar Chart */}
                  <Tooltip
                    cursor={{ fill: "#fcfcfc" }}
                    content={<SmartChartTooltip />}
                  />

                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    fill="#4f46e5"
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full animate-pulse rounded-lg bg-neutral-50" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
