"use client";

import React, { useEffect, useState } from "react";
import useSettingsStore from "@/components/settings-store";
import ThemeWrapper from "@/components/themewrappr";
import { MOVIE_SERVERS, TV_SERVERS } from "@/lib/config";
import {
  Palette,
  Server,
  MousePointer2,
  AlertTriangle,
  Trash2,
  RotateCcw,
  Check,
  ChevronRight,
  Monitor,
  Tv,
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

  useEffect(() => {
    setMounted(true);
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
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
          <Icon size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-sm text-neutral-500 font-medium">{description}</p>
        </div>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );

  const ToggleCard = ({ title, description, value, onToggle, icon: Icon }) => (
    <div
      className="group flex items-center justify-between p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl hover:border-white/10 transition-all cursor-pointer"
      onClick={() => { onToggle(!value); triggerToast(); }}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${value ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-neutral-500'}`}>
            <Icon size={18} />
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{title}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div
        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${value ? 'bg-indigo-600' : 'bg-neutral-800'}`}
      >
        <motion.div
          animate={{ x: value ? 26 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
        />
      </div>
    </div>
  );

  return (
    <ThemeWrapper>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <header className="mb-16">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">Configuration</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4">
            Settings
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl">
            Personalize your viewing experience. These settings are saved locally to your browser.
          </p>
        </header>

        {/* THEME SETTINGS */}
        <SettingSection
          icon={Palette}
          title="Theming"
          description="Customize the visual appearance of Cmoon."
        >
          <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Accent Color</h3>
            <div className="flex flex-wrap gap-4">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => { settings.setAccentColor(color.value); triggerToast(); }}
                  className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${settings.accentColor === color.value ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {settings.accentColor === color.value && <Check size={20} className="text-white drop-shadow-md" />}
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
            <div className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2 mb-4 text-neutral-400">
                <Monitor size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider">Default Movie Server</h3>
              </div>
              <select
                value={settings.defaultMovieServer}
                onChange={(e) => { settings.setDefaultMovieServer(e.target.value); triggerToast(); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
              >
                {MOVIE_SERVERS.map(s => <option key={s.name} value={s.name} className="bg-neutral-900">{s.name}</option>)}
              </select>
            </div>

            <div className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2 mb-4 text-neutral-400">
                <Tv size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider">Default TV Server</h3>
              </div>
              <select
                value={settings.defaultTvServer}
                onChange={(e) => { settings.setDefaultTvServer(e.target.value); triggerToast(); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
              >
                {TV_SERVERS.map(s => <option key={s.name} value={s.name} className="bg-neutral-900">{s.name}</option>)}
              </select>
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

        {/* DANGER ZONE */}
        <div className="mt-20 pt-10 border-t border-white/5">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-rose-500/10 text-neutral-500 hover:text-rose-500 border border-white/5 hover:border-rose-500/20 transition-all text-sm font-bold"
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
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm"
            >
              <Check size={18} />
              Settings saved automatically
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThemeWrapper>
  );
};

export default SettingsPage;
