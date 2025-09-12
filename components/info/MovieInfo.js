"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Star,
  Clock,
  CalendarDays,
  Server,
  Heart,
  Share2,
  Info,
  ChevronUp,
  ChevronDown,
  ThumbsUp,
  Users,
  Play,
  Film,
  Loader2,
  Languages,
  Zap,
  ShieldAlert,
  Clapperboard,
  Check,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import HomeCards from "@/components/display/HomeCard";

// --- VIDEO_SOURCES DEFINITION ---
const VIDEO_SOURCES = [
  {
    name: "VidLink",
    url: "https://vidlink.pro/movie/",
    params:
      "?primaryColor=6a5fef&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=jw&title=true&poster=true&autoplay=true&nextbutton=true",
    icon: <Play className="w-5 h-5 text-pink-400" />,
    features: ["Recommended", "Fast"],
    description: "Fast loading with a modern player.",
  },
  {
    name: "VidSrc",
    url: "https://v2.vidsrc.me/embed/movie/",
    params: "?multiLang=true",
    icon: <Languages className="w-5 h-5 text-blue-400" />,
    features: ["Multi-Language"],
    description: "Good source for non-English audio.",
  },
  {
    name: "VidSrc 2",
    url: "https://vidsrc.icu/embed/movie/",
    params: "?multiLang=true",
    icon: <Languages className="w-5 h-5 text-blue-400" />,
    features: ["Multi-Language", "Backup"],
    description: "Alternative source for subtitles.",
  },
  {
    name: "VidSrc 3",
    url: "https://player.vidsrc.co/embed/movie/",
    params:
      "?autoplay=true&autonext=true&nextbutton=true&poster=true&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&fontcolor=FFFFFF&fontsize=16px&opacity=0.5&font=Poppins",
    icon: <Clapperboard className="w-5 h-5 text-slate-400" />,
    features: [],
    description: "A reliable classic player.",
  },
  {
    name: "2Embed",
    url: "https://2embed.cc/embed/movie/",
    icon: <Film className="w-5 h-5 text-teal-400" />,
    features: ["Ads"],
    description: "May have more pop-up ads.",
  },
  {
    name: "Binge",
    url: "https://vidbinge.dev/embed/movie/",
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
    features: ["Fast"],
    parseUrl: true,
    description: "Quick-loading, lightweight player.",
  },
];

