"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Star,
  Clock,
  CalendarDays,
  Server,
  Download,
  Heart,
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
  Languages,
  Zap,
  ShieldAlert,
  Clapperboard,
  Check,
  List,
  Image as ImageIcon,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HomeCards from "@/components/display/HomeCard";

// --- UNIFIED VIDEO_SOURCES FOR TV SHOWS ---
const TV_SOURCES = [
  {
    name: "VidLink",
    url: "https://vidlink.pro/tv/",
    paramStyle: "path-slash",
    icon: <Play className="w-5 h-5 text-pink-400" />,
    features: ["Recommended", "Fast"],
    description: "Fast loading with a modern player.",
  },
  {
    name: "VidSrc",
    url: "https://v2.vidsrc.me/embed/tv/",
    paramStyle: "path-hyphen",
    icon: <Languages className="w-5 h-5 text-blue-400" />,
    features: ["Multi-Language"],
    description: "Good source for non-English audio.",
  },
  {
    name: "VidSrc 2",
    url: "https://vidsrc.to/embed/tv/",
    paramStyle: "path-slash",
    icon: <Languages className="w-5 h-5 text-blue-400" />,
    features: ["Multi-Language", "Backup"],
    description: "Alternative source for subtitles.",
  },
  {
    name: "2Embed",
    url: "https://2embed.cc/embed/tv/",
    paramStyle: "path-slash",
    icon: <Film className="w-5 h-5 text-teal-400" />,
    features: ["Ads"],
    description: "May have more pop-up ads.",
  },
  {
    name: "EmbedSu",
    url: "https://embed.su/embed/tv/",
    paramStyle: "path-slash",
    icon: <Server className="w-5 h-5 text-indigo-400" />,
    features: ["Multi-Language"],
    description: "Stable embed with language options.",
  },
];

