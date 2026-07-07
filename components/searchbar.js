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

// --- 1. EXPANDED PHONETIC GENERATOR (COMBINATORIAL PERMUTATION ENGINE) ---
export const generatePhoneticVariations = (q) => {
  if (!q || typeof q !== "string") return [];
  const lowerQ = q.toLowerCase();

  const phoneticMap = [
    { rules: ["i", "ee", "ea", "y"] },
    { rules: ["u", "oo", "ou"] },
    { rules: ["v", "w", "b"] },
    { rules: ["ph", "f", "gh"] },
    { rules: ["c", "k", "q", "ch"] },
    { rules: ["s", "z", "sh", "c"] },
    { rules: ["g", "j", "ge"] },
    { rules: ["ae", "ai", "ay", "a"] },
    { rules: ["o", "oa", "ow"] },
    { rules: ["t", "d"] },
    { rules: ["m", "n"] },
  ];

  const variations = new Set();

  function permute(str, index = 0) {
    if (index >= str.length) {
      variations.add(str);
      return;
    }

    let matched = false;

    for (const group of phoneticMap) {
      for (const rule of group.rules) {
        if (str.startsWith(rule, index)) {
          matched = true;
          for (const replacement of group.rules) {
            const nextStr =
              str.slice(0, index) +
              replacement +
              str.slice(index + rule.length);
            permute(nextStr, index + replacement.length);
          }
        }
      }
    }

    if (!matched) {
      permute(str, index + 1);
    }
  }

  permute(lowerQ);

  const getLevenshteinDist = (a, b) => {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        matrix[i][j] =
          b[j - 1] === a[i - 1]
            ? matrix[i - 1][j - 1]
            : Math.min(
                matrix[i - 1][j - 1] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j] + 1,
              );
      }
    }
    return matrix[a.length][b.length];
  };

  return Array.from(variations)
    .filter((v) => v !== lowerQ)
    .sort(
      (a, b) => getLevenshteinDist(lowerQ, a) - getLevenshteinDist(lowerQ, b),
    )
    .slice(0, 6);
};

