"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Play,
  Star,
  Clock,
  CalendarDays,
  X,
  Heart,
  Server,
  MoreHorizontal,
  Download,
} from "lucide-react";

const VIDEO_SOURCES = [
  {
    name: "VidLink",
    url: `https://vidlink.pro/movie/`,
    params: "?multiLang=true",
    icon: <Server className="w-4 h-4" />,
    downloadSupport: false,
  },
  {
    name: "2Embed",
    url: `https://2embed.cc/embed/`,
    icon: <Server className="w-4 h-4" />,
    downloadSupport: false,
  },
  {
    name: "VidSrc",
    url: `https://v2.vidsrc.me/embed/`,
    icon: <Server className="w-4 h-4" />,
    downloadSupport: true,
    getDownloadLink: (id) => `https://v2.vidsrc.me/download/${id}`,
  },
  {
    name: "EmbedSu",
    url: `https://embed.su/embed/movie/`,
    params: "?multiLang=true",
    icon: <Server className="w-4 h-4" />,
    downloadSupport: false,
  },
  {
    name: "MultiEmbed",
    url: `https://multiembed.mov/?video_id=`,
    icon: <Server className="w-4 h-4" />,
    downloadSupport: false,
  },
];

const MovieInfo = ({ MovieDetail, genreArr, id }) => {
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const [selectedServer, setSelectedServer] = useState(VIDEO_SOURCES[0]);
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);

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
      const serverUrl = selectedServer.url;
      const serverParams = selectedServer.params || "";
      setIframeSrc(`${serverUrl}${id}${serverParams}`);
    } else {
      setIframeSrc("");
    }
  };

  const handleServerChange = (server) => {
    setSelectedServer(server);
    setIsServerMenuOpen(false);
    if (isTrailerPlaying) {
      const serverUrl = server.url;
      const serverParams = server.params || "";
      setIframeSrc(`${serverUrl}${id}${serverParams}`);
    }
  };

  const handleDownload = () => {
    if (selectedServer.downloadSupport && selectedServer.getDownloadLink) {
      const downloadLink = selectedServer.getDownloadLink(id);

      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = downloadLink;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      // Optional: You might want to add a download attribute if possible
      link.download = `${MovieDetail.title}_${selectedServer.name}.mp4`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Download not supported for this server.");
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
    <div className="relative min-h-screen bg-gradient-to-br mt-16 from-slate-950 via-slate-900 to-indigo-950 py-16 text-slate-100">
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundPath}
          alt={`${MovieDetail.title} background`}
          className="w-full h-full object-cover object-center opacity-30 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 to-slate-950/90" />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-[1fr_2fr] gap-6 items-start">
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
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300 leading-tight tracking-tight">
                {MovieDetail.title}
              </h1>
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

            <p className="text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-indigo-900/30 shadow-inner">
              {MovieDetail.overview}
            </p>

            <div className="space-y-4">
              <div className="flex space-x-4 items-center">
                <button
                  onClick={toggleTrailer}
                  className="flex items-center bg-gradient-to-r from-indigo-700/50 to-purple-700/50 text-indigo-200 px-5 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 hover:text-white transition-colors duration-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isTrailerPlaying ? "Stop" : "Play +"}
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

              {isTrailerPlaying && (
                <div className="w-full mt-4 relative">
                  <div className="bg-slate-900/80 rounded-xl p-2 border border-indigo-900/40 shadow-xl relative">
                    <div className="relative">
                      <iframe
                        src={iframeSrc}
                        allow="autoplay; fullscreen"
                        className="w-full aspect-video rounded-lg border border-indigo-900/30 shadow-inner max-h-[360px]"
                      ></iframe>

                      <div className="absolute top-2 right-2 flex items-center space-x-2">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setIsServerMenuOpen(!isServerMenuOpen)
                            }
                            className="bg-slate-800/50 hover:bg-slate-700/50 p-2 rounded-full transition-colors"
                          >
                            <Server className="w-5 h-5 text-white" />
                          </button>

                          {isServerMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800/90 rounded-lg shadow-xl border border-slate-700/50 z-50">
                              <div className="py-1">
                                {VIDEO_SOURCES.map((server, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleServerChange(server)}
                                    className={`
                                      w-full flex items-center space-x-2 px-3 py-2 text-sm 
                                      transition-colors duration-200
                                      ${
                                        selectedServer.name === server.name
                                          ? "bg-slate-700/50 text-white"
                                          : "hover:bg-slate-700/30 text-slate-300"
                                      }
                                    `}
                                  >
                                    {server.icon}
                                    <span>{server.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {selectedServer.downloadSupport && (
                          <button
                            onClick={handleDownload}
                            className="text-white bg-green-600/70 hover:bg-green-600 p-1.5 rounded-full transition-colors duration-300 shadow-lg"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={toggleTrailer}
                          className="text-white bg-red-600/70 hover:bg-red-600 p-1.5 rounded-full transition-colors duration-300 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 mt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Server className="w-6 h-6 text-slate-400" />
                  <h2 className="text-lg font-semibold text-slate-300">
                    Alternative Streaming Sources
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {VIDEO_SOURCES.map((server, index) => (
                    <div key={index} className="flex items-center">
                      <button
                        onClick={() => handleServerChange(server)}
                        className={`
                          w-full flex items-center justify-center 
                          space-x-2 px-4 py-3 
                          text-sm font-medium
                          transition-all duration-300 
                          ${
                            selectedServer.name === server.name
                              ? "bg-slate-700/50 text-white ring-1 ring-slate-600"
                              : "bg-slate-800/30 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300"
                          }
                          rounded-lg
                        `}
                      >
                        {server.icon}
                        <span>{server.name}</span>
                      </button>
                      {server.downloadSupport && (
                        <button
                          onClick={() => {
                            handleServerChange(server);
                            handleDownload();
                          }}
                          className="ml-2 text-green-400 hover:text-green-300 transition-colors"
                          title="Download Available"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
