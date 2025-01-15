"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Star,
  Clock,
  CalendarDays,
  Server,
  Download,
  Heart,
  Fullscreen,
  Share2,
  Info,
  ChevronUp,
  ChevronDown,
  Eye,
  ThumbsUp,
  Users,
  Play,
  Film,
  Award,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import HomeCards from "@/components/display/HomeCard";

const VIDEO_SOURCES = [
  {
    name: "VidLink",
    url: `https://vidlink.pro/movie/`,
    params:
      "?primaryColor=63b8bc&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=default&title=true&poster=true&autoplay=true&nextbutton=true&mute=false",
    icon: <Play className="w-4 h-4" />,
    downloadSupport: false,
  },
  {
    name: "2Embed",
    url: `https://2embed.cc/embed/movie/`,
    icon: <Film className="w-4 h-4" />,
    downloadSupport: false,
  },
  {
    name: "Binge",
    url: `https://vidbinge.dev/embed/movie/`,
    icon: <Eye className="w-4 h-4" />,
    downloadSupport: false,
    parseUrl: true,
  },
  {
    name: "VidSrc",
    params: "?multiLang=true",
    url: `https://v2.vidsrc.me/embed/movie/`,
    icon: <Award className="w-4 h-4" />,
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
    icon: <Film className="w-4 h-4" />,
    downloadSupport: false,
  },
];

