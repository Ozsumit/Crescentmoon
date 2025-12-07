"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Search,
  Film,
  Tv,
  ArrowRight,
  Command,
  CornerDownLeft,
  Calendar,
  Star,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/dialog";
import { motion, AnimatePresence } from "framer-motion";

const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

// --- 1. RESULT ITEM (Swiss Layout + Material Motion) ---
const SearchResultItem = ({ item, isSelected, onClick }) => {
  const mediaType = item.media_type === "movie" ? "MOVIE" : "SERIES";
  const year =
    item.release_date || item.first_air_date
      ? new Date(item.release_date || item.first_air_date).getFullYear()
      : "N/A";

  // Icon mapping
  const Icon = item.media_type === "movie" ? Film : Tv;

  return (
    <motion.div
      layout
      onClick={onClick}
      className={`group relative flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-colors duration-200 z-10 ${
        isSelected ? "text-white" : "text-neutral-400 hover:text-white"
      }`}
    >
      {/* --- MATERIAL 3: GLIDING CURSOR BACKGROUND --- */}
      {isSelected && (
        <motion.div
          layoutId="activeSearchItem"
          className="absolute inset-0 bg-neutral-800 rounded-2xl -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      {/* Poster / Thumbnail */}
      <div className="relative flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-neutral-900 shadow-sm ring-1 ring-white/10">
        {item.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
            alt={item.title || item.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-neutral-700">
            <Icon size={20} />
          </div>
        )}
      </div>

      {/* Text Content (Swiss Grid Alignment) */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <h4
            className={`text-base font-medium truncate ${
              isSelected ? "text-white" : "text-neutral-200"
            }`}
          >
            {item.title || item.name}
          </h4>

          {/* Rating Badge */}
          {item.vote_average > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-yellow-500">
              <Star size={8} fill="currentColor" />
              <span>{item.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-neutral-500 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                item.media_type === "movie" ? "bg-indigo-500" : "bg-rose-500"
              }`}
            />
            {mediaType}
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {year}
          </span>
        </div>
      </div>

      {/* Action Icon */}
      <div
        className={`flex-shrink-0 transition-opacity duration-200 ${
          isSelected ? "opacity-100" : "opacity-0"
        }`}
      >
        <ArrowRight size={18} className="text-neutral-500" />
      </div>
    </motion.div>
  );
};

// --- 2. MAIN COMPONENT ---
const QuickSearch = ({ open, onOpenChange }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0); // Default to first item
  const [totalResults, setTotalResults] = useState(0);

  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const router = useRouter();

  // Scroll active item into view
  useEffect(() => {
    if (scrollRef.current && selectedIndex >= 0) {
      const listItems = scrollRef.current.children;
      const activeItem = listItems[selectedIndex];
      if (activeItem) {
        activeItem.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  // Fetch Logic
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchTerm.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(
            searchTerm
          )}&page=1`
        );
        const data = await res.json();

        const filtered = (data.results || []).filter(
          (i) => i.media_type === "movie" || i.media_type === "tv"
        );

        setSearchResults(filtered.slice(0, 6)); // Limit to 6 for cleaner UI
        setTotalResults(data.total_results || 0);
        setSelectedIndex(0);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 250); // Faster debounce

    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  // Keyboard Navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + searchResults.length) % searchResults.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(searchResults[selectedIndex]);
    }
  };

  const handleSelect = (item) => {
    if (!item) return;
    onOpenChange(false);
    const href =
      item.media_type === "tv" ? `/series/${item.id}` : `/movie/${item.id}`;
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl shadow-black/80 rounded-[28px] overflow-hidden">
        {/* --- HEADER: INPUT FIELD --- */}
        <div className="relative flex items-center h-20 px-6 border-b border-white/5 bg-white/[0.02]">
          <Search
            className={`w-6 h-6 transition-colors ${
              isLoading ? "text-indigo-500" : "text-neutral-500"
            }`}
          />

          <input
            ref={inputRef}
            className="flex-1 h-full bg-transparent border-none outline-none px-4 text-xl font-medium text-white placeholder-neutral-600 font-sans"
            placeholder="Search movies & series..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          ) : (
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-mono text-neutral-500">
              <span className="text-xs">ESC</span>
            </div>
          )}
        </div>

        {/* --- BODY: RESULTS --- */}
        <div className="min-h-[300px] max-h-[500px] flex flex-col">
          {/* Empty State */}
          {!searchTerm && (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 gap-4 p-8">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/5">
                <Command size={32} strokeWidth={1.5} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-neutral-400">
                  Search for anything
                </p>
                <p className="text-xs font-mono text-neutral-600 uppercase tracking-wide">
                  Movies • Series • Anime
                </p>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {searchTerm && (
            <div className="flex-1 overflow-y-auto p-3" ref={scrollRef}>
              {searchResults.length > 0 ? (
                <div className="grid gap-1">
                  {/* Section Label (Swiss Style) */}
                  <div className="px-3 py-2 text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-widest flex items-center gap-2">
                    <span>Results_01</span>
                    <div className="h-px bg-white/5 flex-1" />
                  </div>

                  {searchResults.map((item, index) => (
                    <SearchResultItem
                      key={item.id}
                      item={item}
                      isSelected={index === selectedIndex}
                      onClick={() => handleSelect(item)}
                    />
                  ))}
                </div>
              ) : (
                !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-2">
                    <Film className="w-10 h-10 text-neutral-700 mb-2" />
                    <p className="text-sm">
                      No results for{" "}
                      <span className="text-white">"{searchTerm}"</span>
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* --- FOOTER: SPECS --- */}
        <div className="h-12 bg-neutral-950 border-t border-white/5 flex items-center justify-between px-6 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-indigo-500 rounded-full" />
              TMDB_API_CONNECTED
            </span>
            {totalResults > 0 && <span>{totalResults} items found</span>}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5">
              <ArrowRight size={10} className="-rotate-90" />
              <ArrowRight size={10} className="rotate-90" />
              <span>NAVIGATE</span>
            </span>
            <div className="w-px h-3 bg-white/10 hidden md:block" />
            <span className="flex items-center gap-1.5">
              <CornerDownLeft size={10} />
              <span>OPEN</span>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickSearch;
