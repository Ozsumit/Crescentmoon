"use client";

import React, { useState, useEffect, useRef } from "react";
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
  TrendingUp,
  Layers,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/dialog";
import { motion, AnimatePresence } from "framer-motion";

const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

// --- 1. UTILITY: PHONETIC GENERATOR ---
// Generates common variations for typos and romanized text
const generatePhoneticVariations = (q) => {
  const vars = new Set();
  const lowerQ = q.toLowerCase();

  if (lowerQ.includes("i")) vars.add(lowerQ.replace(/i/g, "ee"));
  if (lowerQ.includes("ee")) vars.add(lowerQ.replace(/ee/g, "i"));
  if (lowerQ.includes("u")) vars.add(lowerQ.replace(/u/g, "oo"));
  if (lowerQ.includes("oo")) vars.add(lowerQ.replace(/oo/g, "u"));
  if (lowerQ.includes("v")) vars.add(lowerQ.replace(/v/g, "w"));
  if (lowerQ.includes("w")) vars.add(lowerQ.replace(/w/g, "v"));
  if (lowerQ.includes("ph")) vars.add(lowerQ.replace(/ph/g, "f"));
  if (lowerQ.includes("f")) vars.add(lowerQ.replace(/f/g, "ph"));
  if (lowerQ.includes("c")) vars.add(lowerQ.replace(/c/g, "k"));
  if (lowerQ.includes("k")) vars.add(lowerQ.replace(/k/g, "c"));
  if (lowerQ.includes("s")) vars.add(lowerQ.replace(/s/g, "z"));
  if (lowerQ.includes("z")) vars.add(lowerQ.replace(/z/g, "s"));

  // Limit permutations to 4 to prevent API rate limiting
  return Array.from(vars)
    .filter((v) => v !== lowerQ)
    .slice(0, 4);
};

