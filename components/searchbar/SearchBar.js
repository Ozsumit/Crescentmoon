"use client";
import React, { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ onSearch, onTyping }) => {
  const searchBarRef = useRef(null);
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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

  useEffect(() => {
    searchBarRef.current?.focus();
  }, []);

  return (
    <div className="flex justify-center items-center px-4 py-10 w-full">
      <div className="relative w-full max-w-xl">
        <div className="flex shadow-2xl mb-4">
          <div className="relative flex-grow">
            <input
              value={searchValue}
              type="text"
              name="search"
              id="search"
              placeholder="Search movies, TV shows..."
              className="
                w-full 
                py-4 
                px-6 
                text-white 
                bg-slate-800 
                border-none 
                rounded-l-xl 
                focus:outline-none 
                focus:ring-2 
                focus:ring-indigo-500
                text-base
                transition-all
                duration-300
              "
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoComplete="off"
              ref={searchBarRef}
            />

            {searchValue && (
              <button
                onClick={clearSearch}
                className="
                  absolute 
                  right-16 
                  top-1/2 
                  transform 
                  -translate-y-1/2 
                  text-slate-400 
                  hover:text-white 
                  transition-colors
                  z-10
                "
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={handleSearch}
            className="
              px-6 
              bg-gradient-to-r 
              from-indigo-600 
              to-pink-600 
              text-white 
              rounded-r-xl 
              hover:from-indigo-700 
              hover:to-pink-700 
              transition-all 
              duration-300 
              flex 
              items-center 
              justify-center
              group
            "
          >
            <Search
              className="
                w-6 
                h-6 
                transition-transform 
                group-hover:scale-110
              "
            />
          </button>
        </div>

        {/* Animated focus indicator */}
        <div
          className={`
            absolute 
            bottom-0 
            left-0 
            right-0 
            h-1 
            rounded-xl
            bg-gradient-to-r 
            from-indigo-500 
            to-pink-500 
            transform 
            scale-x-0 
            transition-transform 
            duration-300 
            origin-left
            ${isFocused ? "scale-x-100" : ""}
          `}
        />
      </div>
    </div>
  );
};

export default SearchBar;
