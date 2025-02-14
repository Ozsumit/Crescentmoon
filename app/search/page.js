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
  const [debugInfo, setDebugInfo] = useState(null);

  const fetchSearchResults = async (searchValue) => {
    if (!searchValue) return;

    setIsLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      const movieUrl = `https://api.themoviedb.org/3/search/movie?language=en-US&query=${encodeURIComponent(
        searchValue
      )}&api_key=${apiKey}`;

      const tvUrl = `https://api.themoviedb.org/3/search/tv?language=en-US&query=${encodeURIComponent(
        searchValue
      )}&api_key=${apiKey}`;

      const movieResponse = await fetch(movieUrl);
      if (!movieResponse.ok) {
        throw new Error(
          `Movie API error: ${movieResponse.status} ${movieResponse.statusText}`
        );
      }
      const movieData = await movieResponse.json();

      const tvResponse = await fetch(tvUrl);
      if (!tvResponse.ok) {
        throw new Error(
          `TV API error: ${tvResponse.status} ${tvResponse.statusText}`
        );
      }
      const tvData = await tvResponse.json();

      const processedMovies = (movieData.results || []).map((movie) => ({
        ...movie,
        media_type: "movie",
        title: movie.title,
        release_date: movie.release_date,
      }));

      const processedTVShows = (tvData.results || []).map((show) => ({
        ...show,
        media_type: "tv",
        title: show.name,
        release_date: show.first_air_date,
      }));

      const mergedResults = [...processedMovies, ...processedTVShows].sort(
        (a, b) => b.popularity - a.popularity
      );

      setDebugInfo({
        movieCount: movieData.results?.length || 0,
        tvCount: tvData.results?.length || 0,
        totalMerged: mergedResults.length,
      });

      setData(mergedResults);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchValue) => {
    fetchSearchResults(searchValue);
  };

  const handleTyping = (value) => {
    setTypedValue(value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typedValue) {
        fetchSearchResults(typedValue);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [typedValue]);

  useEffect(() => {
    if (!apiKey) {
      setError(
        "TMDB API key is missing. Please check your environment variables."
      );
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br justify-center items-center from-indigo-950 via-slate-900 to-black text-white">
      <div className="container mx-auto mt-16 px-4 py-8 flex-grow">
        <SearchTitle />
        <SearchBar onSearch={handleSearch} onTyping={handleTyping} />
        {!apiKey && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 my-4 text-center">
            <p className="text-red-300">
              API key is missing. Please check your environment setup.
            </p>
          </div>
        )}
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
        {!isLoading && !error && (
          <div className="mt-8">
            {data.length > 0 ? (
              <SearchDisplay media={data} />
            ) : typedValue ? (
              <div className="text-center text-slate-400 py-12">
                <p>No results found for "{typedValue}"</p>
                <p className="text-sm mt-2">
                  Please make sure your search term is correct and try again.
                </p>
              </div>
            ) : null}
          </div>
        )}
        {debugInfo && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4 my-4 text-sm">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <p>Movies found: {debugInfo.movieCount}</p>
            <p>TV shows found: {debugInfo.tvCount}</p>
            <p>Total merged results: {debugInfo.totalMerged}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