// --- 2. UTILITY: SMART TEXT HIGHLIGHTER ---
const HighlightText = ({ text, highlight }) => {
  if (!highlight || !highlight.trim()) return <>{text}</>;

  // 1. Try EXACT phrase highlighting
  const exactRegex = new RegExp(
    `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  if (exactRegex.test(text)) {
    const parts = text.split(exactRegex);
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span
              key={i}
              className="text-white font-bold bg-indigo-500/20 px-0.5 rounded"
            >
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </span>
    );
  }

  // 2. Fallback: Word-by-word highlighting (ignores tiny words)
  const words = highlight
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  if (words.length === 0) return <>{text}</>;

  const wordRegex = new RegExp(
    `(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  const parts = text.split(wordRegex);

  return (
    <span>
      {parts.map((part, i) =>
        words.some((w) => w.toLowerCase() === part.toLowerCase()) ? (
          <span
            key={i}
            className="text-white font-bold bg-indigo-500/20 px-0.5 rounded"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
};

// --- 3. RESULT ITEM (Swiss Layout + Material Motion) ---
const SearchResultItem = ({ item, isSelected, onClick, searchQuery }) => {
  const mediaType = item.media_type === "movie" ? "MOVIE" : "SERIES";
  const year =
    item.release_date || item.first_air_date
      ? new Date(item.release_date || item.first_air_date).getFullYear()
      : "N/A";

  const Icon = item.media_type === "movie" ? Film : Tv;
  const title = item.title || item.name;

  return (
    <motion.div
      layout="position"
      onClick={onClick}
      className={`group relative flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-colors duration-200 z-10 ${
        isSelected ? "text-white" : "text-neutral-400 hover:text-white"
      }`}
    >
      {/* MATERIAL 3: GLIDING CURSOR */}
      {isSelected && (
        <motion.div
          layoutId="activeSearchItem"
          className="absolute inset-0 bg-neutral-800 rounded-2xl -z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/5"
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
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="48px"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-neutral-700">
            <Icon size={20} />
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <h4
            className={`text-base font-medium truncate ${
              isSelected ? "text-white" : "text-neutral-200"
            }`}
          >
            <HighlightText text={title} highlight={searchQuery} />
          </h4>

          {/* Rating Badge */}
          {item.vote_average > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-yellow-500 backdrop-blur-md">
              <Star size={8} fill="currentColor" />
              <span>{item.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-neutral-500 uppercase tracking-wider mt-0.5">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                item.media_type === "movie" ? "bg-indigo-500" : "bg-rose-500"
              } shadow-[0_0_8px_currentColor]`}
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
        className={`flex-shrink-0 transition-all duration-300 ${
          isSelected
            ? "opacity-100 translate-x-0 text-white"
            : "opacity-0 -translate-x-2"
        }`}
      >
        <ArrowRight size={18} />
      </div>
    </motion.div>
  );
};

// --- 4. MAIN COMPONENT ---
const QuickSearch = ({ open, onOpenChange }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // High-performance API cache
  const cacheRef = useRef(new Map());
  const debounceRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  // Scroll active item into view
  useEffect(() => {
    if (scrollRef.current && selectedIndex >= 0) {
      const listItems = scrollRef.current.children;
      const activeItem = listItems[selectedIndex];
      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  // Fetch Trending on Mount
  useEffect(() => {
    if (open && trending.length === 0) {
      fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}`)
        .then((res) => res.json())
        .then((data) => {
          const filtered = (data.results || []).filter(
            (i) => i.media_type === "movie" || i.media_type === "tv",
          );
          setTrending(filtered.slice(0, 5));
        })
        .catch(() => {});
    }
  }, [open, trending.length]);

  // --- OMNI-SEARCH ENGINE (Exact + Phonetic + Fallback) ---
  const fetchOmniSearch = async (query) => {
    const fetchTMDB = async (q) => {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(
          q,
        )}&page=1`,
      );
      return res.json();
    };

    const queriesToRun = new Set([query]);

    // Apply permutations if query > 2 chars
    if (query.length > 2) {
      // 1. Add phonetic variations
      generatePhoneticVariations(query).forEach((v) => queriesToRun.add(v));

      // 2. Add trailing typo fallback (e.g. "Avengers warr" -> "Avengers")
      if (query.includes(" ")) {
        const splitQuery = query.split(" ");
        splitQuery.pop();
        const fallbackQuery = splitQuery.join(" ");
        if (fallbackQuery.length > 2) queriesToRun.add(fallbackQuery);
      }
    }

    // Cap to 5 simultaneous requests to respect API limits
    const queriesArray = Array.from(queriesToRun).slice(0, 5);

    // Fire all searches simultaneously via Promise.all
    const responses = await Promise.all(
      queriesArray.map((q) => fetchTMDB(q).catch(() => ({ results: [] }))),
    );

    const allResults = [];
    const seenIds = new Set();

    responses.forEach((res, index) => {
      // Index 0 is the EXACT typed query. It gets a massive score boost.
      const isExactMatch = index === 0;

      (res.results || []).forEach((item) => {
        if (item.media_type === "movie" || item.media_type === "tv") {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            // Sort logic: Exact matches stay at top (+10000), phonetics ordered by popularity
            item._sortScore =
              (isExactMatch ? 10000 : 0) + (item.popularity || 0);
            allResults.push(item);
          }
        }
      });
    });

    // Return the top 8 matches (Merged Exact + Phonetics)
    return allResults.sort((a, b) => b._sortScore - a._sortScore).slice(0, 8);
  };

  // Debounced Search Logic
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = searchTerm.trim();
    if (!q) {
      setSearchResults([]);
      setIsLoading(false);
      setSelectedIndex(0);
      return;
    }

    // Instantly load from cache if available
    if (cacheRef.current.has(q.toLowerCase())) {
      setSearchResults(cacheRef.current.get(q.toLowerCase()));
      setSelectedIndex(0);
      return;
    }

    setIsLoading(true);
    // 300ms debounce ensures user finishes typing before we fire Promise.all
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await fetchOmniSearch(q);
        cacheRef.current.set(q.toLowerCase(), results);
        setSearchResults(results);
        setSelectedIndex(0);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const currentList = searchTerm ? searchResults : trending;

  // Keyboard Navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % currentList.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + currentList.length) % currentList.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(currentList[selectedIndex]);
    }
  };

  const handleSelect = (item) => {
    if (!item) return;
    onOpenChange(false);
    setSearchTerm("");
    const href =
      item.media_type === "tv" ? `/series/${item.id}` : `/movie/${item.id}`;
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 w-full max-w-2xl bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-[24px] sm:rounded-[28px] overflow-hidden">
        {/* --- HEADER: INPUT FIELD --- */}
        <div className="relative flex items-center h-16 sm:h-20 px-4 sm:px-6 border-b border-white/5 bg-white/[0.02]">
          <Search
            className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${
              isLoading ? "text-indigo-400" : "text-neutral-500"
            }`}
          />

          <input
            ref={inputRef}
            className="flex-1 h-full bg-transparent border-none outline-none px-3 sm:px-4 text-lg sm:text-xl font-medium text-white placeholder-neutral-600 font-sans w-full"
            placeholder="Search exact titles or phonetics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />

          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          ) : (
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-400">
              <span className="text-xs">ESC</span>
            </div>
          )}
        </div>

        {/* --- BODY: RESULTS --- */}
        <div className="min-h-[300px] max-h-[60vh] sm:max-h-[500px] flex flex-col">
          {/* Empty State (No Search Term) -> Show Trending */}
          {!searchTerm && trending.length === 0 && (
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
          <div className="flex-1 overflow-y-auto p-2 sm:p-3" ref={scrollRef}>
            {currentList.length > 0 ? (
              <div className="grid gap-1">
                {/* Section Label (Swiss Style) */}
                <div className="px-3 py-2 text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                  {searchTerm ? (
                    <>
                      <Layers size={12} className="text-indigo-400" /> Matches &
                      Guesses
                    </>
                  ) : (
                    <>
                      <TrendingUp size={12} className="text-rose-400" />{" "}
                      Trending Today
                    </>
                  )}
                  <div className="h-px bg-white/5 flex-1" />
                </div>

                <AnimatePresence mode="popLayout">
                  {currentList.map((item, index) => (
                    <SearchResultItem
                      key={item.id}
                      item={item}
                      searchQuery={searchTerm}
                      isSelected={index === selectedIndex}
                      onClick={() => handleSelect(item)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              !isLoading &&
              searchTerm && (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-3 py-10">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/5">
                    <Search size={28} className="text-neutral-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-neutral-400 mb-1">
                      No matching records found
                    </p>
                    <p className="text-xs text-neutral-600 max-w-[250px] mx-auto">
                      Checked exact matches, phonetics, and misspellings, but
                      couldn't decode{" "}
                      <span className="text-neutral-300 font-semibold">
                        "{searchTerm}"
                      </span>
                      .
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* --- FOOTER: SPECS --- */}
        <div className="h-10 sm:h-12 bg-neutral-950/80 border-t border-white/5 flex items-center justify-between px-4 sm:px-6 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            {currentList.length > 0 && (
              <span>{currentList.length} items found</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5">
              <span className="flex gap-0.5">
                <ArrowRight size={10} className="-rotate-90" />
                <ArrowRight size={10} className="rotate-90" />
              </span>
              <span>NAVIGATE</span>
            </span>
            <div className="w-px h-3 bg-white/10 hidden md:block" />
            <span className="hidden sm:flex items-center gap-1.5">
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
