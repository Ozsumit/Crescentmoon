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

  const RecommendedMovieCard = ({ movie }) => {
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
      <div className="bg-slate-800/80 rounded-xl overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative group w-full">
        {/* Container that changes layout based on screen size */}
        <div className="flex flex-row lg:flex-col">
          {/* Image Section - Fixed width on mobile, full width on large screens */}
          <div className="relative w-32 lg:w-full flex-shrink-0">
            <Link href={as} title={title} className="block relative">
              <Image
                src={getImagePath(movie.poster_path)}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                width={192}
                height={288}
                unoptimized
                onLoadingComplete={() => setImageLoaded(true)}
              />
            </Link>
            <button
              onClick={handleFavoriteToggle}
              className="absolute top-2 right-2 z-20 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                size={20}
                fill={isFavorite ? "red" : "none"}
                stroke={isFavorite ? "red" : "white"}
                className="transition-colors"
              />
            </button>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-200 font-semibold text-lg line-clamp-1">
                {title}
              </h3>
              <div className="flex items-center gap-2">
                {isTV ? (
                  <div className="flex items-center gap-1">
                    <Tv size={16} className="text-blue-400" />
                    <span className="text-sm text-slate-400">Series</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Film size={16} className="text-purple-400" />
                    <span className="text-sm text-slate-400">Movie</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-4 line-clamp-2 lg:line-clamp-3">
              {additionalDetails.overview}
            </p>

            <div className="mt-auto">
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <div className="flex items-center">
                  <Star size={16} className="mr-1 text-yellow-500" />
                  <span>{additionalDetails.rating}</span>
                </div>

                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  <span>{additionalDetails.date}</span>
                </div>
              </div>

              <Link
                href={href}
                as={as}
                className="inline-flex items-center mt-4 text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                <Info size={16} className="mr-2" />
                More Details
              </Link>
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
      <h2 className="text-2xl font-bold z-[100] text-white mb-6">
        {continueWatchingMovies.length > 0
          ? "Recommended Based on Your Watching"
          : "Popular Recommendations"}
      </h2>
      {recommendedMovies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
