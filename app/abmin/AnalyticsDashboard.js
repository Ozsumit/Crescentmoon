"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Users, Eye, TrendingUp, Globe, Film, Moon, Sun } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  AreaChart,
  Area,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// --- THEME HOOK ---
// Applies `dark` class to the dashboard root div and persists preference.
function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("adash-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const toggle = () =>
    setDark((d) => {
      const next = !d;
      localStorage.setItem("adash-theme", next ? "dark" : "light");
      return next;
    });

  return { dark, toggle };
}

// --- GLOBAL MEDIA CACHE ---
const mediaCache = new Map();

const fetchMediaInfo = async (path) => {
  if (mediaCache.has(path)) return mediaCache.get(path);
  const match = path.match(/\/(movie|tv|series)\/(\d+)/i);
  if (!match) {
    mediaCache.set(path, null);
    return null;
  }
  const type =
    match[1].toLowerCase() === "series" ? "tv" : match[1].toLowerCase();
  const id = match[2];
  try {
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
  } catch {
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

// --- UTILITIES ---
function fmtNum(n) {
  if (n == null || isNaN(n)) return "0";
  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString();
}

// --- CUSTOM TOOLTIP (chart hover) ---
const SmartChartTooltip = ({ active, payload }) => {
  const [media, setMedia] = useState(null);

  useEffect(() => {
    let alive = true;
    if (active && payload?.length) {
      const path = payload[0].payload.path;
      setMedia(mediaCache.get(path) || null);
      fetchMediaInfo(path).then((d) => {
        if (alive && d) setMedia(d);
      });
    }
    return () => {
      alive = false;
    };
  }, [active, payload]);

  if (!active || !payload?.length) return null;
  const path = payload[0].payload.path;
  const views = payload[0].value;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white/95 p-3 shadow-xl backdrop-blur-sm max-w-[220px]">
      <p className="mb-2 truncate border-b border-neutral-100 pb-1.5 font-mono text-[10px] text-neutral-400">
        {path}
      </p>
      {media && (
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
            <span className="truncate text-xs font-bold text-neutral-900">
              {media.title}
            </span>
            <span className="mt-0.5 text-[10px] text-neutral-500">
              {media.year ? `${media.year} • ` : ""}
              {media.type}
            </span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-1.5 pt-1 text-xs font-bold text-indigo-600">
        <Eye size={14} />
        {views?.toLocaleString()} Views
      </div>
    </div>
  );
};

const TrafficTooltip = ({ active, payload, label, dark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: dark ? "#171717" : "#fff",
        border: `0.5px solid ${dark ? "#404040" : "#e5e5e5"}`,
      }}
      className="rounded-xl p-3 shadow-md text-xs"
    >
      <p
        className="mb-2 font-mono text-[11px]"
        style={{ color: dark ? "#737373" : "#a1a1aa" }}
      >
        {label}
      </p>
      {payload.map((item, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-6 mb-1 last:mb-0"
        >
          <span
            className="flex items-center gap-1.5"
            style={{ color: dark ? "#737373" : "#737373" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: item.stroke || item.fill }}
            />
            {item.name === "views" ? "Views" : "Visitors"}
          </span>
          <span
            className="font-semibold font-mono"
            style={{ color: dark ? "#f5f5f5" : "#171717" }}
          >
            {fmtNum(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// --- SMART PATH DISPLAY ---
const SmartPathDisplay = ({ path }) => {
  const [media, setMedia] = useState(mediaCache.get(path) || null);
  useEffect(() => {
    let alive = true;
    fetchMediaInfo(path).then((d) => {
      if (alive && d) setMedia(d);
    });
    return () => {
      alive = false;
    };
  }, [path]);

  if (media) {
    return (
      <div className="flex flex-1 items-center gap-2 overflow-hidden">
        <span
          className="truncate text-xs font-medium text-neutral-800 dark:text-neutral-200"
          title={media.title}
        >
          {media.title}
        </span>
        <span className="shrink-0 rounded bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          {media.type}
        </span>
      </div>
    );
  }
  return (
    <span
      className="flex-1 truncate font-mono text-xs text-neutral-500 dark:text-neutral-400"
      title={path}
    >
      {path}
    </span>
  );
};

// --- STAT CARD ---
const ACCENT = {
  indigo: {
    bar: "bg-indigo-500",
    icon: "bg-indigo-50 text-indigo-500 dark:bg-indigo-950 dark:text-indigo-400",
  },
  cyan: {
    bar: "bg-cyan-400",
    icon: "bg-cyan-50 text-cyan-500 dark:bg-cyan-950 dark:text-cyan-400",
  },
  emerald: {
    bar: "bg-emerald-400",
    icon: "bg-emerald-50 text-emerald-500 dark:bg-emerald-950 dark:text-emerald-400",
  },
  amber: {
    bar: "bg-amber-400",
    icon: "bg-amber-50 text-amber-500 dark:bg-amber-950 dark:text-amber-400",
  },
};

const StatCard = ({ icon: Icon, label, value, subtext, color = "indigo" }) => {
  const { bar, icon } = ACCENT[color];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`absolute inset-x-0 top-0 h-0.5 ${bar}`} />
      <div className="flex items-start justify-between pt-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            {label}
          </p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 tabular-nums">
            {typeof value === "number" ? fmtNum(value) : (value ?? "0")}
          </h3>
          <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500 font-light">
            {subtext}
          </p>
        </div>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${icon}`}
        >
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
};

// --- HORIZONTAL MINI BAR (replaces awkward vertical bar chart with long path labels) ---
const MiniBarChart = ({ pages, maxCount }) => (
  <div className="space-y-2">
    {pages.map((p, i) => {
      const pct = Math.max(12, Math.round((p.count / maxCount) * 100));
      const label = p.path.replace("/movie/", "M·").replace("/tv/", "TV·");
      return (
        <div key={i} className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-right font-mono text-[9px] text-neutral-400 dark:text-neutral-500 overflow-hidden text-ellipsis">
            {label}
          </span>
          <div className="flex-1 h-5 rounded-sm bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-sm bg-indigo-500 flex items-center justify-end pr-2 transition-all duration-500"
              style={{ width: `${pct}%`, minWidth: 28 }}
            >
              <span className="font-mono text-[9px] font-semibold text-white/90">
                {fmtNum(p.count)}
              </span>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

// --- TIMEFRAME PILL ---
const TIMEFRAMES = ["24h", "7d", "30d", "1y"];

const TimeframePills = ({ value, onChange }) => (
  <div className="inline-flex self-start rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-1 gap-0.5">
    {TIMEFRAMES.map((t) => (
      <button
        key={t}
        onClick={() => onChange(t)}
        className={`rounded-md px-3 py-1.5 text-[11px] font-semibold font-mono uppercase transition-all ${
          value === t
            ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
            : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        }`}
      >
        {t}
      </button>
    ))}
  </div>
);

// --- SECTION HEADER ---
const SectionHeader = ({ title, sub }) => (
  <div className="mb-5">
    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
      {title}
    </h3>
    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-light mt-0.5">
      {sub}
    </p>
  </div>
);

// --- MAIN COMPONENT ---
export default function AnalyticsDashboard({ data }) {
  const [timeframe, setTimeframe] = useState("24h");
  const [mounted, setMounted] = useState(false);
  const { dark, toggle } = useTheme();

  useEffect(() => setMounted(true), []);

  const current = useMemo(() => data?.[timeframe] ?? {}, [data, timeframe]);

  const chartData = useMemo(() => {
    for (const key of [
      "history",
      "chartData",
      "traffic",
      "series",
      "data",
      "graph",
    ]) {
      if (Array.isArray(current[key]) && current[key].length)
        return current[key];
    }
    return [];
  }, [current]);

  // Prefer explicit keys; fall back to summing chartData rows so stats
  // always reflect the selected timeframe even when top-level keys are absent.
  const pageViews = useMemo(() => {
    if (current.pageViews != null) return current.pageViews;
    return chartData.reduce((sum, row) => sum + (row.views ?? 0), 0);
  }, [current.pageViews, chartData]);

  const uniqueVisitors = useMemo(() => {
    if (current.uniqueVisitors != null) return current.uniqueVisitors;
    return chartData.reduce((sum, row) => sum + (row.visitors ?? 0), 0);
  }, [current.uniqueVisitors, chartData]);

  const avgViews =
    uniqueVisitors > 0 ? (pageViews / uniqueVisitors).toFixed(1) : "0.0";
  const topPagesCount = current.topPages?.length ?? 0;

  const maxPageViews = useMemo(() => {
    if (!current.topPages?.length) return 1;
    return Math.max(...current.topPages.map((p) => p.count), 1);
  }, [current.topPages]);

  return (
    <div className={`${dark ? "dark" : ""}`}>
      <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-6 bg-neutral-50 dark:bg-neutral-950 min-h-screen transition-colors duration-200">
        {/* ── HEADER ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 md:text-3xl">
              Analytics
            </h1>
            <p className="mt-0.5 text-sm font-light text-neutral-400 dark:text-neutral-500">
              Performance metrics and traffic overview
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <button
              onClick={toggle}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all shadow-sm"
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <TimeframePills value={timeframe} onChange={setTimeframe} />
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={Eye}
            label="Page views"
            value={pageViews}
            subtext="Total recorded hits"
            color="indigo"
          />
          <StatCard
            icon={Users}
            label="Unique visitors"
            value={uniqueVisitors}
            subtext="Distinct user agents"
            color="cyan"
          />
          <StatCard
            icon={TrendingUp}
            label="Views / visitor"
            value={avgViews}
            subtext="Avg. session depth"
            color="emerald"
          />
          <StatCard
            icon={Globe}
            label="Active routes"
            value={topPagesCount}
            subtext="Configured targets"
            color="amber"
          />
        </div>

        {/* ── CHARTS ROW ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Traffic overview — 2/3 width */}
          <div className="lg:col-span-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between">
              <SectionHeader
                title="Traffic overview"
                sub="Compare views and visitor flow"
              />
              <div className="flex items-center gap-4 text-[11px] text-neutral-400 dark:text-neutral-500 font-medium pt-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                  Views
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-cyan-400 shrink-0" />
                  Visitors
                </span>
              </div>
            </div>
            <div className="h-[260px]">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ left: -16, right: 8, top: 4 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke={dark ? "#262626" : "#f4f4f5"}
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fontSize: 10,
                        fill: dark ? "#525252" : "#a1a1aa",
                        fontFamily: "monospace",
                      }}
                      dy={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fontSize: 10,
                        fill: dark ? "#525252" : "#a1a1aa",
                        fontFamily: "monospace",
                      }}
                      tickFormatter={fmtNum}
                    />
                    <Tooltip
                      content={<TrafficTooltip dark={dark} />}
                      cursor={{ stroke: dark ? "#404040" : "#e4e4e7" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: "#4f46e5" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="visitors"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: "#22d3ee" }}
                      strokeDasharray="5 4"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full animate-pulse rounded-lg bg-neutral-50 dark:bg-neutral-800" />
              )}
            </div>
          </div>

          {/* Engagement wave — 1/3 width */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
            <SectionHeader
              title="Engagement wave"
              sub="Volume distribution over time"
            />
            <div className="h-[260px]">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ left: -16, right: 8, top: 4 }}
                  >
                    <defs>
                      <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#4f46e5"
                          stopOpacity={dark ? 0.25 : 0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4f46e5"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      stroke={dark ? "#262626" : "#f4f4f5"}
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fontSize: 10,
                        fill: dark ? "#525252" : "#a1a1aa",
                        fontFamily: "monospace",
                      }}
                      dy={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fontSize: 10,
                        fill: dark ? "#525252" : "#a1a1aa",
                        fontFamily: "monospace",
                      }}
                      tickFormatter={fmtNum}
                    />
                    <Tooltip
                      content={<TrafficTooltip dark={dark} />}
                      cursor={{ stroke: dark ? "#404040" : "#e4e4e7" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#4f46e5"
                      strokeWidth={1.5}
                      fill="url(#waveGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full animate-pulse rounded-lg bg-neutral-50 dark:bg-neutral-800" />
              )}
            </div>
          </div>
        </div>

        {/* ── MOST VISITED CONTENT ── */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <SectionHeader
            title="Most visited content"
            sub="Popular media resolved by incoming traffic"
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
            {/* Resolved list */}
            <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800">
              {current.topPages?.length ? (
                current.topPages.map((page, i) => {
                  const pct = Math.max(
                    5,
                    Math.round((page.count / maxPageViews) * 100),
                  );
                  return (
                    <div
                      key={i}
                      className="relative flex items-center justify-between px-4 py-3 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/60 transition-colors"
                    >
                      <div
                        className="absolute inset-y-0 left-0 bg-neutral-100/50 dark:bg-neutral-800/50 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="relative flex w-full items-center gap-3">
                        <span className="font-mono text-[10px] font-semibold text-neutral-300 dark:text-neutral-600 w-5 shrink-0 text-right">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <SmartPathDisplay path={page.path} />
                        <div className="shrink-0 flex items-center gap-2 pl-1">
                          <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                            {fmtNum(page.count)}
                          </span>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-300 dark:text-neutral-600">
                            views
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-neutral-400">
                  No page views for this period.
                </div>
              )}
            </div>

            {/* Horizontal mini bar chart */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Distribution
              </p>
              {current.topPages?.length ? (
                <MiniBarChart
                  pages={current.topPages}
                  maxCount={maxPageViews}
                />
              ) : (
                <div className="py-8 text-center text-xs text-neutral-400">
                  No data.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
