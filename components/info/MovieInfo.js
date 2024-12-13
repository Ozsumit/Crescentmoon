"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Play, Star, Clock, CalendarDays, X, Heart } from "lucide-react";

const VIDEO_SOURCES = [
  { name: "2Embed", url: `https://2embed.cc/embed/` },
  { name: "VidSrc", url: `https://v2.vidsrc.me/embed/` },
  { name: "StreamTape", url: `https://streamtape.com/e/` },
];

const MovieInfo = ({ MovieDetail, genreArr, id }) => {
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const [selectedServer, setSelectedServer] = useState(VIDEO_SOURCES[1]);

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
      setIframeSrc(`${selectedServer.url}${id}`);
    } else {
      setIframeSrc("");
    }
  };

  const handleServerChange = (server) => {
    setSelectedServer(server);
    if (isTrailerPlaying) {
      setIframeSrc(`${server.url}${id}`);
    }
  };

  const handleFavoriteToggle = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

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
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.some((item) => item.id === MovieDetail.id));
  }, [MovieDetail.id]);

  useEffect(() => {
    if (isTrailerPlaying) {
      const continueWatching = JSON.parse(
        localStorage.getItem("continueWatching") || "[]"
      );

      const movieIndex = continueWatching.findIndex(
        (movie) => movie.id === MovieDetail.id
      );

      if (movieIndex === -1) {
        continueWatching.push({
          id: MovieDetail.id,
          title: MovieDetail.title,
          poster_path: MovieDetail.poster_path,
          backdrop_path: MovieDetail.backdrop_path,
          runtime: MovieDetail.runtime,
        });
      }

      localStorage.setItem(
        "continueWatching",
        JSON.stringify(continueWatching)
      );
    }
  }, [isTrailerPlaying, MovieDetail]);

  return (
    <div className="relative min-h-screen mt-16 
    bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-16 text-slate-100">
      {/* Background image remains the same */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundPath}
          alt={`${MovieDetail.title} background`}
          className="w-full h-full object-cover object-center opacity-30 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 to-slate-950/90" />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Main content grid remains the same */}
        <div className="grid md:grid-cols-[1fr_2fr] gap-6 items-start">
          {/* Poster and details remain the same */}
          <div className="relative max-w-md mx-auto md:sticky md:top-8">
            <div className="overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
              <img
                src={posterPath}
                alt={MovieDetail.title || "Movie Poster"}
                className="w-full h-auto object-cover rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-6 md:pl-6">
            {/* Title and details remain the same */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300 leading-tight tracking-tight">
                {MovieDetail.title}
              </h1>
              {/* Rating, runtime, year details remain the same */}
              <div className="flex flex-wrap items-center space-x-4 text-slate-400">
                <div className="flex items-center space-x-2">
                  <Star className="text-yellow-400 w-5 h-5" />
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

            {/* Genres remain the same */}
            <div className="flex flex-wrap gap-2">
              {genreArr?.map((genre, index) => (
                <span
                  key={index}
                  className="bg-indigo-900/40 text-indigo-200 px-3 py-1 rounded-full text-sm"
                >
                  {genre.name || genre}
                </span>
              ))}
            </div>

            {/* Overview remains the same */}
            <p className="text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-indigo-900/30 shadow-inner">
              {MovieDetail.overview}
            </p>

            {/* Buttons and trailer section */}
            <div className="space-y-4">
              <div className="flex space-x-4 items-center">
                <button
                  onClick={toggleTrailer}
                  className="flex items-center bg-gradient-to-r from-indigo-700/50 to-purple-700/50 text-indigo-200 px-5 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 hover:text-white transition-colors duration-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isTrailerPlaying ? "Stop" : "Play"}
                </button>
                <button
                  onClick={handleFavoriteToggle}
                  className={`flex items-center px-5 py-2 rounded-lg transition-colors duration-300 ${
                    isFavorite
                      ? "bg-red-700/70 text-white hover:bg-red-700"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                </button>
              </div>

              {/* Optimized trailer iframe */}
              {isTrailerPlaying && (
                <div className="w-full mt-4">
                  <div className="bg-slate-900/80 rounded-xl p-2 border border-indigo-900/40 shadow-xl relative">
                    <iframe
                      src={iframeSrc}
                      allow="autoplay; fullscreen"
                      className="w-full aspect-video rounded-lg border border-indigo-900/30 shadow-inner max-h-[360px]"
                    ></iframe>
                    <button
                      onClick={toggleTrailer}
                      className="absolute -top-2 -right-2 text-white bg-red-600/70 hover:bg-red-600 p-1.5 rounded-full transition-colors duration-300 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Server selection remains the same */}
              <div className="space-y-4 mt-4">
                <h2 className="text-lg font-semibold text-indigo-200">
                  Watch on Other Servers:
                </h2>
                <div className="flex space-x-4">
                  {VIDEO_SOURCES.map((server, index) => (
                    <button
                      key={index}
                      onClick={() => handleServerChange(server)}
                      className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                        selectedServer.name === server.name
                          ? "bg-purple-700/70 text-white"
                          : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {server.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieInfo;