// --- 2. UTILITY: HOOK RENDERER FOR HIGHLIGHTING ---
function renderParts(sourceText, regexPattern, conditionFn) {
  const parts = sourceText.split(regexPattern);
  return (
    <span>
      {parts.map((part, i) =>
        conditionFn(part) ? (
          <mark
            key={i}
            className="text-primary-foreground font-bold bg-primary px-1 rounded-[4px] normal-case decoration-clone"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

// --- 3. UPGRADED SMART TEXT HIGHLIGHTER COMPONENT ---
export const HighlightText = ({ text, highlight }) => {
  if (!text) return null;
  if (!highlight || !highlight.trim()) return <>{text}</>;

  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const exactRegex = new RegExp(`(${escapeRegExp(highlight.trim())})`, "gi");
  if (exactRegex.test(text)) {
    return renderParts(
      text,
      exactRegex,
      (match) => match.toLowerCase() === highlight.trim().toLowerCase(),
    );
  }

  const targetWords = highlight
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 1);

  if (targetWords.length === 0) return <>{text}</>;

  const wordRegex = new RegExp(
    `(${targetWords.map((w) => escapeRegExp(w)).join("|")})`,
    "gi",
  );

  return renderParts(text, wordRegex, (match) =>
    targetWords.some((w) => w.toLowerCase() === match.toLowerCase()),
  );
};

// --- 4. RESULT ITEM (Swiss Layout + Material Motion) ---
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
      className={`group relative flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-colors duration-150 select-none ${
        isSelected
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {/* MATERIAL 3: GLIDING CURSOR */}
      {isSelected && (
        <motion.div
          layoutId="activeSearchItem"
          className="absolute inset-0 bg-muted rounded-2xl z-0 border border-border/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 35 }}
        />
      )}

      {/* Poster / Thumbnail */}
      <div className="relative z-10 flex-shrink-0 w-12 h-16 rounded-[6px] overflow-hidden bg-muted shadow-sm ring-1 ring-border">
        {item.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="48px"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            <Icon size={20} />
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="relative z-10 flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm sm:text-base font-semibold truncate text-foreground">
            <HighlightText text={title} highlight={searchQuery} />
          </h4>

          {/* Rating Badge */}
          {item.vote_average > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-mono bg-muted-foreground/15 px-1.5 py-0.5 rounded text-foreground backdrop-blur-md flex-shrink-0">
              <Star size={8} fill="currentColor" className="text-amber-500" />
              <span>{item.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-wider text-muted-foreground/90">
          <span className="flex items-center gap-1.5 font-bold">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                item.media_type === "movie" ? "bg-primary" : "bg-sky-500"
              }`}
            />
            {mediaType}
          </span>
          <span className="w-px h-3 bg-border" />
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {year}
          </span>
        </div>
      </div>

      {/* Action Icon */}
      <div
        className={`relative z-10 flex-shrink-0 transition-all duration-200 ${
          isSelected
            ? "opacity-100 translate-x-0 text-foreground"
            : "opacity-0 -translate-x-2 pointer-events-none"
        }`}
      >
        <ArrowRight size={16} />
      </div>
    </motion.div>
  );
};

// --- 5. MAIN COMPONENT ---
const QuickSearch = ({ open, onOpenChange }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const cacheRef = useRef(new Map());
  const debounceRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  // Reset indices on list shifts
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  // Scroll active item safely into view
  useEffect(() => {
    if (scrollRef.current && selectedIndex >= 0) {
      const listContainer = scrollRef.current.querySelector(
        ".results-list-container",
      );
      if (listContainer) {
        const activeItem = listContainer.children[selectedIndex + 1]; // Offset index for the header element
        if (activeItem) {
          activeItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
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

  // --- OMNI-SEARCH ENGINE ---
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

    if (query.length > 2) {
      generatePhoneticVariations(query).forEach((v) => queriesToRun.add(v));

      if (query.includes(" ")) {
        const splitQuery = query.split(" ");
        splitQuery.pop();
        const fallbackQuery = splitQuery.join(" ");
        if (fallbackQuery.length > 2) queriesToRun.add(fallbackQuery);
      }
    }

    const queriesArray = Array.from(queriesToRun).slice(0, 5);
    const responses = await Promise.all(
      queriesArray.map((q) => fetchTMDB(q).catch(() => ({ results: [] }))),
    );

    const allResults = [];
    const seenIds = new Set();

    responses.forEach((res, index) => {
      const isExactMatch = index === 0;

      (res.results || []).forEach((item) => {
        if (item.media_type === "movie" || item.media_type === "tv") {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            item._sortScore =
              (isExactMatch ? 10000 : 0) + (item.popularity || 0);
            allResults.push(item);
          }
        }
      });
    });

    return allResults.sort((a, b) => b._sortScore - a._sortScore).slice(0, 8);
  };

  // Debounced Search Logic
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = searchTerm.trim();
    if (!q) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    if (cacheRef.current.has(q.toLowerCase())) {
      setSearchResults(cacheRef.current.get(q.toLowerCase()));
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await fetchOmniSearch(q);
        cacheRef.current.set(q.toLowerCase(), results);
        setSearchResults(results);
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
    if (!currentList.length) return;

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
      if (currentList[selectedIndex]) {
        handleSelect(currentList[selectedIndex]);
      }
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
      <DialogContent className="p-0 gap-0 w-full max-w-2xl bg-card/95 backdrop-blur-2xl border border-border shadow-2xl rounded-[24px] overflow-hidden">
        {/* --- HEADER: INPUT FIELD --- */}
        <div className="relative flex items-center h-16 sm:h-20 px-4 sm:px-6 border-b border-border bg-muted/20">
          <Search
            className={`w-5 h-5 transition-colors duration-300 ${
              isLoading ? "text-primary" : "text-muted-foreground"
            }`}
          />

          <input
            ref={inputRef}
            className="flex-1 h-full bg-transparent border-none outline-none px-3 sm:px-4 text-base sm:text-lg font-medium text-foreground placeholder-muted-foreground w-full"
            placeholder="Search titles or phonetics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />

          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-muted border border-border text-[10px] font-mono text-muted-foreground select-none">
              <span>ESC</span>
            </div>
          )}
        </div>

        {/* --- BODY: RESULTS --- */}
        <div className="min-h-[340px] max-h-[60vh] sm:max-h-[480px] flex flex-col">
          {/* Empty State */}
          {!searchTerm && trending.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4 p-8">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border">
                <Command size={24} strokeWidth={1.5} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Search for anything
                </p>
                <p className="text-xs font-mono uppercase tracking-wide opacity-60">
                  Movies • Series • Anime
                </p>
              </div>
            </div>
          )}

          {/* Results Grid */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3" ref={scrollRef}>
            {currentList.length > 0 ? (
              <div className="grid gap-1 results-list-container">
                {/* Section Label (Swiss Style) */}
                <div className="px-3 py-2 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 select-none">
                  {searchTerm ? (
                    <>
                      <Layers size={12} className="text-primary" /> Matches &
                      Guesses
                    </>
                  ) : (
                    <>
                      <TrendingUp size={12} className="text-sky-500" /> Trending
                      Today
                    </>
                  )}
                  <div className="h-px bg-border/60 flex-1" />
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
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 py-14">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border">
                    <Search size={20} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground mb-1">
                      No matching records found
                    </p>
                    <p className="text-xs max-w-[280px] mx-auto text-muted-foreground/80 leading-relaxed">
                      Checked exact matches, phonetics, and misspellings for{" "}
                      <span className="text-primary font-semibold">
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
        <div className="h-11 bg-muted/10 border-t border-border flex items-center justify-between px-4 sm:px-6 text-[10px] font-mono text-muted-foreground uppercase tracking-wider select-none">
          <div>
            {currentList.length > 0 && (
              <span>{currentList.length} items cataloged</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-1.5">
              <span className="flex gap-0.5">
                <ArrowRight size={10} className="-rotate-90" />
                <ArrowRight size={10} className="rotate-90" />
              </span>
              <span>NAVIGATE</span>
            </span>
            <div className="w-px h-3 bg-border hidden md:block" />
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