// --- SHARED HELPER COMPONENTS ---
const FeatureBadge = ({ feature }) => {
  const baseClasses = "text-xs px-1.5 py-0.5 rounded-full font-semibold";
  let colorClasses = "";
  switch (feature.toLowerCase()) {
    case "recommended":
      colorClasses = "bg-green-500/20 text-green-300";
      break;
    case "multi-language":
      colorClasses = "bg-blue-500/20 text-blue-300";
      break;
    case "fast":
      colorClasses = "bg-yellow-500/20 text-yellow-300";
      break;
    case "ads":
      colorClasses = "bg-orange-500/20 text-orange-300";
      break;
    default:
      colorClasses = "bg-slate-700/50 text-slate-300";
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{feature}</span>;
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
      <p className="text-sm font-medium text-slate-200 truncate">{cast.name}</p>
      <p className="text-xs text-slate-400 truncate">{cast.character}</p>
    </div>
  </div>
);

const EpisodeInfo = ({ episodeDetails, seriesId, seasonData, seriesData }) => {
  const getInitialServer = () => {
    if (typeof window !== "undefined") {
      const storedServerName = localStorage.getItem("selectedTvServer");
      const foundServer = TV_SOURCES.find(
        (server) => server.name === storedServerName
      );
      if (foundServer) return foundServer;
    }
    return (
      TV_SOURCES.find((s) => s.features.includes("Recommended")) ||
      TV_SOURCES[0]
    );
  };
  window.addEventListener("message", (event) => {
    if (event.origin !== "https://vidlink.pro") return;

    if (event.data?.type === "MEDIA_DATA") {
      const mediaData = event.data.data;
      localStorage.setItem("vidLinkProgress", JSON.stringify(mediaData));
    }
  });

  const [selectedServer, setSelectedServer] = useState(getInitialServer);
  const [selectedSeason, setSelectedSeason] = useState(seasonData);
  const [selectedEpisode, setSelectedEpisode] = useState(episodeDetails);
  const [iframeSrc, setIframeSrc] = useState("");
  const [castInfo, setCastInfo] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingCast, setIsLoadingCast] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showMoreCast, setShowMoreCast] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const posterPath = seriesData.poster_path
    ? `https://image.tmdb.org/t/p/w500${seriesData.poster_path}`
    : "https://via.placeholder.com/500x750.png?text=Series+Poster";
  const backgroundPath = seriesData.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${seriesData.backdrop_path}`
    : posterPath;

  const showNotification = useCallback((message) => {
    setAlertMessage(message);
    setShowAlert(true);
    const timer = setTimeout(() => setShowAlert(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const generateIframeSrc = () => {
      if (!selectedServer || !seriesId || !selectedEpisode) {
        setIframeSrc("");
        return;
      }
      const { url, paramStyle } = selectedServer;
      const { season_number, episode_number } = selectedEpisode;
      let finalUrl = "";
      switch (paramStyle) {
        case "query":
          finalUrl = `${url}${seriesId}?s=${season_number}&e=${episode_number}`;
          break;
        case "path-hyphen":
          finalUrl = `${url}${seriesId}/${season_number}-${episode_number}`;
          break;
        case "path-slash":
        default:
          finalUrl = `${url}${seriesId}/${season_number}/${episode_number}`;
          break;
      }
      setIframeSrc(finalUrl);
    };
    generateIframeSrc();
  }, [selectedServer, seriesId, selectedEpisode]);

  const handleServerChange = useCallback(
    (server) => {
      setSelectedServer(server);
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedTvServer", server.name);
      }
      showNotification(`Switched to ${server.name} server`);
      setIsPopoverOpen(false);
    },
    [showNotification]
  );

  const handleFavoriteToggle = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (isFavorite) {
      const updatedFavorites = favorites.filter(
        (item) => item.id !== seriesData.id
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      showNotification("Removed from favorites");
    } else {
      if (!favorites.some((item) => item.id === seriesData.id)) {
        favorites.push(seriesData);
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(favorites.some((item) => item.id === seriesData.id));
    }

    const fetchEpisodeData = async () => {
      if (!selectedEpisode) return;
      setIsLoadingCast(true);
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${seriesId}/season/${selectedEpisode.season_number}/episode/${selectedEpisode.episode_number}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
        );
        const data = await response.json();
        setCastInfo(data.cast);
      } catch (error) {
        console.error("Failed to load episode cast:", error);
      } finally {
        setIsLoadingCast(false);
      }
    };

    const fetchRecommendations = async () => {
      setIsLoadingRecommendations(true);
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${seriesId}/recommendations?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
        );
        const data = await response.json();
        setRecommendations(data.results.slice(0, 6));
      } catch (error) {
        console.error("Failed to load recommendations:", error);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchEpisodeData();
    fetchRecommendations();
  }, [seriesId, selectedEpisode, seriesData.id]);

  const handleSeasonChange = async (seasonNumber) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
      );
      const data = await response.json();
      setSelectedSeason(data);
      if (data.episodes && data.episodes.length > 0) {
        setSelectedEpisode(data.episodes[0]);
      }
    } catch (error) {
      console.error(`Failed to load season ${seasonNumber}:`, error);
      showNotification(`Failed to load Season ${seasonNumber}`);
    }
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
              {/* Left Column */}
              <div className="order-1 lg:order-1 space-y-4">
                {/* Video Player */}
                <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800/50">
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    {iframeSrc ? (
                      <iframe
                        key={iframeSrc}
                        src={iframeSrc}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
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
                            {TV_SOURCES.map((server) => (
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
                          <p>Share series</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="text-sm font-sans text-orange-300 w-full p-2 bg-slate-900/90 backdrop-blur-sm border-t border-slate-800">
                    <Info className="w-4 h-4 inline-block mr-1.5 align-middle" />
                    Content is provided by external sources. Try another server
                    if it's not working.
                  </div>
                </div>

                {/* Episode Details */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-slate-800/50 space-y-4">
                  <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                    <Film className="w-5 h-5 text-indigo-400" />
                    Currently Playing
                  </h2>
                  <div>
                    <h3 className="text-lg font-bold text-slate-200">
                      S{selectedEpisode.season_number} E
                      {selectedEpisode.episode_number}: {selectedEpisode.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Star className="text-yellow-400 w-4 h-4" />
                        <span>
                          {selectedEpisode.vote_average?.toFixed(1) || "N/A"}
                          /10
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarDays className="text-pink-400 w-4 h-4" />
                        <span>{selectedEpisode.air_date || "No air date"}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {selectedEpisode.overview ||
                      "No overview available for this episode."}
                  </p>
                </div>

                {/* Similar Shows Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                    <Film className="w-5 h-5 text-indigo-400" />
                    Similar Shows
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {isLoadingRecommendations
                      ? Array(6)
                          .fill(0)
                          .map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="aspect-[2/3] bg-slate-800 rounded-lg" />
                              <div className="h-4 bg-slate-800 rounded mt-2" />
                            </div>
                          ))
                      : recommendations.map((show) => (
                          <HomeCards
                            key={show.id}
                            MovieCard={show}
                            media_type="tv"
                            className="aspect-[2/3]"
                          />
                        ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="order-2 lg:order-2 space-y-4">
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-slate-800/50 space-y-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">
                      {seriesData.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Star className="text-yellow-400 w-4 h-4" />
                        <span>
                          {seriesData.vote_average?.toFixed(1) || "N/A"}/10
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarDays className="text-pink-400 w-4 h-4" />
                        <span>
                          {seriesData.first_air_date
                            ? new Date(seriesData.first_air_date).getFullYear()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {seriesData.genres?.map((genre) => (
                      <span
                        key={genre.id}
                        className="bg-indigo-900/40 text-indigo-200 px-2.5 py-1 rounded-full text-xs"
                      >
                        {genre.name}
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
                        <span className="text-sm font-medium">
                          {isFavorite
                            ? "Remove from Favorites"
                            : "Add to Favorites"}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isFavorite
                          ? "Remove series from favorites"
                          : "Add series to favorites"}
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    {seriesData.overview}
                  </p>
                </div>

                {/* Season and Episode Selector */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-slate-800/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                      <List className="w-5 h-5 text-indigo-400" />
                      Episodes
                    </h2>
                    <Select
                      value={selectedSeason.season_number.toString()}
                      onValueChange={(value) => handleSeasonChange(value)}
                    >
                      <SelectTrigger className="w-[150px] bg-slate-800 border-slate-700 focus:ring-indigo-500">
                        <SelectValue placeholder="Select Season" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900/80 backdrop-blur-xl border-slate-700 text-white">
                        {seriesData.seasons
                          .filter((s) => s.episode_count > 0)
                          .map((season) => (
                            <SelectItem
                              key={season.id}
                              value={season.season_number.toString()}
                            >
                              {season.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* --- START: CLEANED EPISODE LIST --- */}
                  <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2">
                    {selectedSeason.episodes.map((ep) => (
                      <button
                        key={ep.id}
                        onClick={() => setSelectedEpisode(ep)}
                        className={`w-full text-left p-2.5 rounded-lg transition-all duration-200 flex gap-4 items-center ${
                          selectedEpisode.id === ep.id
                            ? "bg-indigo-600/30 ring-2 ring-indigo-500"
                            : "bg-slate-800/50 hover:bg-slate-800/90"
                        }`}
                      >
                        <div className="relative flex-shrink-0 w-32 aspect-video bg-slate-700 rounded-md overflow-hidden">
                          {ep.still_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                              alt={ep.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon
                                className="w-8 h-8 text-slate-500"
                                strokeWidth={1.5}
                              />
                            </div>
                          )}
                          <div className="absolute inset-0 ring-1 ring-inset ring-black/10"></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-200 truncate">
                            {ep.episode_number}. {ep.name}
                          </p>
                          {ep.runtime && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span>{ep.runtime} min</span>
                            </div>
                          )}
                        </div>

                        {selectedEpisode.id === ep.id && (
                          <div className="ml-auto pl-2">
                            <Play className="w-5 h-5 text-indigo-400" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {/* --- END: CLEANED EPISODE LIST --- */}
                </div>

                {/* Cast Section */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-slate-800/50 space-y-3">
                  <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Episode Cast
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
                    ) : castInfo.length > 0 ? (
                      <>
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
                      </>
                    ) : (
                      <p className="text-sm text-slate-400">
                        No cast information available for this episode.
                      </p>
                    )}
                  </div>
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

export default EpisodeInfo;
