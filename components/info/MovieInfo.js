"use client";
import React, { useState, useEffect } from "react";
import {
  Star,
  Clock,
  CalendarDays,
  X,
  Heart,
  Server,
  Download,
  User,
} from "lucide-react";

const VIDEO_SOURCES = [
  {
    name: "VidLink",
    url: `https://vidlink.pro/movie/`,
    params:
      "?primaryColor=63b8bc&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=default&title=true&poster=true&autoplay=true&nextbutton=true&mute=false",
    icon: <Server className="w-4 h-4" />,
    downloadSupport: false,
  },
  {
    name: "2Embed",
    url: `https://2embed.cc/embed/movie/`,
    icon: <Server className="w-4 h-4" />,
    downloadSupport: false,
  },{
    name: "Binge",
    url: `https://vidbinge.dev/embed/movie/`,
    icon: <Server className="w-4 h-4" />,
    downloadSupport: false,
    parseUrl: true,
  },
  {
    name: "VidSrc",
    params: "?multiLang=true",
    url: `https://v2.vidsrc.me/embed/movie/`,
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
    url: `https://multiembed.mov/directstream.php?video_id=`,
    params: "&tmdb=1",
    icon: <Server className="w-4 h-4" />,
    downloadSupport: false,
  },
  
];

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const MovieInfo = ({ MovieDetail, genreArr, id }) => {
  const [iframeSrc, setIframeSrc] = useState("");
  const [selectedServer, setSelectedServer] = useState(VIDEO_SOURCES[0]);
  const [castInfo, setCastInfo] = useState([]);
  const [isLoadingCast, setIsLoadingCast] = useState(false);
  const [serverMenuOpen, setServerMenuOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);

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

  const handleServerChange = async (server) => {
    setSelectedServer(server);
    let serverUrl = server.url;
    let serverParams = server.params || "";

    if (server.parseUrl) {
      const response = await fetch(`${serverUrl}${id}`);
      const data = await response.json();
      serverUrl = data.url; // Assuming the URL is provided in the 'url' field of the response
    } else {
      serverUrl = `${serverUrl}${id}${serverParams}`;
    }

    setIframeSrc(serverUrl);
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

  const updateContinueWatching = () => {
    const continueWatching = JSON.parse(
      localStorage.getItem("continueWatching") || "[]"
    );

    const existingMovieIndex = continueWatching.findIndex(
      (item) => item.id === MovieDetail.id
    );

    const movieEntry = {
      ...MovieDetail,
      watchedAt: Date.now(),
      progress: watchProgress,
    };

    if (existingMovieIndex !== -1) {
      continueWatching[existingMovieIndex] = movieEntry;
    } else {
      continueWatching.push(movieEntry);
    }

    const sortedContinueWatching = continueWatching
      .sort((a, b) => b.watchedAt - a.watchedAt)
      .slice(0, 10);

    localStorage.setItem(
      "continueWatching",
      JSON.stringify(sortedContinueWatching)
    );
  };

  const fetchCastInfo = async () => {
    setIsLoadingCast(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${TMDB_API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch cast details");
      }

      const data = await response.json();
      setCastInfo(data.cast.slice(0, 10));
    } catch (error) {
      console.error("Error fetching cast info:", error);
    } finally {
      setIsLoadingCast(false);
    }
  };

  const handleIframeLoad = () => {
    // Simulate progress tracking
    const randomProgress = Math.floor(Math.random() * 100);
    setWatchProgress(randomProgress);
    updateContinueWatching();
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.some((item) => item.id === MovieDetail.id));

    fetchCastInfo();
    handleServerChange(selectedServer);
  }, [MovieDetail.id, id, selectedServer]);

  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.origin !== "https://vidlink.pro") return;

      if (event.data?.type === "MEDIA_DATA") {
        const mediaData = event.data.data;
        localStorage.setItem("vidLinkProgress", JSON.stringify(mediaData));
      }
    });
  }, []);

  return (
    <div
      className={`
        relative min-h-screen pt-8 mb-8 px-4
        bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950
        py-16 text-slate-100
      `}
    >
      <div
        className={`
         w-full mb-16 mt-12 z-40 relative flex justify-center
       `}
      >
        <div
          className={`
      bg-slate-900/80 drop-shadow-lg rounded-xl p-3
      border border-indigo-900/40 shadow-xl relative w-[930px]
    `}
        >
          {/* Server Selection Menu */}
          <div className="absolute top-3 right-3 z-[100]">
            <div className="relative">
              <button
                className="px-2.5 py-1.5 bg-gray-800 text-indigo-200 hover:bg-gray-700 rounded-lg shadow-lg border border-indigo-900/30 transition-colors"
                onClick={() => setServerMenuOpen((prev) => !prev)}
              >
                <Server className="w-4 h-4" />
              </button>

              {serverMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-gray-900 rounded-lg shadow-2xl border border-indigo-900/40 overflow-hidden">
                  {VIDEO_SOURCES.map((server, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleServerChange(server);
                        setServerMenuOpen(false);
                      }}
                      className={`
                  flex items-center w-full px-3 py-2 text-xs text-left
                  transition-colors duration-200
                  ${
                    selectedServer.name === server.name
                      ? "bg-indigo-700 text-white"
                      : "hover:bg-gray-800 text-indigo-200"
                  }
                `}
                    >
                      <span className="mr-2 scale-90">{server.icon}</span>
                      <span>{server.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Video Iframe */}
          <div className="flex justify-center z-50 relative">
            <iframe
              onLoad={handleIframeLoad}
              src={iframeSrc}
              allow="autoplay; fullscreen; picture-in-picture"
              frameborder="0"
              allowfullscreen
              className="
    w-full
    sm:w-[900px]
    aspect-video
    rounded-lg
    border border-indigo-900/30
    shadow-inner
    z-50
    opacity-100
    scale-100
  "
            ></iframe>
          </div>
        </div>
      </div>

      <div className="absolute mt-8 inset-0 z-0">
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
            <img
              src={posterPath}
              alt={MovieDetail.title || "Movie Poster"}
              className="w-full h-auto object-cover rounded-xl shadow-lg"
            />
          </div>

          <div className="space-y-6 md:pl-6">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">
              {MovieDetail.title}
            </h1>
            <div className="flex flex-wrap items-center space-x-4 text-slate-400">
              <div className="flex items-center space-x-2">
                <Star className="text-yellow-400 w-5 h-5" />
                <span>{MovieDetail.vote_average?.toFixed(1) || "N/A"}/10</span>
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

            <div className="space-y-6">
              <button
                onClick={handleFavoriteToggle}
                className={`flex items-center px-5 py-2 rounded-lg transition-colors duration-300 ${
                  isFavorite
                    ? "bg-red-700/70 text-white hover:bg-red-700"
                    : "bg-gray-700/50 text-white hover:bg-gray-700/70"
                }`}
              >
                <Heart className="w-5 h-5 mr-2" />
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </button>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-indigo-200">
                  Watch on:
                </h2>
                <div className="flex flex-wrap gap-3">
                  {VIDEO_SOURCES.map((server, index) => (
                    <button
                      key={index}
                      onClick={() => handleServerChange(server)}
                      className={`flex items-center px-4 py-2 rounded-lg border transition-colors duration-300 ${
                        selectedServer.name === server.name
                          ? "bg-indigo-700 text-white border-indigo-500"
                          : "bg-gray-700/50 text-indigo-200 hover:bg-gray-700/70 border-indigo-900/30"
                      }`}
                    >
                      {server.icon}
                      <span className="ml-2">{server.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedServer.downloadSupport && (
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-indigo-200">
                    Download:
                  </h2>
                  <a
                    href={selectedServer.getDownloadLink(id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-5 py-2 rounded-lg bg-green-700/70 text-white hover:bg-green-700 transition-colors duration-300"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Movie
                  </a>
                </div>
              )}

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-indigo-200">
                  Top Cast:
                </h2>
                {isLoadingCast ? (
                  <p className="text-slate-300">Loading cast details...</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {castInfo.map((cast, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center text-center"
                      >
                        <img
                          src={
                            cast.profile_path
                              ? `https://image.tmdb.org/t/p/w200${cast.profile_path}`
                              : "https://via.placeholder.com/100x150.png?text=No+Image"
                          }
                          alt={cast.name}
                          className="w-24 h-36 object-cover rounded-lg shadow-md"
                        />
                        <p className="mt-2 text-sm text-slate-200">
                          {cast.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {cast.character}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieInfo;
