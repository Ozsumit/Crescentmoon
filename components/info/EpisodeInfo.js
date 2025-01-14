import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Clock,
  CalendarDays,
  Server,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Star,
  Loader,
  User,
  ChevronLeft,
  List,
  Grid,
  Menu,
  X,
} from "lucide-react";

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

  return (
    <div className="min-h-screen pt-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Fixed Mobile Header */}
      {/* <div
        className="fixed top-16 left-0 right-0  bg-slate-900/95 backdrop-blur-lg z-40 transition-transform duration-300"
        style={{
          transform: isMobileNavVisible ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href={`/series/${seriesId}/season/${selectedEpisode.season_number}`}
            className="flex items-center space-x-2 text-slate-300"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="text-sm text-slate-400 truncate max-w-[200px]">
            {seriesData.name}
          </div>
        </div>
      </div> */}

      <div className="container mx-auto px-4 max-w-6xl pt-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="w-8 h-8 animate-spin text-indigo-500" />
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

                {isServersMenuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 rounded-lg shadow-xl z-50">
                    {VIDEO_SOURCES.map((server) => (
                      <button
                        key={server.name}
                        onClick={() => {
                          handleServerChange(server);
                          setIsServersMenuOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center space-x-2 ${
                          selectedServer.name === server.name
                            ? "bg-indigo-600 text-white"
                            : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {server.icon}
                        <span>{server.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Player */}
              <div className="aspect-video rounded-lg overflow-hidden bg-slate-900 shadow-xl">
                {iframeSrc ? (
                      <iframe
        src={iframeSrc}
        title="Episode Player"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        frameBorder="0"
        className="w-full h-full absolute inset-0"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
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
                <div className="flex flex-wrap justify-center gap-2">
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(
                    (seasonNum) => (
                      <Link
                        key={seasonNum}
                        href={`/series/${seriesId}/season/${seasonNum}`}
                        className={`px-3 py-1.5 text-sm rounded-full transition-all duration-300 ${
                          seasonNum === selectedEpisode.season_number
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        S{seasonNum}
                      </Link>
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
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

export default EpisodeInfo;