// --- HELPER COMPONENTS ---
const FeatureBadge = ({ feature }) => {
  const styles = {
    recommended: "bg-green-500/20 text-green-300",
    "multi-language": "bg-blue-500/20 text-blue-300",
    fast: "bg-yellow-500/20 text-yellow-300",
    ads: "bg-orange-500/20 text-orange-300",
    unstable: "bg-red-500/20 text-red-300",
    backup: "bg-slate-700/50 text-slate-300",
  };
  const colorClass = styles[feature.toLowerCase()] || styles.backup;
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${colorClass}`}
    >
      {feature}
    </span>
  );
};

const Review = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const isLongContent = review.content.length > 300;
  const displayContent = expanded
    ? review.content
    : review.content.slice(0, 300);

  return (
    <div className="bg-slate-900/50 rounded-lg p-6 mb-4 border border-slate-800/50">
      <div className="flex items-start space-x-4">
        <Avatar className="w-10 h-10">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.author}`}
          />
          <AvatarFallback>
            {review.author.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-slate-200">
              {review.author}
            </h3>
            <div className="flex items-center space-x-2 text-slate-400">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">
                {review.author_details?.rating || "N/A"}/10
              </span>
            </div>
          </div>
          <div className="mt-2 text-slate-300 text-sm leading-relaxed">
            <p>
              {displayContent}
              {isLongContent && !expanded && "..."}
            </p>
            {isLongContent && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
              >
                {expanded ? "Show Less" : "Read More"}
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
          <div className="mt-2 text-slate-400 text-sm">
            {new Date(review.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const MovieInfo = ({ MovieDetail, genreArr, id }) => {
  const getInitialServer = useCallback(() => {
    if (typeof window !== "undefined") {
      const storedServerName = localStorage.getItem("selectedMovieServer");
      const foundServer = VIDEO_SOURCES.find(
        (server) => server.name === storedServerName
      );
      if (foundServer) return foundServer;
    }
    return (
      VIDEO_SOURCES.find((s) => s.features.includes("Recommended")) ||
      VIDEO_SOURCES[0]
    );
  }, []);

  const [selectedServer, setSelectedServer] = useState(getInitialServer);
  const [iframeSrc, setIframeSrc] = useState("");
  const [castInfo, setCastInfo] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoadingCast, setIsLoadingCast] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showMoreCast, setShowMoreCast] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // --- START: UNIFIED PROGRESS TRACKING LOGIC ---
  useEffect(() => {
    if (!MovieDetail?.id || !MovieDetail.title) return;

    try {
      const progressData = JSON.parse(
        localStorage.getItem("mediaProgress") || "{}"
      );
      const existingEntry = progressData[MovieDetail.id] || {};

      const progressPayload = existingEntry.progress
        ? {}
        : {
            progress: {
              watched: 1,
              duration: MovieDetail.runtime * 60 || 1,
            },
          };

      progressData[MovieDetail.id] = {
        ...existingEntry,
        id: MovieDetail.id,
        type: "movie",
        title: MovieDetail.title,
        poster_path: MovieDetail.poster_path,
        last_updated: Date.now(),
        ...progressPayload,
      };

      localStorage.setItem("mediaProgress", JSON.stringify(progressData));
    } catch (error) {
      console.error("Failed to update media progress:", error);
    }
  }, [MovieDetail]);

  useEffect(() => {
    const handleVidLinkMessage = (event) => {
      if (
        event.origin !== "https://vidlink.pro" ||
        event.data?.type !== "MEDIA_DATA"
      )
        return;

      const vidLinkDataStore = event.data.data;
      try {
        const progressData = JSON.parse(
          localStorage.getItem("mediaProgress") || "{}"
        );
        for (const mediaId in vidLinkDataStore) {
          if (progressData[mediaId]) {
            progressData[mediaId] = {
              ...progressData[mediaId],
              ...vidLinkDataStore[mediaId],
              last_updated: Date.now(),
            };
          }
        }
        localStorage.setItem("mediaProgress", JSON.stringify(progressData));
      } catch (error) {
        console.error("Failed to merge VidLink progress:", error);
      }
    };
    window.addEventListener("message", handleVidLinkMessage);
    return () => window.removeEventListener("message", handleVidLinkMessage);
  }, []);
  // --- END: UNIFIED PROGRESS TRACKING LOGIC ---

  const showNotification = useCallback((message) => {
    setAlertMessage(message);
    setShowAlert(true);
    const timer = setTimeout(() => setShowAlert(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const generateIframeSrc = async () => {
      if (!selectedServer || !id) return setIframeSrc("");
      let urlToUse = selectedServer.url;
      try {
        if (selectedServer.parseUrl) {
          const response = await fetch(`${urlToUse}${id}`);
          const data = await response.json();
          urlToUse = data.url;
        } else {
          urlToUse = `${urlToUse}${id}${selectedServer.params || ""}`;
        }
        setIframeSrc(urlToUse);
      } catch (error) {
        console.error("Error generating iframe source:", error);
        setIframeSrc("");
        showNotification(
          `Failed to load ${selectedServer.name}. Please try another server.`
        );
      }
    };
    generateIframeSrc();
  }, [selectedServer, id, showNotification]);

  const handleServerChange = useCallback(
    (server) => {
      setSelectedServer(server);
      localStorage.setItem("selectedMovieServer", server.name);
      showNotification(`Switched to ${server.name}`);
      setIsPopoverOpen(false);
    },
    [showNotification]
  );

  const handleFavoriteToggle = useCallback(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const isCurrentlyFavorite = favorites.some(
      (item) => item.id === MovieDetail.id
    );
    let updatedFavorites;
    if (isCurrentlyFavorite) {
      updatedFavorites = favorites.filter((item) => item.id !== MovieDetail.id);
      showNotification("Removed from favorites");
    } else {
      updatedFavorites = [...favorites, MovieDetail];
      showNotification("Added to favorites");
    }
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    setIsFavorite(!isCurrentlyFavorite);
  }, [MovieDetail, showNotification]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showNotification("Link copied to clipboard!");
    } catch (err) {
      showNotification("Failed to copy link");
    }
  }, [showNotification]);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.some((item) => item.id === MovieDetail.id));

    const fetchData = async () => {
      try {
        const [castRes, recsRes, reviewsRes] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
          ),
          fetch(
            `https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
          ),
          fetch(
            `https://api.themoviedb.org/3/movie/${id}/reviews?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
          ),
        ]);
        const castData = await castRes.json();
        const recsData = await recsRes.json();
        const reviewsData = await reviewsRes.json();
        setCastInfo(castData.cast.slice(0, 10));
        setRecommendations(recsData.results.slice(0, 6));
        setReviews(reviewsData.results.slice(0, 5));
      } catch (error) {
        console.error("Failed to load movie supplementary content:", error);
      } finally {
        setIsLoadingCast(false);
        setIsLoadingRecommendations(false);
        setIsLoadingReviews(false);
      }
    };
    fetchData();
  }, [MovieDetail.id, id]);

  const posterPath = MovieDetail.poster_path
    ? `https://image.tmdb.org/t/p/w500${MovieDetail.poster_path}`
    : "https://via.placeholder.com/500x750.png?text=No+Poster";
  const backgroundPath = MovieDetail.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${MovieDetail.backdrop_path}`
    : posterPath;
  const formatRuntime = (minutes) => {
    if (!minutes) return "N/A";
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

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
              <div className="order-1 lg:order-1">
                <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800/50">
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <iframe
                      src={iframeSrc}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                      referrerPolicy="no-referrer"
                    />
                    {!iframeSrc && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center p-3 md:p-4 bg-slate-900/90 backdrop-blur-sm">
                    <Popover
                      open={isPopoverOpen}
                      onOpenChange={setIsPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <button className="px-3 py-2 md:px-4 text-white bg-slate-800/60 hover:bg-slate-800/90 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2 text-sm">
                          <Server className="w-4 h-4 text-indigo-400" />
                          <span className="text-slate-400 hidden sm:inline">
                            Source:
                          </span>
                          <span className="font-medium text-slate-100">
                            {selectedServer.name}
                          </span>
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="w-80 md:w-96 p-2 bg-slate-900/80 backdrop-blur-xl border-slate-700 text-white shadow-2xl"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="p-2">
                            <h4 className="font-semibold text-slate-100">
                              Select a Server
                            </h4>
                            <p className="text-xs text-slate-400">
                              If the video doesn't work, try another source.
                            </p>
                          </div>
                          <div className="max-h-[40vh] overflow-y-auto pr-1">
                            {VIDEO_SOURCES.map((server) => (
                              <button
                                key={server.name}
                                onClick={() => handleServerChange(server)}
                                className="flex justify-between items-center w-full p-3 rounded-lg text-left transition-colors hover:bg-slate-800/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                    {server.icon}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-sm font-medium text-slate-100">
                                        {server.name}
                                      </p>
                                      {server.features.map((feature) => (
                                        <FeatureBadge
                                          key={feature}
                                          feature={feature}
                                        />
                                      ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                      {server.description}
                                    </p>
                                  </div>
                                </div>
                                {selectedServer.name === server.name && (
                                  <Check className="w-5 h-5 text-indigo-400 flex-shrink-0 ml-2" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
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
                    </div>
                  </div>
                  <div className=" text-sm font-sans text-orange-300 w-full p-2 bg-slate-900/90 backdrop-blur-sm border-t border-slate-800">
                    <Info className="w-4 h-4 inline-block mr-1.5 align-middle" />
                    Not the right movie? Try another server. Content is provided
                    by external sources.
                  </div>
                </div>
                <div className="order-4 lg:order-3 space-y-4 mt-4">
                  <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-slate-800/50">
                    <div className="p-4 border-b border-slate-800/50">
                      <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        Reviews
                        {reviews.length > 0 && (
                          <span className="text-sm text-slate-400">
                            ({reviews.length})
                          </span>
                        )}
                      </h2>
                    </div>
                    <div className="p-4 max-h-[600px] overflow-y-auto">
                      {isLoadingReviews ? (
                        Array(3)
                          .fill(0)
                          .map((_, i) => (
                            <div
                              key={i}
                              className="animate-pulse bg-slate-800/50 rounded-lg p-6 mb-4"
                            >
                              <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-slate-700 rounded-full" />
                                <div className="flex-1 space-y-3">
                                  <div className="h-4 bg-slate-700 rounded w-1/4" />
                                  <div className="space-y-2">
                                    <div className="h-3 bg-slate-700 rounded w-full" />
                                    <div className="h-3 bg-slate-700 rounded w-full" />
                                    <div className="h-3 bg-slate-700 rounded w-3/4" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                      ) : reviews.length > 0 ? (
                        reviews.map((review) => (
                          <Review key={review.id} review={review} />
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No reviews yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
                          />
                        ))}
                  </div>
                </div>
              </div>

              <div className="order-2 lg:order-2 space-y-4">
                <div className="rounded-xl overflow-hidden shadow-xl border border-slate-800/50">
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
                        className={`w-full flex items-center justify-center px-4 py-2.5 rounded-lg transition-all ${
                          isFavorite
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 mr-2 transition-transform ${
                            isFavorite ? "fill-current scale-110" : "scale-100"
                          }`}
                        />
                        <span>
                          {isFavorite
                            ? "Remove from Favorites"
                            : "Add to Favorites"}
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
                        <div>
                          {castInfo
                            .slice(0, showMoreCast ? undefined : 4)
                            .map((cast) => (
                              <div
                                key={cast.id}
                                className="flex items-center space-x-3 mb-3"
                              >
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
                                  <p className="text-xs text-slate-400 truncate">
                                    {cast.character}
                                  </p>
                                </div>
                              </div>
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
                </div>
              </div>
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
                        />
                      ))}
                </div>
              </div>
            </div>
          </div>
        </div>
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
