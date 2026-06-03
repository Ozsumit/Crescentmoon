"use client";

import React, { useState } from "react";
import {
  Plus, Trash2, Edit2, Save, X, Eye, EyeOff,
  Video, Tv, Moon, Sun, ChevronUp, ChevronDown,
} from "lucide-react";
import { saveVideoSource, deleteVideoSource } from "./action";

// ─── DEFAULT DATA (unchanged) ─────────────────────────────────────────────────
const defaultMovieSources = [
  { name:"vidking", url:"https://www.vidking.net/embed/movie/", params:"?color=c3f0c2&icons=default&autoplay=true&nextbutton=true", icon:"Crown", features:["Recommended","Fast"], description:"Fast loading with a modern player.", type:"movie", priority:100, active:true, paramStyle:"query" },
  { name:"VidLink", url:"https://vidlink.pro/movie/", params:"?primaryColor=6a5fef&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=jw&title=true&poster=true&autoplay=true&nextbutton=true", icon:"Play", features:["Recommended","Fast"], description:"Fast loading with a modern player.", type:"movie", priority:95, active:true, paramStyle:"query" },
  { name:"VidAPI", url:"https://vaplayer.ru/embed/movie/", params:"?skin=cinematic", icon:"Webhook", features:["Recommended","Fast"], description:"Fast loading with a modern player.", type:"movie", priority:90, active:true, paramStyle:"query" },
  { name:"VidSrc", url:"https://v2.vidsrc.me/embed/movie/", params:"?multiLang=true", icon:"Languages", features:["Multi-Language"], description:"Good source for non-English audio.", type:"movie", priority:85, active:true, paramStyle:"query" },
  { name:"MoviesAPI", url:"https://moviesapi.club/movie/", params:"?multiLang=true", icon:"List", features:["Multi-Language","Fast"], description:"A reliable alternative with good subtitle support.", type:"movie", priority:80, active:true, paramStyle:"query" },
  { name:"videasy", url:"https://player.videasy.net/movie/", params:"?multiLang=true", icon:"Clapperboard", features:["Multi-sub","Clean UI"], description:"Features a clean player with multiple subtitle choices.", type:"movie", priority:75, active:true, paramStyle:"query" },
  { name:"Vidsrc 2", url:"https://vidsrc.net/embed/movie/", params:"?multiLang=true", icon:"Server", features:["Multi-Language","Backup"], description:"A secondary backup source for language options.", type:"movie", priority:70, active:true, paramStyle:"query" },
  { name:"VidSrc 3", url:"https://vidsrc.icu/embed/movie/", params:"?multiLang=true", icon:"Languages", features:["Multi-Language","Backup"], description:"Alternative source for subtitles.", type:"movie", priority:65, active:true, paramStyle:"query" },
  { name:"VidSrc 4", url:"https://player.vidsrc.co/embed/movie/", params:"?autoplay=true&autonext=true&nextbutton=true&poster=true&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&fontcolor=FFFFFF&fontsize=16px&opacity=0.5&font=Poppins", icon:"Clapperboard", features:[], download:true, description:"A reliable classic player.", type:"movie", priority:60, active:true, paramStyle:"query" },
  { name:"2Embed", url:"https://2embed.cc/embed/movie/", icon:"Film", features:["Ads"], params:"?multiLang=true", description:"May have more pop-up ads.", type:"movie", priority:55, active:true, paramStyle:"query" },
  { name:"Binge", url:"https://vidbinge.dev/embed/movie/", icon:"Zap", features:["Fast"], parseUrl:true, description:"Quick-loading, lightweight player.", type:"movie", priority:50, active:true, paramStyle:"query" },
];

