"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Star, Clock, CalendarDays, X, Heart } from "lucide-react";

const MovieInfo = ({ MovieDetail, genreArr, id }) => {
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fallback for missing poster
  const posterPath = MovieDetail.poster_path
    ? `https://image.tmdb.org/t/p/w500/${MovieDetail.poster_path}`
    : "https://i.imgur.com/wjVuAGb.png";

  // Calculate runtime in hours and minutes
  const formatRuntime = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Toggle Trailer Playback
  const toggleTrailer = () => setIsTrailerPlaying(!isTrailerPlaying);

  // Toggle Favorite Status
  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (isFavorite) {
      const updatedFavorites = favorites.filter(
        (item) => item.id !== MovieDetail.id
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    } else {
      if (!favorites.some((item) => item.id === MovieDetail.id)) {
        favorites.push(MovieDetail);
        localStorage.setItem("favorites", JSON.stringify(favorites));
      }
    }
    setIsFavorite(!isFavorite);
  };

  // Initialize Favorite Status
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const isMovieFavorited = favorites.some(
      (item) => item.id === MovieDetail.id
    );
    setIsFavorite(isMovieFavorited);
  }, [MovieDetail.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br pt-16 from-indigo-950 via-slate-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Movie Header */}
        <div className="grid lg:grid-cols-[350px_1fr] gap-8 mb-8">
          {/* Poster Section */}
          <div className="relative group mx-auto max-w-[350px] w-full">
            <Image
              src={posterPath}
              alt={MovieDetail.title || "Movie Poster"}
              width={350}
              height={525}
              className="rounded-2xl shadow-2xl transform transition-all 
                duration-300 group-hover:scale-105 group-hover:shadow-3xl"
              priority
            />
            <button
              onClick={toggleTrailer}
              className="absolute inset-0 bg-black/50 flex items-center justify-center 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            >
              <Play className="text-white w-24 h-24 drop-shadow-lg" />
            </button>
          </div>

          {/* Movie Details */}
          <div className="lg:pl-8">
            <h1
              className="text-4xl lg:text-5xl font-black mb-4 text-transparent bg-clip-text 
              bg-gradient-to-r from-indigo-400 to-pink-600"
            >
              {MovieDetail.title}
            </h1>
            {/* Movie Stats */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-slate-300">
              <div className="flex items-center space-x-2">
                <Star className="text-yellow-400 w-5 h-5" />
                <span className="font-semibold">
                  {MovieDetail.vote_average?.toFixed(1) || "N/A"}/10
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <span>{formatRuntime(MovieDetail.runtime)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-pink-400" />
                <span>
                  {MovieDetail.release_date
                    ? new Date(MovieDetail.release_date).getFullYear()
                    : "N/A"}
                </span>
              </div>
            </div>
            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {genreArr?.map((genre, index) => (
                <span
                  key={index}
                  className="bg-slate-800 text-slate-200 px-3 py-1 rounded-full 
                    text-sm transition-colors hover:bg-indigo-800"
                >
                  {genre.name || genre}
                </span>
              ))}
            </div>
            {/* Favorite Button */}
            <button
              onClick={handleFavoriteToggle}
              className="flex items-center text-sm bg-black/50 px-4 py-2 rounded-lg hover:bg-black/70 transition-colors"
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                size={20}
                fill={isFavorite ? "red" : "none"}
                stroke={isFavorite ? "red" : "white"}
                className="mr-2 transition-colors"
              />
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </button>
            {/* Overview */}
            <p className="text-slate-400 text-base leading-relaxed mt-6">
              {MovieDetail.overview}
            </p>{" "}
            <div className="flex space-x-4">
              <button
                onClick={toggleTrailer}
                className="bg-gradient-to-r flex flex-row justify-center items-center from-indigo-600 to-pink-600 
                  text-white px-6 py-3 rounded-lg hover:from-indigo-700 
                  hover:to-pink-700 transition-all transform hover:scale-105 
              "
              >
                <Play className="mr-2 mt-4" />
                Play
              </button>
            </div>
          </div>
        </div>

        {/* Trailer Modal */}
        {isTrailerPlaying && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl aspect-video">
              <button
                onClick={toggleTrailer}
                className="absolute -top-10 right-0 text-white hover:text-indigo-400 
                  transition-colors z-60"
              >
                <X className="w-8 h-8" />
              </button>

              <iframe
                className="w-full h-full rounded-xl shadow-2xl"
                src={`https://v2.vidsrc.me/embed/${id}`}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieInfo;
