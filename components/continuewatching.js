"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Calendar, Info } from "lucide-react";

const ContinueWatching = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const storedMovies = JSON.parse(
      localStorage.getItem("continueWatching") || "[]"
    );
    setMovies(storedMovies);
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

  const ContinueWatchingCard = ({ movie }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    const additionalDetails = {
      rating: movie.vote_average
        ? `${movie.vote_average.toFixed(1)}/10`
        : "N/A",
      date: formatDate(movie.release_date),
      type: "Movie",
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

        <button
          onClick={handleFavoriteToggle}
          className="absolute top-2 right-2 z-20 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={20}
            fill={isFavorite ? "red" : "none"}
            stroke={isFavorite ? "red" : "white"}
            className="transition-colors"
          />
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Continue Watching</h2>
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <ContinueWatchingCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-center">
          No movies to continue watching. Start watching one now!
        </p>
      )}
    </div>
  );
};

export default ContinueWatching;