const DEFAULT_TV_SOURCES = [
  { name:"vidking", url:"https://www.vidking.net/embed/tv/", paramStyle:"path-slash", icon:"Crown", features:["Recommended","Fast"], description:"Fast loading with a modern player.", type:"tv", priority:100, active:true, params:"" },
  { name:"VidLink", url:"https://vidlink.pro/tv/", paramStyle:"path-slash", icon:"Play", features:["Recommended"], description:"Fast loading with a modern player.", type:"tv", priority:95, active:true, params:"" },
  { name:"VidAPI", url:"https://vaplayer.ru/embed/tv/", paramStyle:"path-slash", icon:"Webhook", features:["Recommended"], description:"Fast loading with a modern player.", type:"tv", priority:90, active:true, params:"" },
  { name:"VidSrc", url:"https://v2.vidsrc.me/embed/tv/", paramStyle:"path-slash", icon:"Languages", features:["Multi-Language"], description:"Good for non-English audio.", type:"tv", priority:85, active:true, params:"" },
  { name:"MoviesAPI", url:"https://moviesapi.club/tv/", paramStyle:"path-hyphen-mapi", icon:"List", features:["Multi-Language"], description:"Reliable alternative.", type:"tv", priority:80, active:true, params:"" },
  { name:"videasy", url:"https://player.videasy.net/tv/", paramStyle:"path-slash", icon:"Clapperboard", features:["Multi-sub"], description:"Clean player with subtitle choices.", type:"tv", priority:75, active:true, params:"" },
  { name:"Vidsrc 2", url:"https://vidsrc.to/embed/tv/", paramStyle:"path-slash", icon:"Server", features:["Backup"], description:"Secondary backup source.", type:"tv", priority:70, active:true, params:"" },
  { name:"2Embed", url:"https://2embed.cc/embed/tv/", paramStyle:"path-slash", icon:"ShieldAlert", features:["Ads"], description:"Adblocker is highly recommended.", type:"tv", priority:65, active:true, params:"" },
];

// ─── THEME HOOK ───────────────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("sm-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const toggle = () =>
    setDark((d) => {
      const next = !d;
      localStorage.setItem("sm-theme", next ? "dark" : "light");
      return next;
    });
  return { dark, toggle };
}

// ─── FEATURE BADGE ────────────────────────────────────────────────────────────
const FEATURE_STYLES = {
  Recommended: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300",
  Fast:        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
  "Multi-Language": "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300",
  "Multi-sub": "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
  "Clean UI":  "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300",
  Backup:      "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300",
  Ads:         "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300",
};

const FeatureBadge = ({ label }) => {
  const cls = FEATURE_STYLES[label] ?? "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide ${cls}`}>
      {label}
    </span>
  );
};

// ─── FORM FIELD ───────────────────────────────────────────────────────────────
const Field = ({ label, children, span2 = false }) => (
  <label className={`flex flex-col gap-1.5 ${span2 ? "md:col-span-2" : ""}`}>
    <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{label}</span>
    {children}
  </label>
);

const inputCls =
  "w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-4 py-2.5 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition";

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <tr>
    <td colSpan={5} className="py-16 text-center text-neutral-400 dark:text-neutral-600 text-sm">
      No sources yet — add one above.
    </td>
  </tr>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "", url: "", params: "", type: "movie",
  priority: 0, active: true, icon: "Play",
  features: "", description: "", paramStyle: "query",
};