const MovieInfo = ({ MovieDetail, genreArr, id }) => {
  const [iframeSrc, setIframeSrc] = useState("");
  const [selectedServer, setSelectedServer] = useState(VIDEO_SOURCES[0]);
  const [castInfo, setCastInfo] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingCast, setIsLoadingCast] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMoreCast, setShowMoreCast] = useState(false);
  const videoContainerRef = useRef(null);

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
  // import { useEffect } from 'react';

  const simulateKeyPress = () => {
    const keyEvent = new KeyboardEvent("keydown", {
      key: "M",
      code: "KeyM",
      keyCode: 77,
      which: 77,
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(keyEvent);
    console.log("M key press simulated");
  };

  // Auto-trigger on component mount with 3 second delay
  useEffect(() => {
    // Ensure we're running on client side
    if (typeof window !== "undefined") {
      const timer = setTimeout(() => {
        simulateKeyPress();
      }, 3000);

      // Cleanup timeout if component unmounts
      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Optional: Monitor actual M key presses
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "M" || event.key === "m") {
        console.log("M key was pressed!");
        // Add your custom logic here
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);
  const handleServerChange = async (server) => {
    setSelectedServer(server);
    let serverUrl = server.url;
    let serverParams = server.params || "";

    try {
      if (server.parseUrl) {
        const response = await fetch(`${serverUrl}${id}`);
        const data = await response.json();
        serverUrl = data.url;
      } else {
        serverUrl = `${serverUrl}${id}${serverParams}`;
      }
      setIframeSrc(serverUrl);
      showNotification(`Switched to ${server.name} server`);
    } catch (error) {
      showNotification("Failed to load server. Please try another one.");
    }
  };

  const showNotification = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleFavoriteToggle = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (isFavorite) {
      const updatedFavorites = favorites.filter(
        (item) => item.id !== MovieDetail.id
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      showNotification("Removed from favorites");
    } else {
      if (!favorites.some((item) => item.id === MovieDetail.id)) {
        favorites.push(MovieDetail);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        showNotification("Added to favorites");
      }
    }
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showNotification("Link copied to clipboard!");
    } catch (err) {
      showNotification("Failed to copy link");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const CastMember = ({ cast }) => (
    <div className="flex items-center space-x-3">
      <img
        src={
          cast.profile_path
            ? `https://image.tmdb.org/t/p/w200${cast.profile_path}`
            : "https://via.placeholder.com/200x300?text=No+Image"
        }
        alt={cast.name}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">
          {cast.name}
        </p>
        <p className="text-xs text-slate-400 truncate">{cast.character}</p>
      </div>
    </div>
  );

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.some((item) => item.id === MovieDetail.id));
    handleServerChange(selectedServer);

    const fetchData = async () => {
      setIsLoadingCast(true);
      setIsLoadingRecommendations(true);
      try {
        const [castResponse, recommendationsResponse] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
          ),
          fetch(
            `https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
          ),
        ]);

        const castData = await castResponse.json();
        const recommendationsData = await recommendationsResponse.json();

        setCastInfo(castData.cast.slice(0, 10));
        setRecommendations(recommendationsData.results.slice(0, 6));
      } catch (error) {
        showNotification("Failed to load some content");
      } finally {
        setIsLoadingCast(false);
        setIsLoadingRecommendations(false);
      }
    };

    fetchData();
  }, [MovieDetail.id, id]);

  return (
    <TooltipProvider>
      <div className="min-h-screen pt-16 md:pt-20 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 to-slate-950/70" />
            <img
              src={backgroundPath}
              alt="background"
              className="w-full h-full object-cover object-center opacity-30"
            />
          </div>

          <div className="max-w-8xl mx-auto px-3 py-4 lg:px-8 lg:py-6">
            <div className="grid lg:grid-cols-[2fr_1fr] gap-4 lg:gap-6">
              {/* Video Player Section */}
              <div className="order-1 lg:order-1">
                <div
                  ref={videoContainerRef}
                  className="relative bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800/50"
                >
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <iframe
                      src={iframeSrc}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                    {!iframeSrc && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-900/90 backdrop-blur-sm">
                    <Sheet>
                      <SheetTrigger asChild>
                        <button className="px-3 py-1.5 text-white bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2">
                          {selectedServer.icon}
                          <span className="text-sm font-medium">
                            {selectedServer.name}
                          </span>
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      </SheetTrigger>
                      <SheetContent
                        side="bottom"
                        className="bg-slate-900/95 backdrop-blur-xl border-slate-700"
                      >
                        <div className="grid grid-cols-3 gap-2 pt-4">
                          {VIDEO_SOURCES.map((server) => (
                            <Tooltip key={server.name}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleServerChange(server)}
                                  className={`p-3 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                    selectedServer.name === server.name
                                      ? "bg-indigo-600 text-white"
                                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                  }`}
                                >
                                  {server.icon}
                                  {server.name}
                                </button>
                              </TooltipTrigger>
                              {/* <TooltipContent> */}
                              {/* <p className="text-white">Switch to {server.name}</p> */}
                              {/* </TooltipContent> */}
                            </Tooltip>
                          ))}
                        </div>
                      </SheetContent>
                    </Sheet>

                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleShare}
                            className="p-2 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Share movie</p>
                        </TooltipContent>
                      </Tooltip>
                      {/* 
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={toggleFullscreen}
                            className="p-2 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                          >
                            <Fullscreen className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Toggle fullscreen</p>
                        </TooltipContent>
                      </Tooltip> */}
                    </div>
                  </div>
                </div>

                {/* Similar Movies Section - Desktop Only */}
                <div className="hidden lg:block space-y-4 mt-6">
                  <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                    <Film className="w-5 h-5 text-indigo-400" />
                    Similar Movies
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {isLoadingRecommendations
                      ? Array(6)
                          .fill(0)
                          .map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="aspect-[2/3] bg-slate-800 rounded-lg" />
                              <div className="h-4 bg-slate-800 rounded mt-2" />
                            </div>
                          ))
                      : recommendations.map((movie) => (
                          <HomeCards
                            key={`${movie.media_type}-${movie.id}`}
                            MovieCard={movie}
                            className="aspect-[2/3]"
                          />
                        ))}
                  </div>
                </div>
              </div>

              {/* Movie Info Section */}
              <div className="order-2 lg:order-2 space-y-4">
                <div className=" rounded-xl overflow-hidden shadow-xl border border-slate-800/50">
                  <img
                    src={posterPath}
                    alt={MovieDetail.title}
                    className="w-full"
                  />
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-slate-800/50 space-y-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">
                      {MovieDetail.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Star className="text-yellow-400 w-4 h-4" />
                        <span>
                          {MovieDetail.vote_average?.toFixed(1) || "N/A"}/10
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="text-indigo-400 w-4 h-4" />
                        <span>{formatRuntime(MovieDetail.runtime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarDays className="text-pink-400 w-4 h-4" />
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
                        className="bg-indigo-900/40 text-indigo-200 px-2.5 py-1 rounded-full text-xs"
                      >
                        {genre.name || genre}
                      </span>
                    ))}
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleFavoriteToggle}
                        className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg transition-all ${
                          isFavorite
                            ? "bg-red-500/20 text-red-700 hover:bg-red-700/30"
                            : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 mr-2 transition-transform ${
                            isFavorite ? "fill-current scale-110" : "scale-100"
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {isFavorite ? "Remove" : "Add to Favorites"}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {MovieDetail.overview}
                  </p>

                  {/* Cast Section */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      Cast
                    </h2>
                    <div className="space-y-3">
                      {isLoadingCast ? (
                        Array(3)
                          .fill(0)
                          .map((_, i) => (
                            <div
                              key={i}
                              className="animate-pulse flex items-center space-x-3"
                            >
                              <div className="w-12 h-12 bg-slate-800 rounded-full" />
                              <div className="flex-1">
                                <div className="h-4 bg-slate-800 rounded w-24" />
                                <div className="h-3 bg-slate-800 rounded w-20 mt-1" />
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="space-y-3">
                          {castInfo
                            .slice(0, showMoreCast ? undefined : 4)
                            .map((cast) => (
                              <CastMember key={cast.id} cast={cast} />
                            ))}
                          {castInfo.length > 4 && (
                            <button
                              onClick={() => setShowMoreCast(!showMoreCast)}
                              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                            >
                              {showMoreCast ? "Show Less" : "Show More"}
                              {showMoreCast ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {selectedServer.downloadSupport && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={selectedServer.getDownloadLink(id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center px-4 py-2.5 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download movie</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* Desktop-only poster */}
                {/* <div className="hidden lg:block rounded-xl overflow-hidden shadow-xl border border-slate-800/50">
                  <img
                    src={posterPath}
                    alt={MovieDetail.title}
                    className="w-full"
                  />
                </div> */}
              </div>

              {/* Similar Movies Section - Mobile Only */}
              <div className="order-3 lg:hidden space-y-4">
                <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                  <Film className="w-5 h-5 text-indigo-400" />
                  Similar Movies
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {isLoadingRecommendations
                    ? Array(6)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="aspect-[2/3] bg-slate-800 rounded-lg" />
                            <div className="h-4 bg-slate-800 rounded mt-2" />
                          </div>
                        ))
                    : recommendations.map((movie) => (
                        <HomeCards
                          key={`${movie.media_type}-${movie.id}`}
                          MovieCard={movie}
                          className="aspect-[2/3]"
                        />
                      ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Alert */}
        <div className="fixed bottom-4 right-4 z-50">
          <Alert
            className={`transition-opacity duration-300 ${
              showAlert ? "opacity-100" : "opacity-0 pointer-events-none"
            } bg-slate-900/95 backdrop-blur-sm border-slate-700`}
          >
            <AlertDescription className="text-slate-200 flex items-center gap-2">
              <Info className="w-4 h-4" />
              {alertMessage}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MovieInfo;
