"use client";

import React, { useEffect, useState } from "react";
import useSettingsStore from "@/components/settings-store";
import { PageContainer } from "@/components/themewrappr";
import { SITE_THEMES } from "@/lib/themes";
// Import the server action directly to call it from the client
import { getVideoSources } from "@/lib/video-sources";
import {
  Palette,
  Server,
  MousePointer2,
  AlertTriangle,
  Trash2,
  RotateCcw,
  Check,
  Monitor,
  Tv,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ACCENT_COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Violet", value: "#8b5cf6" },
];

const SettingsPage = () => {
  const settings = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Dynamic server sources state
  const [movieServers, setMovieServers] = useState([]);
  const [tvServers, setTvServers] = useState([]);
  const [loadingServers, setLoadingServers] = useState(true);

  useEffect(() => {
    setMounted(true);

    // Fetch dynamic video sources from the database on mount
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
  }, []);

  if (!mounted) return null;

  const handleReset = () => {
    settings.resetSettings();
    triggerToast();
  };

  const triggerToast = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const SettingSection = ({ icon: Icon, title, description, children }) => (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
          <Icon size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground font-medium">{description}</p>
        </div>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );

  const ToggleCard = ({ title, description, value, onToggle, icon: Icon }) => (
    <div
      className="group flex items-center justify-between p-5 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all cursor-pointer"
      onClick={() => {
        onToggle(!value);
        triggerToast();
      }}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
          >
            <Icon size={18} />
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div
        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${value ? "bg-primary" : "bg-muted"}`}
      >
        <motion.div
          animate={{ x: value ? 26 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 left-0 w-4 h-4 bg-background rounded-full shadow-lg"
        />
      </div>
    </div>
  );

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto mt-16">
        <header className="mb-16">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">
              Configuration
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground mb-4">
            Settings
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Personalize your viewing experience. These settings are saved
            locally to your browser.
          </p>
        </header>

        {/* THEME SETTINGS */}
        <SettingSection
          icon={Palette}
          title="Theming"
          description="Customize the visual appearance of Cmoon."
        >
          {/* Site Theme Selector */}
          <div className="p-6 bg-card border border-border rounded-2xl mb-4">
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
              Site Theme
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
                    className={`group relative p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${isActive ? "border-primary bg-primary/10 scale-105" : "border-border bg-muted/50 hover:border-primary/50"}`}
                  >
                    <div
                      className="w-full aspect-video rounded-lg border border-border overflow-hidden flex"
                      style={{ background: `hsl(${theme.colors.background})` }}
                    >
                      <div className="w-1/3 h-full" style={{ background: `hsl(${theme.colors.primary})` }} />
                      <div className="w-1/3 h-full" style={{ background: `hsl(${theme.colors.secondary})` }} />
                      <div className="w-1/3 h-full" style={{ background: `hsl(${theme.colors.accent})` }} />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                    >
                      {theme.name}
                    </span>
                    {isActive && (
                      <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1 shadow-lg">
                        <Check size={10} className="text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-2xl mb-4">
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
              Accent Color
            </h3>
            <div className="flex flex-wrap gap-4">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    settings.setAccentColor(color.value);
                    triggerToast();
                  }}
                  className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${settings.accentColor === color.value ? "border-primary scale-110" : "border-transparent hover:scale-105"}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {settings.accentColor === color.value && (
                    <Check size={20} className="text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <ToggleCard
            icon={MousePointer2}
            title="Custom Cursor"
            description="Enable the smooth, animated custom cursor."
            value={settings.customCursor}
            onToggle={settings.setCustomCursor}
          />
        </SettingSection>

        {/* SERVER SETTINGS */}
        <SettingSection
          icon={Server}
          title="Servers"
          description="Choose your preferred streaming sources."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Default Movie Server Dropdown */}
            <div className="p-5 bg-card border border-border rounded-2xl relative">
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <Monitor size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Default Movie Server
                </h3>
              </div>
              {loadingServers ? (
                <div className="w-full h-11 bg-muted border border-border rounded-xl px-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 size={14} className="animate-spin text-primary" />
                  Loading Movie Servers...
                </div>
              ) : (
                <select
                  value={settings.defaultMovieServer}
                  onChange={(e) => {
                    settings.setDefaultMovieServer(e.target.value);
                    triggerToast();
                  }}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
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
                    <option className="bg-card">No servers found</option>
                  )}
                </select>
              )}
            </div>

            {/* Default TV Server Dropdown */}
            <div className="p-5 bg-card border border-border rounded-2xl relative">
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <Tv size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Default TV Server
                </h3>
              </div>
              {loadingServers ? (
                <div className="w-full h-11 bg-muted border border-border rounded-xl px-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 size={14} className="animate-spin text-primary" />
                  Loading TV Servers...
                </div>
              ) : (
                <select
                  value={settings.defaultTvServer}
                  onChange={(e) => {
                    settings.setDefaultTvServer(e.target.value);
                    triggerToast();
                  }}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
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
                    <option className="bg-card">No servers found</option>
                  )}
                </select>
              )}
            </div>
          </div>
        </SettingSection>

        {/* UI & PLAYER SETTINGS */}
        <SettingSection
          icon={Monitor}
          title="Interface & Player"
          description="Behavioral settings for the platform."
        >
          <ToggleCard
            icon={Trash2}
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
        </SettingSection>

        {/* FEEDBACK SETTINGS */}
        <SettingSection
          icon={MessageSquare}
          title="Feedback Loop"
          description="Configure how you interact with the developer."
        >
          <ToggleCard
            title="Show Feedback Popup"
            description="Automatically show the feedback dialog after some time."
            value={settings.showFeedbackPopup}
            onToggle={settings.setShowFeedbackPopup}
          />
        </SettingSection>

        {/* DANGER ZONE */}
        <div className="mt-20 pt-10 border-t border-border">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border hover:border-destructive/20 transition-all text-sm font-bold"
          >
            <RotateCcw size={16} />
            Reset all settings to default
          </button>
        </div>

        {/* TOAST */}
        <AnimatePresence>
          {showSavedToast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm"
            >
              <Check size={18} />
              Settings saved automatically
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
