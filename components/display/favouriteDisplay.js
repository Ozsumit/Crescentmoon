"use client";

import React, { useState, useRef } from "react";
import {
  Download,
  Star,
  Heart,
  Grid,
  List,
  Film,
  Tv,
  Sparkles,
  LayoutGrid,
  AlignJustify,
  Archive,
} from "lucide-react";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";

// Assuming you have this component, or replace with your own
import FavoriteCard from "./favouritecARD";

const FavoriteDisplay = ({
  filteredFavorites,
  activeTab,
  onTabChange,
  toggleFavorite,
}) => {
  const [viewMode, setViewMode] = useState("grid");
  const [isSaving, setIsSaving] = useState(false);
  const favoriteContainerRef = useRef(null);

  // --- SAVE FUNCTIONALITY ---
  const handleSaveAsPicture = async () => {
    if (favoriteContainerRef.current) {
      setIsSaving(true);
      try {
        const canvas = await html2canvas(favoriteContainerRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#0a0a0a", // Matches the bg color
        });

        const link = document.createElement("a");
        link.download = `collection-${
          new Date().toISOString().split("T")[0]
        }.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error("Error saving image:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // --- TABS CONFIG ---
  const tabs = [
    { id: "all", label: "All Items", icon: Star },
    { id: "movies", label: "Movies", icon: Film },
    { id: "series", label: "Series", icon: Tv },
  ];

  return (
    <div className="w-full max-w-[2000px] mx-auto">
      {/* --- SWISS HEADER / CONTROL DECK --- */}
      <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 rounded-t-3xl overflow-hidden mb-1">
        <div className="flex flex-col lg:flex-row items-stretch border-b border-white/5">
          {/* 1. TITLE BLOCK */}
          <div className="flex items-center gap-4 px-8 py-6 border-b lg:border-b-0 lg:border-r border-white/5 bg-white/[0.02]">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                My Collection
              </h2>
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-0.5">
                {filteredFavorites.length} ITEMS SAVED
              </p>
            </div>
          </div>

          {/* 2. FILTER TABS (Material Motion) */}
          <div className="flex-1 flex items-center justify-center p-4 lg:p-0">
            <div className="flex bg-neutral-950/50 p-1.5 rounded-full border border-white/5 relative">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors z-10 flex items-center gap-2 ${
                      isActive
                        ? "text-white"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeFilterTab"
                        className="absolute inset-0 bg-neutral-800 rounded-full border border-white/10 shadow-sm"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <tab.icon size={14} className="relative z-10" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. ACTIONS (View Toggle & Export) */}
          <div className="flex items-center justify-end divide-x divide-white/5 border-t lg:border-t-0 lg:border-l border-white/5">
            {/* View Switcher */}
            <div className="flex items-center gap-1 px-6 py-4">
              <span className="hidden sm:block text-[10px] font-mono text-neutral-600 uppercase tracking-widest mr-3">
                View_Mode
              </span>
              <div className="flex bg-neutral-950 rounded-lg p-1 border border-white/5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                  aria-label="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                  aria-label="List View"
                >
                  <AlignJustify size={16} />
                </button>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleSaveAsPicture}
              disabled={isSaving || filteredFavorites.length === 0}
              className="hidden sm:flex items-center justify-center gap-3 px-8 py-4 h-full text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isSaving ? (
                <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
              ) : (
                <Download
                  size={18}
                  className="group-hover:-translate-y-0.5 transition-transform"
                />
              )}
              <span className="text-xs font-bold uppercase tracking-widest">
                {isSaving ? "Saving..." : "Export"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* --- CONTENT CONTAINER --- */}
      <div
        ref={favoriteContainerRef}
        className="bg-neutral-950 min-h-[500px] border border-white/5 rounded-b-3xl p-6 md:p-8 relative"
      >
        {/* Decorative Grid Lines (Swiss Style) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
        <div className="absolute top-0 left-8 bottom-0 w-px bg-white/5 hidden md:block" />
        <div className="absolute top-0 right-8 bottom-0 w-px bg-white/5 hidden md:block" />

        <AnimatePresence mode="wait">
          {filteredFavorites.length > 0 ? (
            <motion.div
              key={`${activeTab}-${viewMode}`} // Force re-render animation on change
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                  : "flex flex-col space-y-4 max-w-4xl mx-auto"
              }
            >
              {filteredFavorites.map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  layout // Magic Motion for reordering
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <FavoriteCard
                    favoriteItem={favorite}
                    viewMode={viewMode}
                    toggleFavorite={() => toggleFavorite(favorite)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            // --- EMPTY STATE (Swiss Technical) ---
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[400px] flex flex-col items-center justify-center text-center relative z-10"
            >
              <div className="w-24 h-24 bg-neutral-900 rounded-3xl border border-white/5 flex items-center justify-center mb-6 relative group">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Archive
                  className="text-neutral-700 group-hover:text-indigo-400 transition-colors"
                  size={40}
                  strokeWidth={1.5}
                />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                Collection Empty
              </h3>
              <p className="text-neutral-500 max-w-sm mx-auto mb-8">
                You haven't saved any{" "}
                {activeTab === "all" ? "items" : activeTab} to your collection
                yet.
              </p>

              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-600 uppercase tracking-widest border border-white/5 px-3 py-1.5 rounded bg-neutral-900">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                System_Status: Awaiting_Input
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FavoriteDisplay;
