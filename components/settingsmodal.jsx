"use client";

import React, { useEffect, useState } from "react";
import useSettingsStore from "@/components/settings-store";
import { SITE_THEMES } from "@/lib/themes";
import { getVideoSources } from "@/lib/video-sources";
import {
  Palette,
  Server,
  MousePointer2,
  AlertTriangle,
  RotateCcw,
  Check,
  Monitor,
  Tv,
  MessageSquare,
  Loader2,
  X,
  Sliders,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SettingsModal = ({ isOpen, onClose }) => {
  const settings = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [activeTab, setActiveTab] = useState("theming");

  // Dynamic server sources state
  const [movieServers, setMovieServers] = useState([]);
  const [tvServers, setTvServers] = useState([]);
  const [loadingServers, setLoadingServers] = useState(true);

  useEffect(() => {
    setMounted(true);

    if (!isOpen) return;

    // Fetch dynamic video sources from the database on modal mount
    const fetchServers = async () => {
      try {
        const [movies, tv] = await Promise.all([
          getVideoSources("movie"),
          getVideoSources("tv"),
        ]);
        setMovieServers(movies || []);
        setTvServers(tv || []);
      } catch (error) {
        console.error("Failed to load dynamic video sources:", error);
      } finally {
        setLoadingServers(false);
      }
    };

    fetchServers();
  }, [isOpen]);

  // Lock body scroll when open and listen for Esc key
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const handleReset = () => {
    settings.resetSettings();
    triggerToast();
  };

  const triggerToast = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const ToggleCard = ({ title, description, value, onToggle, icon: Icon }) => (
    <div
      className="group flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-all cursor-pointer"
      onClick={() => {
        onToggle(!value);
        triggerToast();
      }}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              value
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Icon size={18} />
          </div>
        )}
        <div>
          <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {description}
          </p>
        </div>
      </div>
      <div
        className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${
          value ? "bg-primary" : "bg-muted"
        }`}
      >
        <motion.div
          animate={{ x: value ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 left-0 w-4 h-4 bg-background rounded-full shadow-lg"
        />
      </div>
    </div>
  );

  const tabs = [
    { id: "theming", label: "Theming", icon: Palette },
    { id: "servers", label: "Servers", icon: Server },
    { id: "interface", label: "Interface & Player", icon: Monitor },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
  ];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[150] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        {/* Modal Outer Container */}
        <div
          className="relative w-full max-w-3xl bg-background border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20 shrink-0">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Settings & Preferences
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Close Settings"
            >
              <X size={18} />
            </button>
          </div>

          {/* Main Body (Sidebar + Tab Area) */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[380px]">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-border bg-muted/10 p-3 flex md:flex-col gap-1.5 overflow-x-auto shrink-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <div className="hidden md:block mt-auto pt-4 border-t border-border/50">
                <button
                  onClick={handleReset}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <RotateCcw size={14} />
                  Reset Defaults
                </button>
              </div>
            </div>

            {/* Scrollable Tab Content Container */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* THEMING TAB */}
              {activeTab === "theming" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-1">
                      Site Themes
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Customize the primary look and palette of Cmoon.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.keys(SITE_THEMES).map((themeKey) => {
                      const theme = SITE_THEMES[themeKey];
                      const isActive = settings.siteTheme === themeKey;
                      return (
                        <button
                          key={themeKey}
                          onClick={() => {
                            settings.setSiteTheme(themeKey);
                            triggerToast();
                          }}
                          className={`group relative p-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            isActive
                              ? "border-primary bg-primary/10 scale-105"
                              : "border-border bg-muted/50 hover:border-primary/50"
                          }`}
                        >
                          <div
                            className="w-full aspect-video rounded-lg border border-border overflow-hidden flex"
                            style={{
                              background: `hsl(${theme.colors.background})`,
                            }}
                          >
                            <div
                              className="w-1/3 h-full"
                              style={{
                                background: `hsl(${theme.colors.primary})`,
                              }}
                            />
                            <div
                              className="w-1/3 h-full"
                              style={{
                                background: `hsl(${theme.colors.secondary})`,
                              }}
                            />
                            <div
                              className="w-1/3 h-full"
                              style={{
                                background: `hsl(${theme.colors.accent})`,
                              }}
                            />
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-tight ${
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground group-hover:text-foreground"
                            }`}
                          >
                            {theme.name}
                          </span>
                          {isActive && (
                            <div className="absolute -top-1.5 -right-1.5 bg-primary rounded-full p-0.5 shadow-lg">
                              <Check
                                size={10}
                                className="text-primary-foreground"
                              />
                            </div>
                          )}
                        </button>
                      );
                    })}

                    {/* Custom Theme Option */}
                    <button
                      onClick={() => {
                        settings.setSiteTheme("custom");
                        triggerToast();
                      }}
                      className={`group relative p-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        settings.siteTheme === "custom"
                          ? "border-primary bg-primary/10 scale-105"
                          : "border-border bg-muted/50 hover:border-primary/50"
                      }`}
                    >
                      <div
                        className="w-full aspect-video rounded-lg border border-border overflow-hidden flex"
                        style={{
                          background: `hsl(${settings.customTheme.background})`,
                        }}
                      >
                        <div
                          className="w-1/2 h-full"
                          style={{
                            background: `hsl(${settings.customTheme.primary})`,
                          }}
                        />
                        <div
                          className="w-1/2 h-full"
                          style={{
                            background: `hsl(${settings.customTheme.accent})`,
                          }}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-tight ${
                          settings.siteTheme === "custom"
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        Custom
                      </span>
                      {settings.siteTheme === "custom" && (
                        <div className="absolute -top-1.5 -right-1.5 bg-primary rounded-full p-0.5 shadow-lg">
                          <Check
                            size={10}
                            className="text-primary-foreground"
                          />
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Custom Theme Builder */}
                  {settings.siteTheme === "custom" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-card border border-border rounded-xl space-y-4"
                    >
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">
                          Brand Color Preset
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {[
                            "#6366f1",
                            "#f43f5e",
                            "#10b981",
                            "#f59e0b",
                            "#0ea5e9",
                            "#8b5cf6",
                            "#ec4899",
                            "#71717a",
                          ].map((color) => (
                            <button
                              key={color}
                              onClick={() => {
                                const tempDiv = document.createElement("div");
                                tempDiv.style.color = color;
                                document.body.appendChild(tempDiv);
                                const computedColor =
                                  getComputedStyle(tempDiv).color;
                                document.body.removeChild(tempDiv);

                                const rgb = computedColor.match(/\d+/g);
                                if (rgb) {
                                  const r = rgb[0] / 255;
                                  const g = rgb[1] / 255;
                                  const b = rgb[2] / 255;
                                  const max = Math.max(r, g, b),
                                    min = Math.min(r, g, b);
                                  let h,
                                    s,
                                    l = (max + min) / 2;

                                  if (max === min) {
                                    h = s = 0;
                                  } else {
                                    const d = max - min;
                                    s =
                                      l > 0.5
                                        ? d / (2 - max - min)
                                        : d / (max + min);
                                    switch (max) {
                                      case r:
                                        h = (g - b) / d + (g < b ? 6 : 0);
                                        break;
                                      case g:
                                        h = (b - r) / d + 2;
                                        break;
                                      case b:
                                        h = (r - g) / d + 4;
                                        break;
                                    }
                                    h /= 6;
                                  }

                                  const H = Math.round(h * 360);
                                  const S = Math.round(s * 100);
                                  const L = Math.round(l * 100);

                                  settings.setCustomTheme({
                                    primary: `${H} ${S}% ${L}%`,
                                    background: `${H} ${Math.min(S, 15)}% 4%`,
                                    card: `${H} ${Math.min(S, 10)}% 8%`,
                                    border: `${H} ${Math.min(S, 10)}% 15%`,
                                    foreground: `${H} 5% 95%`,
                                    accent: `${H} ${S}% ${Math.min(
                                      L + 20,
                                      90,
                                    )}%`,
                                  });
                                  triggerToast();
                                }
                              }}
                              className="w-8 h-8 rounded-full border border-border transition-transform hover:scale-110 active:scale-95"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(settings.customTheme).map(
                          ([key, value]) => (
                            <div key={key} className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {key} HSL
                              </label>
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => {
                                  settings.setCustomTheme({
                                    [key]: e.target.value,
                                  });
                                }}
                                className="w-full bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                          ),
                        )}
                      </div>
                    </motion.div>
                  )}

                  <ToggleCard
                    icon={MousePointer2}
                    title="Custom Cursor"
                    description="Enable the smooth, animated custom cursor."
                    value={settings.customCursor}
                    onToggle={settings.setCustomCursor}
                  />
                </div>
              )}

              {/* SERVERS TAB */}
              {activeTab === "servers" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-1">
                      Streaming Servers
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Set default servers for movie and series playback.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Default Movie Server Dropdown */}
                    <div className="p-4 bg-card border border-border rounded-xl">
                      <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                        <Monitor size={16} />
                        <h4 className="text-xs font-bold uppercase tracking-wider">
                          Default Movie Server
                        </h4>
                      </div>
                      {loadingServers ? (
                        <div className="w-full h-10 bg-muted border border-border rounded-lg px-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2
                            size={14}
                            className="animate-spin text-primary"
                          />
                          Loading...
                        </div>
                      ) : (
                        <select
                          value={settings.defaultMovieServer}
                          onChange={(e) => {
                            settings.setDefaultMovieServer(e.target.value);
                            triggerToast();
                          }}
                          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        >
                          {movieServers.map((s) => (
                            <option
                              key={s.id || s.name}
                              value={s.name}
                              className="bg-card"
                            >
                              {s.name}
                            </option>
                          ))}
                          {movieServers.length === 0 && (
                            <option className="bg-card">
                              No servers found
                            </option>
                          )}
                        </select>
                      )}
                    </div>

                    {/* Default TV Server Dropdown */}
                    <div className="p-4 bg-card border border-border rounded-xl">
                      <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                        <Tv size={16} />
                        <h4 className="text-xs font-bold uppercase tracking-wider">
                          Default TV Server
                        </h4>
                      </div>
                      {loadingServers ? (
                        <div className="w-full h-10 bg-muted border border-border rounded-lg px-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2
                            size={14}
                            className="animate-spin text-primary"
                          />
                          Loading...
                        </div>
                      ) : (
                        <select
                          value={settings.defaultTvServer}
                          onChange={(e) => {
                            settings.setDefaultTvServer(e.target.value);
                            triggerToast();
                          }}
                          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        >
                          {tvServers.map((s) => (
                            <option
                              key={s.id || s.name}
                              value={s.name}
                              className="bg-card"
                            >
                              {s.name}
                            </option>
                          ))}
                          {tvServers.length === 0 && (
                            <option className="bg-card">
                              No servers found
                            </option>
                          )}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* INTERFACE & PLAYER TAB */}
              {activeTab === "interface" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-1">
                      Interface & Player
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Configure behaviors and warnings across the app.
                    </p>
                  </div>

                  <ToggleCard
                    icon={AlertTriangle}
                    title="Remove Confirmation"
                    description="Ask for confirmation before removing items from continue watching."
                    value={settings.confirmRemove}
                    onToggle={settings.setConfirmRemove}
                  />
                  <ToggleCard
                    icon={AlertTriangle}
                    title="Show Adblock Notice"
                    description="Display a reminder to use an adblocker for third-party sources."
                    value={settings.showAdNotice}
                    onToggle={settings.setShowAdNotice}
                  />
                </div>
              )}

              {/* FEEDBACK TAB */}
              {activeTab === "feedback" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-1">
                      Feedback Loop
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Manage feedback popups and interaction prompts.
                    </p>
                  </div>

                  <ToggleCard
                    icon={MessageSquare}
                    title="Show Feedback Popup"
                    description="Automatically show the feedback dialog after spending time on the site."
                    value={settings.showFeedbackPopup}
                    onToggle={settings.setShowFeedbackPopup}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/20 shrink-0">
            <div className="md:hidden">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-destructive transition-colors"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        </div>

        {/* TOAST */}
        <AnimatePresence>
          {showSavedToast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-primary text-primary-foreground px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs"
            >
              <Check size={16} />
              Settings saved automatically
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

export default SettingsModal;
