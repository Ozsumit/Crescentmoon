"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Calendar, Info, Loader2 } from "lucide-react";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const RecommendedMovies = () => {
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [continueWatchingMovies, setContinueWatchingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch full movie details to get genres
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

  // Fetch recommendations based on genres from continue watching movies
  const fetchRecommendations = async (genreIds) => {
    try {
      setIsLoading(true);

      if (genreIds.length === 0) {
        // If no genres, fetch default recommendations
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

      // Convert genre IDs to a comma-separated string
      const genreQuery = genreIds.join(',');

      // Fetch recommended movies based on genres
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
    // Fetch continue watching movies from localStorage
    const storedMovies = JSON.parse(
      localStorage.getItem("continueWatching") || "[]"
    );
    setContinueWatchingMovies(storedMovies);

    // Fetch full details for continue watching movies to get their genres
    const fetchContinueWatchingDetails = async () => {
      try {
        // Fetch details for each movie
        const movieDetailsPromises = storedMovies.map((movie) => 
          fetchMovieDetails(movie.id)
        );
        
        const movieDetails = await Promise.all(movieDetailsPromises);
        
        // Extract unique genre IDs
        const genreIds = Array.from(
          new Set(
            movieDetails
              .filter(detail => detail && detail.genres)
              .flatMap(detail => 
                detail.genres.map(genre => genre.id)
              )
          )
        );

        // Fetch recommendations based on these genres
        fetchRecommendations(genreIds);
      } catch (error) {
        console.error("Error fetching continue watching details:", error);
        // Fallback to default recommendations
        fetchRecommendations([]);
      }
    };

    if (storedMovies.length > 0) {
      fetchContinueWatchingDetails();
    } else {
      // If no continue watching movies, fetch default recommendations
      fetchRecommendations([]);
    }
  }, []);

  const getImagePath = (posterPath) => {
    if (posterPath) return `https://image.tmdb.org/t/p/w342/${posterPath}`;
    return "https://i.imgur.com/HIYYPtZ.png";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const RecommendedMovieCard = ({ movie }) => {
    const additionalDetails = {
      rating: movie.vote_average
        ? `${movie.vote_average.toFixed(1)}/10`
        : "N/A",
      date: formatDate(movie.release_date),
      type: "Movie",
      overview: movie.overview || "No overview available",
    };

    return (
      <div className="bg-slate-800/80 rounded-xl h-[14rem] sm:h-auto overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl relative group">
        <Link
          href={`/movie/${movie.id}`}
          title={movie.title}
          className="block relative"
        >
          <Image
            src={getImagePath(movie.poster_path)}
            alt={movie.title || "Untitled Movie Poster"}
            className="w-full h-32 sm:h-48 object-cover rounded-xl transition-transform duration-300 ease-in-out group-hover:scale-110"
            width={288}
            height={176}
            unoptimized
          />
          <div className="absolute top-2 left-2 bg-black/40 text-white/90 px-3 py-1 rounded-md text-xs font-semibold backdrop-blur-sm">
            {additionalDetails.type}
          </div>
        </Link>

        <Link href={`/movie/${movie.id}`}>
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity ease-in-out duration-300 flex flex-col justify-center items-center p-4 text-center text-white">
            <p className="text-sm mb-3 text-shadow-sm line-clamp-3">
              {additionalDetails.overview}
            </p>
            <Link
              href={`/movie/${movie.id}`}
              className="flex items-center text-xs sm:text-sm hover:text-blue-400 transition-colors"
            >
              <Info size={16} className="mr-2" />
              More Details
            </Link>
          </div>
        </Link>

        <div className="p-4">
          <h3 className="text-center text-slate-200 font-semibold text-base mb-2 line-clamp-1">
            {movie.title || "Untitled"}
          </h3>

          <div className="flex flex-col lg:flex-row justify-between items-center text-xs text-slate-400">
            <div className="flex items-center">
              <Star size={14} className="mr-1 text-yellow-500" />
              <span>{additionalDetails.rating}</span>
            </div>

            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{additionalDetails.date}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="flex items-center text-white">
          <Loader2 className="mr-2 animate-spin" size={24} />
          <span>Loading recommendations...</span>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Failed to load recommendations. {error}</p>
        <button
          onClick={() => fetchRecommendations([])}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        {continueWatchingMovies.length > 0 
          ? "Recommended Based on Your Watching" 
          : "Popular Recommendations"}
      </h2>
      {recommendedMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recommendedMovies.map((movie) => (
            <RecommendedMovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-center">
          No recommendations available. Start watching some movies!
        </p>
      )}
    </div>
  );
};

export default RecommendedMovies;