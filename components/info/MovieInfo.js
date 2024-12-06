"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Star, Clock, CalendarDays, X, Heart } from "lucide-react";

const MovieInfo = ({ MovieDetail, genreArr, id }) => {
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const posterPath = MovieDetail.poster_path
    ? `https://image.tmdb.org/t/p/w500${MovieDetail.poster_path}`
    : "https://via.placeholder.com/500x750.png?text=Movie+Poster";

  const backgroundPath = MovieDetail.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${MovieDetail.backdrop_path}`
    : posterPath;

  const formatRuntime = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const toggleTrailer = () => {
    setIsTrailerPlaying(!isTrailerPlaying);
    if (!isTrailerPlaying) {
      setIframeSrc(`https://v2.vidsrc.me/embed/${id}`);
    } else {
      setIframeSrc("");
    }
  };

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
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

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((item) => item.id === MovieDetail.id));
  }, [MovieDetail.id]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pt-16 text-slate-100 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundPath}
          alt={`${MovieDetail.title} background`}
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          className="opacity-20 blur-sm"
          onLoadingComplete={() => setIsImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 to-slate-950/90" />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 container mx-auto px-4 py-8 max-w-6xl transition-all duration-700 ${
          isImageLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="grid md:grid-cols-[1fr_2fr] gap-8 items-start">
          {/* Poster Section */}
          <div className="relative group max-w-md mx-auto md:sticky md:top-8">
            <div className="relative overflow-hidden rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:rotate-1 hover:shadow-xl">
              <Image
                src={posterPath}
                alt={MovieDetail.title || "Movie Poster"}
                width={350}
                height={525}
                className="w-full h-auto object-cover rounded-2xl"
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={toggleTrailer}
                  className="bg-white/30 backdrop-blur-sm p-3 rounded-full hover:scale-110 transition-transform"
                >
                  <Play className="text-white w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6 md:pl-8">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300 leading-tight tracking-tight">
                {MovieDetail.title}
              </h1>
              <div className="flex flex-wrap items-center space-x-4 text-slate-400">
                <div className="flex items-center space-x-2">
                  <Star className="text-yellow-400 w-5 h-5 animate-pulse" />
                  <span className="font-medium">
                    {MovieDetail.vote_average?.toFixed(1) || "N/A"}/10
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="text-indigo-400 w-5 h-5" />
                  <span>{formatRuntime(MovieDetail.runtime)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarDays className="text-pink-400 w-5 h-5" />
                  <span>
                    {MovieDetail.release_date
                      ? new Date(MovieDetail.release_date).getFullYear()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {genreArr?.map((genre, index) => (
                <span
                  key={index}
                  className="bg-indigo-900/30 text-indigo-200 px-3 py-1 rounded-full text-sm transition-all duration-300 hover:bg-indigo-800/50 hover:scale-105 hover:shadow-lg"
                >
                  {genre.name || genre}
                </span>
              ))}
            </div>

            {/* Overview */}
            <p className="text-slate-400 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-indigo-900/30 shadow-inner">
              {MovieDetail.overview}
            </p>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={toggleTrailer}
                className="flex items-center bg-gradient-to-r from-indigo-600/40 to-purple-600/40 text-indigo-200 px-5 py-2 rounded-lg hover:from-indigo-600/60 hover:to-purple-600/60 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
              >
                <Play className="mr-2 w-5 h-5" />
                Play Movie
              </button>
              <button
                onClick={handleFavoriteToggle}
                className={`flex items-center px-5 py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] ${
                  isFavorite
                    ? "bg-gradient-to-r from-pink-600/60 to-red-600/60 text-pink-100"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
                }`}
              >
                <Heart
                  size={20}
                  fill={isFavorite ? "rgb(251 113 133)" : "none"}
                  stroke={isFavorite ? "rgb(251 113 133)" : "currentColor"}
                  className={`mr-2 ${isFavorite ? "animate-pulse" : ""}`}
                />
                {isFavorite ? "Remove Favorite" : "Add Favorite"}
              </button>
            </div>

            {/* Trailer Section - Inline trailer */}
            {isTrailerPlaying && (
              <div className="w-full col-span-full mt-8">
                <div className="relative w-full max-w-4xl mx-auto">
                  <div className="bg-slate-900/50 rounded-xl border border-indigo-900/30 p-2 shadow-2xl">
                    <div className="aspect-video w-full relative">
                      <button
                        onClick={toggleTrailer}
                        className="absolute -top-8 right-0 text-slate-300 hover:text-indigo-300 transition-colors z-10"
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <iframe
                        className="absolute inset-0 w-full h-full rounded-lg"
                        src={iframeSrc}
                        // sandbox="allow-scripts allow-orientation-lock allow-same-origin"
                        // frameBorder="0"
                        referrerpolicy="no-referrer"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          filter: "brightness(0.9) contrast(1.1)",
                          boxShadow: "inset 0 0 15px rgba(99, 102, 241, 0.3)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieInfo;
