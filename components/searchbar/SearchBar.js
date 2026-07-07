"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";

const SearchBar = ({
  onSearch,
  onTyping,
  initialValue = "",
  isLoading = false,
}) => {
  const searchBarRef = useRef(null);
  const [searchValue, setSearchValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  // Sync internal state if parent updates initialValue (e.g. from URL)
  useEffect(() => {
    setSearchValue(initialValue);
  }, [initialValue]);

  const handleSearch = () => {
    if (searchValue.trim()) {
      onSearch(searchValue);
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onTyping(value);
  };

  const clearSearch = () => {
    setSearchValue("");
    onTyping("");
    searchBarRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto group">
      <div
        className={`
          relative flex items-center w-full h-[4.5rem] 
          bg-card
          rounded-full 
          transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
          border border-border
          ${
            isFocused
              ? "shadow-[0_0_0_4px_hsl(var(--primary)/0.15)] border-primary/50 scale-[1.02]"
              : "shadow-2xl shadow-black/50 hover:border-foreground/20"
          }
        `}
      >
        {/* Left Icon (Search Decoration) */}
        <div className="absolute left-6 text-muted-foreground pointer-events-none">
          <Search
            className={`w-6 h-6 transition-colors duration-300 ${isFocused ? "text-primary" : "text-muted-foreground"}`}
            strokeWidth={2.5}
          />
        </div>

        {/* Input Field */}
        <input
          ref={searchBarRef}
          value={searchValue}
          type="text"
          placeholder="Search movies, TV shows..."
          className="
            w-full h-full 
            bg-transparent 
            border-none 
            outline-none 
            text-foreground text-lg font-medium tracking-tight
            pl-16 pr-32
            placeholder:text-muted-foreground/50
            rounded-full
          "
          onChange={handleTyping}
          onKeyDown={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete="off"
        />

        {/* Right Actions Container */}
        <div className="absolute right-3 flex items-center gap-2">
          {/* Loading Spinner */}
          {isLoading && (
            <div className="animate-in fade-in zoom-in duration-300 mr-2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          )}

          {/* Clear Button (Only visible when text exists) */}
          {searchValue && !isLoading && (
            <button
              onClick={clearSearch}
              className="
                p-2 rounded-full 
                text-muted-foreground
                hover:bg-accent hover:text-foreground
                transition-all duration-200
                active:scale-90
              "
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Search Action Button */}
          <button
            onClick={handleSearch}
            disabled={!searchValue.trim()}
            className={`
              flex items-center justify-center
              h-12 w-12 rounded-full
              transition-all duration-300 ease-out
              ${
                searchValue.trim()
                  ? "bg-primary text-primary-foreground hover:scale-110 active:scale-95 rotate-0 opacity-100"
                  : "bg-transparent text-transparent scale-50 rotate-[-45deg] opacity-0 pointer-events-none"
              }
            `}
            aria-label="Submit search"
          >
            <ArrowRight className="w-6 h-6" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
