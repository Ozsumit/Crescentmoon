"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  Clock,
  CalendarDays,
  Server,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Star,
  Loader2,
  User,
  ChevronLeft,
  List,
  Grid,
  Menu,
  X,
  ChevronUp,
  ChevronDown,
  Info,
  Share2,
  Heart,
  Film,
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
    url: `https://vidlink.pro/tv/`,
    params: "?multiLang=true",
    icon: <Server className="w-4 h-4" />,
    default: true,
  },
  {
    name: "2Embed",
    url: `https://2embed.cc/embed/tv/`,
    icon: <Server className="w-4 h-4" />,
  },
  {
    name: "Binge",
    url: `https://vidbinge.dev/embed/tv/`,
    icon: <Server className="w-4 h-4" />,
  },
  {
    name: "VidSrc",
    url: `https://vidsrc.net/embed/tv/`,
    icon: <Server className="w-4 h-4" />,
  },
  {
    name: "EmbedSu",
    url: `https://embed.su/embed/tv/`,
    params: "?multiLang=true",
    icon: <Server className="w-4 h-4" />,
  },
];

const EpisodeInfo = ({
  episodeDetails,
  seriesId,
  seasonData,
  seriesData,
  onEpisodeChange,
}) => {
  const defaultServer =
    VIDEO_SOURCES.find((source) => source.default) || VIDEO_SOURCES[0];

  const [iframeSrc, setIframeSrc] = useState("");
  const [selectedServer, setSelectedServer] = useState(defaultServer);
  const [selectedEpisode, setSelectedEpisode] = useState(episodeDetails);
  const [episodeExtraInfo, setEpisodeExtraInfo] = useState(null);
  const [castInfo, setCastInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("viewMode") || "list";
  });
  const [isServersMenuOpen, setIsServersMenuOpen] = useState(false);
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);

  const totalEpisodes = seasonData.episodes.length;
  const totalSeasons = seriesData.number_of_seasons;

  const currentEpisodeIndex = seasonData.episodes.findIndex(
    (ep) => ep.episode_number === selectedEpisode.episode_number
  );

  const handleEpisodeChange = (episode) => {
    setIsVideoPlaying(false);
    setSelectedEpisode(episode);
    const serverUrl = selectedServer.url;
    const serverParams = selectedServer.params || "";
    setIframeSrc(
      `${serverUrl}${seriesId}/${episode.season_number}/${episode.episode_number}${serverParams}`
    );
    fetchEpisodeInfo(episode.season_number, episode.episode_number);
    if (onEpisodeChange) {
      onEpisodeChange(episode);
    }
  };

  const handleServerChange = (server) => {
    setSelectedServer(server);
    const serverUrl = server.url;
    const serverParams = server.params || "";
    setIframeSrc(
      `${serverUrl}${seriesId}/${selectedEpisode.season_number}/${selectedEpisode.episode_number}${serverParams}`
    );
  };

  const fetchEpisodeInfo = async (seasonNumber, episodeNumber) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${TMDB_API_KEY}&append_to_response=credits`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch episode details");
      }

      const data = await response.json();
      setEpisodeExtraInfo(data);
      if (data.credits) {
        setCastInfo(data.credits.cast.slice(0, 10));
      }
    } catch (error) {
      console.error("Error fetching episode info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  useEffect(() => {
    const serverUrl = defaultServer.url;
    const serverParams = defaultServer.params || "";
    setIframeSrc(
      `${serverUrl}${seriesId}/${selectedEpisode.season_number}/${selectedEpisode.episode_number}${serverParams}`
    );
    fetchEpisodeInfo(
      selectedEpisode.season_number,
      selectedEpisode.episode_number
    );

    let lastScrollTop = 0;
    const handleScroll = () => {
      const currentScrollTop = window.pageYOffset;
      setIsMobileNavVisible(currentScrollTop <= lastScrollTop);
      lastScrollTop = currentScrollTop;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoadingRecommendations(true);
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${seriesId}/recommendations?api_key=${TMDB_API_KEY}`
        );
        const data = await response.json();
        setRecommendations(data.results.slice(0, 6));
      } catch (error) {
        showNotification("Failed to load recommendations");
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [seriesId]);

  return (
    <TooltipProvider>
      <div className="min-h-screen pt-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 max-w-6xl pt-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : (
            <>
              {/* Episode Title Section */}
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600 mb-3 px-2">
                  {selectedEpisode.name}
                </h1>
                <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>
                      {selectedEpisode.runtime
                        ? `${Math.floor(selectedEpisode.runtime / 60)}h ${
                            selectedEpisode.runtime % 60
                          }m`
                        : "N/A"}
                    </span>
                  </div>
                  {episodeExtraInfo?.vote_average && (
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{episodeExtraInfo.vote_average.toFixed(1)}/10</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Player Section */}
              <div className="bg-slate-800/50 rounded-xl p-4 mb-6 shadow-xl">
                {/* Mobile Server Selection */}
                <div className="relative mb-4">
                  <Sheet>
                    <SheetTrigger asChild>
                      <button
                        onClick={() => setIsServersMenuOpen(!isServersMenuOpen)}
                        className="w-full flex items-center justify-between bg-slate-900/50 p-3 rounded-lg text-slate-300"
                      >
                        <div className="flex items-center space-x-2">
                          <Server className="w-4 h-4" />
                          <span>{selectedServer.name}</span>
                        </div>
                        {isServersMenuOpen ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <Menu className="w-4 h-4" />
                        )}
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
                                onClick={() => {
                                  handleServerChange(server);
                                  setIsServersMenuOpen(false);
                                }}
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
                          </Tooltip>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Video Player */}
                <div className="aspect-video rounded-lg overflow-hidden bg-slate-900 shadow-xl">
                  {iframeSrc ? (
                    <iframe
                      src={iframeSrc}
                      title="Episode Player"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      webkitallowfullscreen="true"
                      mozallowfullscreen="true"
                      className="w-full h-full"
                      onLoad={() => setIsVideoPlaying(true)}
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <p>Select a server to start watching</p>
                    </div>
                  )}
                </div>

                {/* Mobile Episode Navigation */}
                <div className="flex justify-between items-center mt-4 px-2 py-2 bg-slate-900/50 rounded-lg">
                  <button
                    onClick={() =>
                      handleEpisodeChange(
                        seasonData.episodes[currentEpisodeIndex - 1]
                      )
                    }
                    disabled={currentEpisodeIndex === 0}
                    className={`p-2 rounded-full ${
                      currentEpisodeIndex === 0
                        ? "text-slate-500 cursor-not-allowed"
                        : "text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white">
                      Episode {selectedEpisode.episode_number}
                    </p>
                    <p className="text-xs text-slate-400">
                      S{selectedEpisode.season_number} E
                      {selectedEpisode.episode_number}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleEpisodeChange(
                        seasonData.episodes[currentEpisodeIndex + 1]
                      )
                    }
                    disabled={currentEpisodeIndex === totalEpisodes - 1}
                    className={`p-2 rounded-full ${
                      currentEpisodeIndex === totalEpisodes - 1
                        ? "text-slate-500 cursor-not-allowed"
                        : "text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Overview and Cast Section */}
              {episodeExtraInfo && (
                <div className="space-y-4 mb-8">
                  <div className="bg-slate-800/50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
                      Overview
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {episodeExtraInfo.overview || "No overview available."}
                    </p>
                  </div>

                  {castInfo.length > 0 && (
                    <div className="bg-slate-800/50 p-4 rounded-xl">
                      <h3 className="text-lg font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
                        Cast
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {castInfo.slice(0, 6).map((actor) => (
                          <div
                            key={actor.id}
                            className="flex items-center space-x-3 bg-slate-900/50 p-2 rounded-lg"
                          >
                            {actor.profile_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w92${actor.profile_path}`}
                                alt={actor.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-white">
                                {actor.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {actor.character}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Episodes List */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
                    All Episodes
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg ${
                        viewMode === "grid"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg ${
                        viewMode === "list"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {seasonData.episodes.map((episode) => (
                      <EpisodeCard
                        key={episode.episode_number}
                        episodeinfo={episode}
                        seriesId={seriesId}
                        selectedEpisode={selectedEpisode}
                        handleEpisodeChange={handleEpisodeChange}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {seasonData.episodes.map((episode) => (
                      <EpisodeListItem
                        key={episode.episode_number}
                        episodeinfo={episode}
                        seriesId={seriesId}
                        selectedEpisode={selectedEpisode}
                        handleEpisodeChange={handleEpisodeChange}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Season Navigation */}
              {totalSeasons > 1 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
                    Seasons
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(
                      (seasonNum) => (
                        <SeasonCard
                          key={seasonNum}
                          seasonNum={seasonNum}
                          seriesId={seriesId}
                          seriesData={seriesData}
                          selectedSeason={selectedEpisode.season_number}
                        />
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Related and Recommended Sections */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
                  Related
                </h3>
                {/* Add related content here */}
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
                  Recommended
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
            </>
          )}
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

const EpisodeCard = ({
  episodeinfo,
  seriesId,
  selectedEpisode,
  handleEpisodeChange,
}) => {
  if (!episodeinfo || !seriesId) return null;

  const { episode_number, name, overview, still_path, runtime, season_number } =
    episodeinfo;

  const imageUrl = still_path
    ? `https://image.tmdb.org/t/p/w500${still_path}`
    : "/placeholder-episode.jpg";

  const episodeLink = `/series/${seriesId}/season/${season_number}/${episode_number}`;

  return (
    <Link href={episodeLink} legacyBehavior>
      <a className="block group relative bg-slate-900/50 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
        <div className="relative aspect-video">
          <img
            src={imageUrl}
            alt={name || `Episode ${episode_number}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-12 h-12 text-white" />
          </div>
          <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
            S{season_number} E{episode_number}
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm text-white group-hover:text-indigo-400 transition-colors truncate">
            {episode_number}. {name || `Episode ${episode_number}`}
          </h3>
          {runtime && (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{runtime} min</span>
            </div>
          )}
          {overview && (
            <p className="text-xs text-gray-400 mt-2 line-clamp-2">
              {overview}
            </p>
          )}
        </div>
      </a>
    </Link>
  );
};

const EpisodeListItem = ({
  episodeinfo,
  seriesId,
  selectedEpisode,
  handleEpisodeChange,
}) => {
  if (!episodeinfo || !seriesId) return null;

  const { episode_number, name, overview, still_path, runtime, season_number } =
    episodeinfo;

  const imageUrl = still_path
    ? `https://image.tmdb.org/t/p/w500${still_path}`
    : "/placeholder-episode.jpg";

  const episodeLink = `/series/${seriesId}/season/${season_number}/${episode_number}`;

  return (
    <div className="bg-slate-900/50 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <Link href={episodeLink} legacyBehavior>
        <a className="flex flex-row items-center gap-4 p-3 w-full transition-colors hover:bg-slate-800/50">
          <div className="relative w-32 aspect-square flex-shrink-0">
            <img
              src={imageUrl}
              alt={name || `Episode ${episode_number}`}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
            <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
              S{season_number} E{episode_number}
            </div>
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="font-semibold text-white hover:text-indigo-400 transition-colors truncate">
              {episode_number}. {name || `Episode ${episode_number}`}
            </h3>
            {runtime && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{runtime} min</span>
              </div>
            )}
            {overview && (
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                {overview}
              </p>
            )}
          </div>
        </a>
      </Link>
    </div>
  );
};

const SeasonCard = ({ seasonNum, seriesId, seriesData, selectedSeason }) => {
  const seasonLink = `/series/${seriesId}/season/${seasonNum}`;

  // Fallback for missing poster
  const posterPath = seriesData.seasons.find(
    (season) => season.season_number === seasonNum
  )?.poster_path
    ? `https://image.tmdb.org/t/p/w500/${
        seriesData.seasons.find((season) => season.season_number === seasonNum)
          .poster_path
      }`
    : "https://i.imgur.com/a5SqB4h.jpeg";

  const airYear = seriesData.seasons.find(
    (season) => season.season_number === seasonNum
  )?.air_date
    ? seriesData.seasons
        .find((season) => season.season_number === seasonNum)
        .air_date.substr(0, 4)
    : "N/A";

  return (
    <Link href={seasonLink} className="block">
      <div className="group relative bg-slate-800/40 rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-slate-700/50">
        <div className="relative aspect-[4/3]">
          <Image
            src={posterPath}
            alt={`Season ${seasonNum}`}
            width={400}
            height={300}
            className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all"
            priority
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 border border-white/30">
              <Play className="w-7 h-7 text-white" fill="white" />
            </div>
          </div>

          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur px-2.5 py-1 rounded-lg border border-white/10">
            <span className="text-sm font-medium text-white tracking-wide">
              S{seasonNum}
            </span>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-b from-slate-800/0 to-slate-800/50">
          <h3 className="font-semibold text-lg text-white/90 group-hover:text-white transition-colors mb-3">
            Season {seasonNum}
          </h3>

          <div className="grid grid-cols-3 gap-3 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-indigo-500/10">
                <Calendar className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-slate-300">{airYear}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-pink-500/10">
                <Film className="w-4 h-4 text-pink-400" />
              </div>
              <span className="text-slate-300">
                {
                  seriesData.seasons.find(
                    (season) => season.season_number === seasonNum
                  ).episode_count
                }{" "}
                Eps
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-yellow-500/10">
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
              <span className="text-slate-300">
                {seriesData.seasons
                  .find((season) => season.season_number === seasonNum)
                  .vote_average?.toFixed(1) || "N/A"}
                /10
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EpisodeInfo;
