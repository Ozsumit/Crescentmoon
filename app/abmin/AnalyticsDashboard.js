"use client";

import { useState } from "react";
import { Users, Eye, TrendingUp, Calendar } from "lucide-react";

export default function AnalyticsDashboard({ data }) {
  const [timeframe, setTimeframe] = useState("24h");
  const currentData = data[timeframe];

  const StatCard = ({ icon: Icon, label, value, subtext }) => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="p-3 bg-neutral-50 rounded-2xl text-neutral-900">
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          {timeframe}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-500 mb-1">{label}</p>
        <h3 className="text-3xl font-black tracking-tighter text-neutral-900">
          {value.toLocaleString()}
        </h3>
        {subtext && <p className="text-[11px] text-neutral-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 mb-12">
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          {["24h", "7d", "30d", "1y"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                timeframe === t
                  ? "bg-white text-black shadow-lg"
                  : "text-neutral-500 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Eye}
          label="Total Page Views"
          value={currentData.pageViews}
          subtext="Raw interactions recorded"
        />
        <StatCard
          icon={Users}
          label="Unique Visitors"
          value={currentData.uniqueVisitors}
          subtext="Based on unique device IDs"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Views / Visitor"
          value={
            currentData.uniqueVisitors > 0
              ? (currentData.pageViews / currentData.uniqueVisitors).toFixed(1)
              : 0
          }
          subtext="Interaction depth"
        />
      </div>

      {/* Top Pages Table */}
      <div className="bg-white rounded-[2rem] p-8 shadow-2xl overflow-hidden border border-neutral-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-neutral-900 text-white rounded-xl">
            <Calendar size={16} />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">Most Visited Pages</h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-neutral-400 text-[11px] uppercase tracking-[0.2em]">
              <th className="pb-6 font-semibold">Path</th>
              <th className="pb-6 font-semibold text-right">Views</th>
            </tr>
          </thead>
          <tbody className="text-neutral-900">
            {currentData.topPages.length > 0 ? (
              currentData.topPages.map((page, i) => (
                <tr
                  key={i}
                  className="group border-t border-neutral-100 hover:bg-neutral-50 transition-colors"
                >
                  <td className="py-5 font-mono text-xs text-neutral-600 truncate max-w-xs">
                    {page.path}
                  </td>
                  <td className="py-5 text-right font-black tracking-tight">
                    {page.count.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="py-8 text-center text-neutral-400 text-sm italic">
                  No data available for this timeframe
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