const SourceManagement = ({ initialSources }) => {
  const [sources] = useState(initialSources || []);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState("all"); // all | movie | tv
  const { dark, toggle } = useTheme();

  const resetForm = () => setFormData(EMPTY_FORM);

  const set = (key) => (e) =>
    setFormData((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleEdit = (source) => {
    setEditingId(source.id);
    setFormData({ ...source, features: Array.isArray(source.features) ? source.features.join(", ") : source.features || "" });
    setIsAdding(false);
  };

  const handleCancel = () => { setEditingId(null); setIsAdding(false); resetForm(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveVideoSource({
      ...formData,
      priority: Number(formData.priority),
      features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
      id: editingId,
    });
    window.location.reload();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this source?")) return;
    await deleteVideoSource(id);
    window.location.reload();
  };

  const handleToggleActive = async (source) => {
    await saveVideoSource({ ...source, active: !source.active });
    window.location.reload();
  };

  const filtered = filter === "all" ? sources : sources.filter((s) => s.type === filter);

  return (
    <div className={dark ? "dark" : ""}>
    <section className="mt-12 bg-transparent transition-colors duration-200">

      {/* ── HEADER ── */}
      <header className="flex justify-between items-end mb-8 gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Video Sources
          </h2>
          <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-0.5 font-light">
            Manage movie &amp; TV providers
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* type filter */}
          <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-1 gap-0.5">
            {["all","movie","tv"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase font-mono tracking-wide transition-all ${
                  filter === f
                    ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                    : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* theme toggle */}
          <button
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all shadow-sm"
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* add button */}
          <button
            onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <Plus size={15} />
            Add Source
          </button>
        </div>
      </header>

      {/* ── FORM PANEL ── */}
      {(isAdding || editingId) && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {editingId ? "Edit source" : "Add new source"}
            </h3>
            <button onClick={handleCancel} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name">
              <input className={inputCls} type="text" placeholder="e.g. VidLink" value={formData.name} onChange={set("name")} />
            </Field>

            <Field label="Type">
              <select className={inputCls} value={formData.type} onChange={set("type")}>
                <option value="movie">Movie</option>
                <option value="tv">TV</option>
              </select>
            </Field>

            <Field label="URL" span2>
              <input className={inputCls} type="text" placeholder="https://..." value={formData.url} onChange={set("url")} />
            </Field>

            <Field label="Params">
              <input className={inputCls} type="text" placeholder="?key=val" value={formData.params} onChange={set("params")} />
            </Field>

            <Field label="Param style">
              <select className={inputCls} value={formData.paramStyle} onChange={set("paramStyle")}>
                <option value="query">Query</option>
                <option value="path-slash">Path slash</option>
                <option value="path-hyphen-mapi">Path hyphen MAPI</option>
              </select>
            </Field>

            <Field label="Priority">
              <input className={inputCls} type="number" value={formData.priority} onChange={set("priority")} />
            </Field>

            <Field label="Icon">
              <input className={inputCls} type="text" placeholder="Play" value={formData.icon} onChange={set("icon")} />
            </Field>

            <Field label="Features (comma-separated)" span2>
              <input className={inputCls} type="text" placeholder="Fast, Multi-Language" value={formData.features} onChange={set("features")} />
            </Field>

            <Field label="Description" span2>
              <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Brief description…" value={formData.description} onChange={set("description")} />
            </Field>

            <div className="md:col-span-2 flex items-center justify-between pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => setFormData((f) => ({ ...f, active: !f.active }))}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${formData.active ? "bg-indigo-600" : "bg-neutral-300 dark:bg-neutral-600"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${formData.active ? "translate-x-4" : "translate-x-0"}`} />
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">Active</span>
              </label>

              <div className="flex gap-3">
                <button type="button" onClick={handleCancel} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
                  <X size={14} /> Cancel
                </button>
                <button type="submit" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-sm">
                  <Save size={14} /> Save source
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── TABLE ── */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800">
              {["Priority","Source","Features","Status",""].map((h, i) => (
                <th key={i} className={`px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500 ${i === 4 ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-neutral-50 dark:border-neutral-800/60 last:border-0 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors group"
                >
                  {/* priority */}
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-semibold text-neutral-400 dark:text-neutral-500 tabular-nums">
                      {String(s.priority).padStart(3, "0")}
                    </span>
                  </td>

                  {/* source */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        s.type === "movie"
                          ? "bg-indigo-50 text-indigo-500 dark:bg-indigo-950 dark:text-indigo-400"
                          : "bg-sky-50 text-sky-500 dark:bg-sky-950 dark:text-sky-400"
                      }`}>
                        {s.type === "movie" ? <Video size={14} /> : <Tv size={14} />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 leading-tight">{s.name}</div>
                        <div className="text-[10px] text-neutral-400 dark:text-neutral-600 truncate max-w-[200px] font-mono mt-0.5">{s.url}</div>
                      </div>
                    </div>
                  </td>

                  {/* features */}
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(s.features || []).map((f) => <FeatureBadge key={f} label={f} />)}
                    </div>
                  </td>

                  {/* status */}
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggleActive(s)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        s.active
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900"
                          : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-500 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {s.active ? <Eye size={11} /> : <EyeOff size={11} />}
                      {s.active ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* actions */}
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(s)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 dark:hover:text-indigo-400 transition-all"
                        aria-label="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 dark:hover:text-rose-400 transition-all"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* table footer */}
        <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {filtered.length} source{filtered.length !== 1 ? "s" : ""}{filter !== "all" ? ` · ${filter}` : ""}
          </span>
          <span className="text-[11px] text-neutral-300 dark:text-neutral-700 font-mono">
            {sources.filter(s => s.active).length}/{sources.length} active
          </span>
        </div>
      </div>

    </section>
    </div>
  );
};

export default SourceManagement;