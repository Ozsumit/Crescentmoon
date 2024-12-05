"use client";
import SearchDisplay from "@/components/display/SearchDisplay";
import SearchBar from "@/components/searchbar/SearchBar";
import SearchTitle from "@/components/title/SearchTitle";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const Search = () => {
  const [data, setData] = useState([]);
  const [typedValue, setTypedValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Centralized data fetching function
  const fetchSearchResults = async (searchValue) => {
    if (!searchValue) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=en-US&query=${searchValue}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch search results");
      }

      const result = await res.json();
      setData(result.results || []);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // This is triggered when search button is clicked
  const handleSearch = (searchValue) => {
    fetchSearchResults(searchValue);
  };

  // This is triggered when user starts typing in search bar
  const handleTyping = (value) => {
    setTypedValue(value);
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typedValue) {
        fetchSearchResults(typedValue);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [typedValue]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br justify-center items-center from-indigo-950 via-slate-900 to-black text-white">
      <div className="container mx-auto mt-16 px-4 py-8 flex-grow">
        <SearchTitle />
        <SearchBar onSearch={handleSearch} onTyping={handleTyping} />

        {/* Loading and Error States */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-indigo-400" size={48} />
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 my-4 text-center">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && !error && (
          <div className="mt-8">
            {data.length > 0 ? (
              <SearchDisplay movies={data} />
            ) : typedValue ? (
              <div className="text-center text-slate-400 py-12">
                <p>No results found for "{typedValue}"</p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Footer */}
    </div>
  );
};

export default Search;
