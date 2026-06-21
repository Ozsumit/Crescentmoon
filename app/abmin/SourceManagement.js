"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  Video,
  Tv,
  Moon,
  Sun,
  Info,
  Server,
  Activity,
  ArrowRight,
  Search,
  Check,
  AlertTriangle,
  Loader2,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { saveVideoSource, deleteVideoSource } from "./action";

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

// ─── FEATURE CONFIGURATION ────────────────────────────────────────────────────
const FEATURE_STYLES = {
  Recommended:
    "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  Fast: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "Multi-Language":
    "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  "Multi-sub":
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  "Clean UI":
    "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  Backup:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Ads: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const FeatureBadge = ({ label }) => {
  const cls =
    FEATURE_STYLES[label] ??
    "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide border ${cls}`}
    >
      {label}
    </span>
  );
};

// ─── FORM FIELD WRAPPER ───────────────────────────────────────────────────────
const Field = ({ label, children, span2 = false, info }) => (
  <div className={`flex flex-col gap-1.5 ${span2 ? "md:col-span-2" : ""}`}>
    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-50 flex items-center gap-1.5">
      {label}
      {info && (
        <span className="normal-case font-normal text-neutral-400 dark:text-neutral-500">
          ({info})
        </span>
      )}
    </span>
    {children}
  </div>
);

const inputCls =
  "w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1f1f23] text-neutral-900 dark:text-neutral-100 px-4 py-3 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all disabled:opacity-50";

// ─── STATIC METRIC CARD ───────────────────────────────────────────────────────
const MetricCard = ({ icon: Icon, value, label, subtext, colorClass }) => (
  <div className="bg-white dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-bold">
        {label}
      </span>
      <div className={`p-2 rounded-xl bg-opacity-10 ${colorClass}`}>
        <Icon size={16} />
      </div>
    </div>
    <div>
      <span className="text-3xl font-black text-neutral-900 dark:text-neutral-50 leading-none tracking-tight">
        {value}
      </span>
      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 font-medium">
        {subtext}
      </p>
    </div>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "",
  url: "",
  params: "",
  type: "movie",
  priority: 0,
  active: true,
  icon: "Play",
  features: [],
  description: "",
  paramStyle: "query",
};

