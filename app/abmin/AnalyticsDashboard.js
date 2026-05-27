"use client";

import { useMemo, useState } from "react";
import {
  Users,
  Eye,
  TrendingUp,
  Activity,
  Globe,
  ExternalLink,
} from "lucide-react";

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

export default function AnalyticsDashboard({ data }) {
  const [timeframe, setTimeframe] = useState("24h");

  // Extract current timeframe data
  const currentData = useMemo(() => {
    return data?.[timeframe] || {};
  }, [data, timeframe]);

  // Use historical chart data directly from backend payload if available
  const chartData = useMemo(() => {
    if (currentData.history && Array.isArray(currentData.history)) {
      return currentData.history;
    }
    if (currentData.chartData && Array.isArray(currentData.chartData)) {
      return currentData.chartData;
    }

    // Default structural fallback if historical trend is loading or missing
    const defaultData = {
      "24h": [
        { name: "12 AM", views: 0, visitors: 0 },
        { name: "4 AM", views: 0, visitors: 0 },
        { name: "8 AM", views: 0, visitors: 0 },
        { name: "12 PM", views: 0, visitors: 0 },
        { name: "4 PM", views: 0, visitors: 0 },
        { name: "8 PM", views: 0, visitors: 0 },
      ],
      "7d": [
        { name: "Mon", views: 0, visitors: 0 },
        { name: "Tue", views: 0, visitors: 0 },
        { name: "Wed", views: 0, visitors: 0 },
        { name: "Thu", views: 0, visitors: 0 },
        { name: "Fri", views: 0, visitors: 0 },
        { name: "Sat", views: 0, visitors: 0 },
        { name: "Sun", views: 0, visitors: 0 },
      ],
      "30d": [
        { name: "W1", views: 0, visitors: 0 },
        { name: "W2", views: 0, visitors: 0 },
        { name: "W3", views: 0, visitors: 0 },
        { name: "W4", views: 0, visitors: 0 },
      ],
      "1y": [
        { name: "Q1", views: 0, visitors: 0 },
        { name: "Q2", views: 0, visitors: 0 },
        { name: "Q3", views: 0, visitors: 0 },
        { name: "Q4", views: 0, visitors: 0 },
      ],
    };

    return defaultData[timeframe] || [];
  }, [currentData, timeframe]);

  // Calculate dynamic statistics
  const pageViews = currentData.pageViews ?? 0;
  const uniqueVisitors = currentData.uniqueVisitors ?? 0;
  const avgViews =
    uniqueVisitors > 0 ? (pageViews / uniqueVisitors).toFixed(1) : "0.0";
  const topPagesCount = currentData.topPages?.length ?? 0;

  // Maximum count for normalizing bar fills
  const maxPageViews = useMemo(() => {
    if (!currentData.topPages || currentData.topPages.length === 0) return 1;
    return Math.max(...currentData.topPages.map((p) => p.count));
  }, [currentData.topPages]);

  // Custom tooltips to replace raw Recharts tooltips
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-md backdrop-blur-sm">
          <p className="text-xs font-semibold text-neutral-500 mb-1.5">
            {label}
          </p>
          <div className="space-y-1">
            {payload.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-4"
              >
                <span className="flex items-center gap-1.5 text-xs text-neutral-600">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: item.stroke || item.fill }}
                  />
                  {item.name === "views" ? "Views" : "Visitors"}
                </span>
                <span className="text-xs font-semibold text-neutral-900">
                  {item.value.toLocaleString()}
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
            {typeof value === "number" ? value.toLocaleString() : value}
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

        <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-1 self-start">
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
        {/* TRAFFIC TREND */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-5 md:p-6 shadow-sm">
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
          </div>
        </div>

        {/* AREA SUMMARY */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-neutral-900">
              Engagement Wave
            </h3>
            <p className="text-xs text-neutral-500">
              Volume distribution over time
            </p>
          </div>

          <div className="h-[300px] w-full">
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
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#4f46e5"
                  fill="url(#viewsGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TOP PAGES */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-neutral-900">
            Most Visited Pages
          </h3>
          <p className="text-xs text-neutral-500">
            Popular paths resolved by incoming traffic
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          {/* POLISHED LIST WITH EMBEDDED PROGRESS BARS */}
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
                      {/* Visual progress track behind row text */}
                      <div
                        className="absolute bottom-0 left-0 top-0 bg-neutral-100/60 transition-all duration-500"
                        style={{ width: `${percentage}%`, zIndex: 0 }}
                      />

                      <div className="relative z-10 flex items-center gap-2 font-mono text-xs text-neutral-700 max-w-[70%] truncate">
                        <span className="text-[10px] font-bold text-neutral-400">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="truncate" title={page.path}>
                          {page.path}
                        </span>
                      </div>

                      <div className="relative z-10 flex items-center gap-3 pl-2">
                        <span className="text-sm font-semibold text-neutral-900">
                          {page.count.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase">
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
                <Tooltip
                  cursor={{ fill: "#fcfcfc" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-neutral-200 bg-white p-2.5 shadow-sm">
                          <p className="font-mono text-[11px] text-neutral-500">
                            {payload[0].payload.path}
                          </p>
                          <p className="mt-1 text-xs font-bold text-neutral-900">
                            {payload[0].value.toLocaleString()} Views
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  fill="#4f46e5"
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
