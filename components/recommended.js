"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, Info, Loader2 } from "lucide-react";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const RecommendedMovieCard = ({ movie }) => {
  const additionalDetails = {
    rating: movie.vote_average ? `${movie.vote_average.toFixed(1)}` : "N/A",
    date: new Date(movie.release_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    }),
    overview: movie.overview || "No overview available",
  };

  return (
    <div className="group relative rounded-lg overflow-hidden bg-slate-900/20 backdrop-blur-sm transition-all duration-500 hover:bg-slate-800/40">
      <Link
        href={`/movie/${movie.id}`}
        className="block aspect-[2/3] overflow-hidden"
      >
        <div className="relative h-full w-full">
          <Image
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w342/${movie.poster_path}`
                : "https://i.imgur.com/HIYYPtZ.png"
            }
            alt={movie.title}
            className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-40"
            fill
            unoptimized
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full">
            <Star size={12} className="text-yellow-500" />
            <span className="text-xs font-medium text-white">
              {additionalDetails.rating}
            </span>
          </div>

          {/* Hidden Content that appears on hover */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <p className="text-sm text-slate-200 line-clamp-3 mb-3">
              {additionalDetails.overview}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{additionalDetails.date}</span>
              </div>
              <div className="flex items-center gap-1 text-blue-400 font-medium">
                <Info size={12} />
                <span>Details</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Title */}
      <div className="p-3">
        <h3 className="text-sm text-slate-200 font-medium line-clamp-1 group-hover:text-blue-400 transition-colors duration-300">
          {movie.title}
        </h3>
      </div>
    </div>
  );
};

const RecommendedMovies = () => {
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [continueWatchingMovies, setContinueWatchingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovieDetails = async (movieId) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch movie details");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching movie details:", error);
      return null;
    }
  };

  const fetchRecommendations = async (genreIds) => {
    try {
      setIsLoading(true);

      if (genreIds.length === 0) {
        const defaultResponse = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&language=en-US`
        );

        if (!defaultResponse.ok) {
          throw new Error("Failed to fetch default recommendations");
        }

        const defaultMoviesData = await defaultResponse.json();
        setRecommendedMovies(defaultMoviesData.results.slice(0, 10));
        return;
      }

      const genreQuery = genreIds.join(",");
      const moviesResponse = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreQuery}&sort_by=popularity.desc&language=en-US`
      );

      if (!moviesResponse.ok) {
        throw new Error("Failed to fetch recommended movies");
      }

      const moviesData = await moviesResponse.json();
      setRecommendedMovies(moviesData.results.slice(0, 10));
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedMovies = JSON.parse(
      localStorage.getItem("continueWatching") || "[]"
    );
    setContinueWatchingMovies(storedMovies);

    const fetchContinueWatchingDetails = async () => {
      try {
        const movieDetailsPromises = storedMovies.map((movie) =>
          fetchMovieDetails(movie.id)
        );

        const movieDetails = await Promise.all(movieDetailsPromises);

        const genreIds = Array.from(
          new Set(
            movieDetails
              .filter((detail) => detail && detail.genres)
              .flatMap((detail) => detail.genres.map((genre) => genre.id))
          )
        );

        fetchRecommendations(genreIds);
      } catch (error) {
        console.error("Error fetching continue watching details:", error);
        fetchRecommendations([]);
      }
    };

    if (storedMovies.length > 0) {
      fetchContinueWatchingDetails();
    } else {
      fetchRecommendations([]);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm font-medium">
            Loading recommendations...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm">
          Failed to load recommendations. {error}
        </p>
        <button
          onClick={() => fetchRecommendations([])}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {continueWatchingMovies.length > 0
              ? "Recommended Based on Your Watching"
              : "Popular Recommendations"}
          </h2>
        </div>

        {/* Movies Grid */}
        {recommendedMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recommendedMovies.map((movie) => (
              <RecommendedMovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm">
              No recommendations available. Start watching some movies!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedMovies;
