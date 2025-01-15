"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Calendar, Info, Loader2, Tv, Film } from "lucide-react";

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
      const genreQuery = genreIds.join(",");

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
              .filter((detail) => detail && detail.genres)
              .flatMap((detail) => detail.genres.map((genre) => genre.id))
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

  const movie = ({ movie }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const isTV = movie.media_type === "tv";
    const title = isTV ? movie.name : movie.title;
    const href = isTV ? "/series/[id]" : "/movie/[id]";
    const as = isTV ? `/series/${movie.id}` : `/movie/${movie.id}`;

    const additionalDetails = {
      rating: movie.vote_average
        ? `${movie.vote_average.toFixed(1)}/10`
        : "N/A",
      date: formatDate(movie.release_date || movie.first_air_date),
      type: isTV ? "Series" : "Movie",
      overview: movie.overview || "No overview available",
    };

    const handleFavoriteToggle = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      if (isFavorite) {
        const updatedFavorites = favorites.filter(
          (item) => item.id !== movie.id
        );
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      } else {
        favorites.push(movie);
        localStorage.setItem("favorites", JSON.stringify(favorites));
      }

      setIsFavorite(!isFavorite);
    };

    useEffect(() => {
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      setIsFavorite(favorites.some((item) => item.id === movie.id));
    }, [movie.id]);

    return (
      <div className="group relative overflow-hidden rounded-2xl bg-slate-900/90 transition-all duration-500 ease-out hover:shadow-lg hover:shadow-slate-700/20">
        <Link href={as} title={title} className="block relative">
          <div className="relative aspect-[2/3] overflow-hidden">
            <div
              className={`h-full w-full transition-opacity duration-700 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={getImagePath(movie.poster_path)}
                alt={movie.title || "Untitled Movie Poster"}
                className="h-full w-full transform object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
                width={288}
                height={432}
                unoptimized
                onLoadingComplete={() => setImageLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900" />
            </div>

            {/* Media Type Badge */}
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition-transform duration-500 ease-out group-hover:-translate-y-1">
              {isTV ? (
                <>
                  <Tv size={12} className="text-blue-400" />
                  <span>Series</span>
                </>
              ) : (
                <>
                  <Film size={12} className="text-purple-400" />
                  <span>Movie</span>
                </>
              )}
            </div>

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteToggle}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2.5 shadow-lg backdrop-blur-sm transition-all duration-500 ease-out hover:bg-black/70"
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                size={16}
                fill={isFavorite ? "red" : "none"}
                stroke={isFavorite ? "red" : "white"}
                className="transition-colors duration-300"
              />
            </button>
          </div>

          {/* Content Container */}
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent p-4 text-white">
            {/* Rating and Date */}
            <div className="mb-2 flex items-center gap-4 text-sm font-medium text-white/90">
              <div className="flex items-center gap-1.5">
                <Star size={14} className="text-yellow-400" />
                <span className="font-semibold">
                  {movie.vote_average
                    ? `${MovieCard.vote_average.toFixed(1)}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-white/70">
                <Calendar size={14} />
                <span>
                  {formatDate(movie.release_date || movie.first_air_date)}
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="mb-1 line-clamp-1 text-lg font-semibold tracking-tight text-white">
              {movie.title}
            </h3>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 p-6 opacity-0 backdrop-blur-sm transition-all duration-500 ease-out group-hover:opacity-100">
            <div className="flex flex-col items-center gap-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
              {/* Synopsis - Limited to 2 lines */}
              <p className="text-sm text-white/80 line-clamp-2 text-center">
                {movie.overview || "No overview available"}
              </p>

              {/* Details Button */}
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/20">
                <Info size={14} />
                View Details
              </span>
            </div>
          </div>
        </Link>
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
      <h2 className="text-2xl font-bold z-[100] text-white mb-6">
        {continueWatchingMovies.length > 0
          ? "Recommended Based on Your Watching"
          : "Popular Recommendations"}
      </h2>
      {recommendedMovies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommendedMovies.map((movie) => (
            <movie key={movie.id} movie={movie} />
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