const SourceManagement = ({ initialSources }) => {
  const [sources, setSources] = useState(initialSources || []);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { dark, toggle } = useTheme();

  // Dialog & Sandbox State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toast, setToast] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [sandboxActive, setSandboxActive] = useState(false);

  const dropdownRef = useRef(null);

  // Keep internal list in sync with initial values
  useEffect(() => {
    setSources(initialSources || []);
  }, [initialSources]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setSandboxActive(false);
  };

  const set = (key) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((f) => ({ ...f, [key]: val }));
    setSandboxActive(false); // Reset running test sandbox if fields alter
  };

  const toggleFeatureInForm = (feature) => {
    setFormData((f) => {
      const current = Array.isArray(f.features) ? f.features : [];
      const updated = current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature];
      return { ...f, features: updated };
    });
  };

  const handleEdit = (source) => {
    setEditingId(source.id);
    setFormData({
      ...source,
      features: Array.isArray(source.features) ? source.features : [],
    });
    setSandboxActive(false);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveVideoSource({
        ...formData,
        priority: Number(formData.priority),
        id: editingId,
      });

      if (res.success) {
        showToast(
          editingId ? "Video source updated" : "New video source created",
        );
        handleCancel();
      } else {
        showToast(res.error || "Failed to commit source path.", "error");
      }
    });
  };

  const handleDeleteTrigger = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    startTransition(async () => {
      const res = await deleteVideoSource(deleteConfirmId);
      if (res.success) {
        showToast("Source configuration removed");
        setDeleteConfirmId(null);
      } else {
        showToast(res.error || "Failed to delete connection node", "error");
      }
    });
  };

  const handleToggleActive = (source) => {
    startTransition(async () => {
      const res = await saveVideoSource({ ...source, active: !source.active });
      if (res.success) {
        showToast(`${source.name} status updated`);
      } else {
        showToast(res.error || "Failed to alter status code", "error");
      }
    });
  };

  // Simulated Endpoint Preview Router
  const getSimulatedURL = () => {
    const url = formData.url?.trim() || "";
    const params = formData.params?.trim() || "";
    const style = formData.paramStyle;
    const isMovie = formData.type === "movie";

    if (!url) return "";

    if (isMovie) {
      // Fight Club (TMDB: 550)
      switch (style) {
        case "path-slash":
        case "path-hyphen-mapi":
          return `${url}${url.endsWith("/") ? "" : "/"}550`;
        default:
          return `${url}${url.endsWith("/") ? "" : "/"}550${params}`;
      }
    } else {
      // Game of Thrones (TMDB: 1399), Season 1, Episode 1
      switch (style) {
        case "path-hyphen-mapi":
          return `${url}${url.endsWith("/") ? "" : "/"}1399-1-1`;
        case "cinesrc":
          return `${url}${url.endsWith("/") ? "" : "/"}1399?s=1&e=1`;
          break;
        case "path-hyphen-mapi":
          return `${url}${url.endsWith("/") ? "" : "/"}1399-1-1`;
        default:
          return `${url}${url.endsWith("/") ? "" : "/"}1399/1/1`;
      }
    }
  };

  // Client-Side Fuzzy Filtering
  const filtered = sources
    .filter((s) => {
      if (filter === "all") return true;
      return s.type === filter;
    })
    .filter((s) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(query) ||
        s.url.toLowerCase().includes(query) ||
        s.features?.some((f) => f.toLowerCase().includes(query))
      );
    });

  const totalActive = sources.filter((s) => s.active).length;
  const activeMovies = sources.filter(
    (s) => s.active && s.type === "movie",
  ).length;
  const activeTV = sources.filter((s) => s.active && s.type === "tv").length;

  return (
    <div className={dark ? "dark" : ""}>
      <section className="mt-12 bg-transparent transition-colors duration-200">
        {/* ── HEADER ── */}
        <header className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">
              Video Source Manager
            </h2>
            <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-0.5">
              Control connection routes, endpoints, and attributes globally
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-[200px] transition-all"
              />
            </div>

            {/* filter pills */}
            <div className="inline-flex rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-[#161618] p-1 gap-0.5">
              {["all", "movie", "tv"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                    filter === f
                      ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm"
                      : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* dark mode Toggle */}
            <button
              onClick={toggle}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all shadow-sm"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* trigger form */}
            <button
              onClick={() => {
                setIsAdding(true);
                setEditingId(null);
                resetForm();
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 h-10 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/10 active:scale-95"
            >
              <Plus size={16} /> Add Source
            </button>
          </div>
        </header>

        {/* ── STATS ANALYTICS BAR ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={Server}
            value={sources.length}
            label="Total Resources"
            subtext="Available system API nodes"
            colorClass="bg-indigo-500/10 text-indigo-500"
          />
          <MetricCard
            icon={Activity}
            value={`${totalActive}/${sources.length}`}
            label="Active Connections"
            subtext="Currently serving active routes"
            colorClass="bg-emerald-500/10 text-emerald-500"
          />
          <MetricCard
            icon={Video}
            value={activeMovies}
            label="Active Movie Nodes"
            subtext="Dedicated endpoints for movies"
            colorClass="bg-sky-500/10 text-sky-500"
          />
          <MetricCard
            icon={Tv}
            value={activeTV}
            label="Active TV Series"
            subtext="Dedicated TV episodic endpoints"
            colorClass="bg-violet-500/10 text-violet-500"
          />
        </div>

        {/* ── CARDS GRID LAYOUT ── */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((s) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={s.id}
                className={`group bg-white dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col justify-between overflow-hidden
                  ${!s.active && "opacity-60 saturate-50 bg-neutral-50/50 dark:bg-[#161618]/40"}`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-500" />

                {/* Top Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border
                        ${
                          s.type === "movie"
                            ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/10"
                            : "bg-sky-500/10 text-sky-500 border-sky-500/10"
                        }
                      `}
                      >
                        {s.type === "movie" ? (
                          <Video size={14} />
                        ) : (
                          <Tv size={14} />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                        {s.type === "movie" ? "Movie Player" : "TV Episodic"}
                      </span>
                    </div>

                    {/* Status badge & Pulse */}
                    <button
                      onClick={() => handleToggleActive(s)}
                      disabled={isPending}
                      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border disabled:opacity-50
                        ${
                          s.active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
                            : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 border-neutral-200 dark:border-neutral-700"
                        }
                      `}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full block ${s.active ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"}`}
                      />
                      {s.active ? "Active" : "Inactive"}
                    </button>
                  </div>

                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight group-hover:text-indigo-400 transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-600 truncate mt-1">
                    {s.url}
                  </p>

                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-3 line-clamp-2 min-h-[32px] leading-relaxed font-medium">
                    {s.description ||
                      "No developer notes or descriptive features configured."}
                  </p>
                </div>

                {/* Bottom Section */}
                <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800/60 flex flex-col gap-3.5">
                  {/* Badge tags */}
                  <div className="flex flex-wrap gap-1">
                    {(s.features || []).slice(0, 3).map((f) => (
                      <FeatureBadge key={f} label={f} />
                    ))}
                    {(s.features || []).length === 0 && (
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-600 font-bold">
                        No tagged flags
                      </span>
                    )}
                  </div>

                  {/* Settings Bar */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 dark:text-neutral-600 flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                      PRIORITY: {String(s.priority).padStart(3, "0")}
                    </span>

                    {/* Actions */}
                    <div className="flex gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(s)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-500 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all"
                        aria-label="Edit node settings"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteTrigger(s.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                        aria-label="Delete resource node"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && searchQuery.trim() && (
            <div className="col-span-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] rounded-2xl p-16 text-center text-neutral-400 dark:text-neutral-500 text-sm font-medium">
              No results matching "{searchQuery}"
            </div>
          )}
        </motion.div>
      </section>

      {/* ── EDIT / CREATE SLIDE-OVER DRAWER (Framer Motion) ── */}
      <AnimatePresence>
        {(isAdding || editingId) && (
          <>
            {/* Backdrop Cover Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            {/* Sidebar Slide-Over Sheet Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white dark:bg-[#161618] border-l border-neutral-200 dark:border-neutral-800 shadow-2xl z-[101] overflow-y-auto custom-scrollbar p-6 flex flex-col justify-between"
            >
              {/* Form Content Block */}
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                      {editingId
                        ? "Update Endpoint Config"
                        : "Create Endpoint Node"}
                    </h3>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 font-light">
                      Configure dynamic route parameters and custom meta tags
                    </p>
                  </div>
                  <button
                    onClick={handleCancel}
                    disabled={isPending}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 p-2 rounded-xl transition-all disabled:opacity-50"
                  >
                    <X size={15} />
                  </button>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <fieldset disabled={isPending} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Node Name" info="For tab selection">
                        <input
                          className={inputCls}
                          type="text"
                          placeholder="e.g. VidLink"
                          value={formData.name}
                          onChange={set("name")}
                          required
                        />
                      </Field>

                      <Field label="Media Scope" info="Routing system type">
                        <select
                          className={inputCls}
                          value={formData.type}
                          onChange={set("type")}
                        >
                          <option value="movie">Movie Container</option>
                          <option value="tv">TV Series Node</option>
                        </select>
                      </Field>
                    </div>

                    <Field
                      label="Base API Url"
                      info="Address of resource player"
                    >
                      <input
                        className={inputCls}
                        type="text"
                        placeholder="e.g. https://vidlink.pro/tv/"
                        value={formData.url}
                        onChange={set("url")}
                        required
                      />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="Routing Priority"
                        info="Lower resolves first"
                      >
                        <input
                          className={inputCls}
                          type="number"
                          value={formData.priority}
                          onChange={set("priority")}
                          min={0}
                        />
                      </Field>

                      <Field
                        label="Icon Token Symbol"
                        info="Lucide component keyword"
                      >
                        <input
                          className={inputCls}
                          type="text"
                          placeholder="Play, Crown, Server, Webhook"
                          value={formData.icon}
                          onChange={set("icon")}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="Dynamic Query params"
                        info="Appended modifiers"
                      >
                        <input
                          className={inputCls}
                          type="text"
                          placeholder="e.g. ?primaryColor=indigo"
                          value={formData.params}
                          onChange={set("params")}
                        />
                      </Field>

                      <Field
                        label="Dynamic Format Style"
                        info="Endpoint routing style"
                      >
                        <select
                          className={inputCls}
                          value={formData.paramStyle}
                          onChange={set("paramStyle")}
                        >
                          <option value="query">Query param (?id=)</option>
                          <option value="path-slash">
                            Segment slash (/id)
                          </option>
                          <option value="path-hyphen-mapi">
                            Hyphen MAPI (/id-season-ep)
                          </option>
                          <option value="cinesrc">Cinesrc (?id=)</option>
                        </select>
                      </Field>
                    </div>

                    {/* Features Tag selector */}
                    <Field
                      label="Custom Server Attributes"
                      info="Apply specific highlight flags"
                    >
                      <div className="flex flex-wrap gap-1.5 p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800">
                        {Object.keys(FEATURE_STYLES).map((feature) => {
                          const isSelected =
                            Array.isArray(formData.features) &&
                            formData.features.includes(feature);
                          return (
                            <button
                              type="button"
                              key={feature}
                              onClick={() => toggleFeatureInForm(feature)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all select-none
                                ${
                                  isSelected
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                                    : "bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                                }
                              `}
                            >
                              {feature}
                            </button>
                          );
                        })}
                      </div>
                    </Field>

                    <Field
                      label="Developer Description Notes"
                      info="Brief internal logs"
                    >
                      <textarea
                        className={`${inputCls} resize-none`}
                        rows={2}
                        placeholder="Purpose or limits of this streaming path..."
                        value={formData.description}
                        onChange={set("description")}
                      />
                    </Field>
                  </fieldset>
                </form>

                {/* ── LIVE INTERACTIVE SANDBOX PREVIEW PANEL ── */}
                {formData.url && (
                  <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-neutral-50 dark:bg-neutral-900/60 shadow-inner">
                    {/* Simulated macOS Header Bar */}
                    <div className="flex items-center justify-between px-4 py-2 bg-neutral-100 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block shrink-0" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block shrink-0" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block shrink-0" />
                      </div>
                      <div className="max-w-[280px] w-full bg-white dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800/60 rounded-md py-1 px-3 text-[9px] font-mono text-neutral-400 dark:text-neutral-500 truncate text-center select-all">
                        {getSimulatedURL()}
                      </div>
                      <div className="w-10 text-right">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider bg-white dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.5 rounded">
                          {formData.type}
                        </span>
                      </div>
                    </div>

                    {/* Test Iframe Content Screen */}
                    <div className="aspect-video bg-black relative flex flex-col items-center justify-center">
                      <AnimatePresence mode="wait">
                        {sandboxActive ? (
                          <iframe
                            key="test-frame"
                            src={getSimulatedURL()}
                            className="w-full h-full border-0 absolute inset-0 z-10 bg-black"
                            allowFullScreen
                            title="Interactive Sandbox preview"
                          />
                        ) : (
                          <motion.div
                            key="test-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center p-6 flex flex-col items-center justify-center gap-3 z-0"
                          >
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-md">
                              <Play size={16} className="fill-current ml-0.5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">
                                Sandbox Connection Test
                              </h4>
                              <p className="text-[10px] text-neutral-400 max-w-[260px] leading-relaxed mt-1">
                                Verifies routing using simulated TMDB
                                credentials (Fight Club for movies, Game of
                                Thrones S1:E1 for TV shows).
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSandboxActive(true)}
                              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md shadow-indigo-600/10 active:scale-95 transition-all mt-1"
                            >
                              Run Connection Test
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Sandbox Warnings note footer */}
                    <div className="p-3 bg-neutral-100/30 dark:bg-neutral-800/20 border-t border-neutral-200 dark:border-neutral-800 text-[10px] text-neutral-400 dark:text-neutral-500 leading-relaxed flex items-start gap-2">
                      <Info
                        size={13}
                        className="text-indigo-400 shrink-0 mt-0.5"
                      />
                      <span>
                        Some third-party frame headers may prevent inside-domain
                        execution due to strict browser CORS protections
                        (X-Frame-Options: SAMEORIGIN).
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Bottom Operations Block */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between mt-6 bg-white dark:bg-[#161618]">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() =>
                      !isPending &&
                      setFormData((f) => ({ ...f, active: !f.active }))
                    }
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${formData.active ? "bg-indigo-600" : "bg-neutral-300 dark:bg-neutral-600"} ${isPending && "opacity-50"}`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${formData.active ? "translate-x-4" : "translate-x-0"}`}
                    />
                  </div>
                  <span className="text-xs text-neutral-600 dark:text-neutral-300 font-bold uppercase tracking-wider">
                    Active
                  </span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-4 h-10 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="flex items-center gap-2 px-5 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Save size={13} />
                    )}
                    Save Config
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── CUSTOM DIALOG confirmation MODAL ── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-2xl z-[121]"
            >
              <div className="flex items-center gap-3 text-rose-500 mb-4">
                <AlertTriangle size={24} />
                <h4 className="font-extrabold text-sm uppercase tracking-wide">
                  Delete Source
                </h4>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                Are you sure you want to delete this video source configuration?
                This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── SYSTEM TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className={`fixed bottom-6 left-1/2 z-[130] border px-5 py-3 rounded-full shadow-2xl font-bold text-xs flex items-center gap-3 min-w-[280px] justify-center
              ${
                toast.type === "error"
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              }
            `}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 
              ${toast.type === "error" ? "bg-rose-500/25" : "bg-emerald-500/25"}`}
            >
              {toast.type === "error" ? (
                <AlertTriangle size={12} />
              ) : (
                <Check size={12} strokeWidth={3} />
              )}
            </div>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default SourceManagement;
