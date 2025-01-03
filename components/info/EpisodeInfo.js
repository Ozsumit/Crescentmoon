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
} from "lucide-react";
import MediaControls from "../ui/episodenavbar";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

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
    return localStorage.getItem("viewMode") || "grid";
  });

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
  }, []);

  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-y-auto">
      <div className="container mx-auto px-4 max-w-6xl pt-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/series/${seriesId}/season/${selectedEpisode.season_number}`}
            className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors bg-slate-800 px-4 py-2 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Season {selectedEpisode.season_number}</span>
          </Link>
          <div className="text-slate-400">
            {seriesData.name} • Season {selectedEpisode.season_number}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader className="w-12 h-12 animate-spin text-indigo-500" />
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600 mb-4">
                {selectedEpisode.name}
              </h1>
              <div className="flex justify-center items-center space-x-6 text-slate-300">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <span>
                    {selectedEpisode.runtime
                      ? `${Math.floor(selectedEpisode.runtime / 60)}h ${
                          selectedEpisode.runtime % 60
                        }m`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-5 h-5 text-pink-400" />
                  <span>
                    {selectedEpisode.air_date
                      ? new Date(selectedEpisode.air_date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span>
                    {episodeExtraInfo?.vote_average
                      ? `${episodeExtraInfo.vote_average.toFixed(1)}/10`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-6 gap-4 mb-8 shadow-xl relative">
              <div className="flex justify-center mb-6">
                <div className="flex flex-nowrap justify-start items-center space-x-3 bg-slate-900/50 p-2 rounded-full overflow-x-auto scrollbar-hide">
                  {VIDEO_SOURCES.map((server) => (
                    <button
                      key={server.name}
                      onClick={() => handleServerChange(server)}
                      className={`px-4 py-2 m-1 rounded-full flex items-center space-x-2 transition-all duration-300
      ${
        selectedServer.name === server.name
          ? "bg-indigo-600 text-white"
          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
      }`}
                    >
                      {server.icon}
                      <span>{server.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden  bg-slate-900 shadow-2xl">
                {iframeSrc ? (
                  <iframe
                    src={iframeSrc}
                    title="Episode Player"
                    frameBorder="0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    className="w-full h-full"
                    onLoad={() => setIsVideoPlaying(true)}
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <p>Select a server to start watching</p>
                  </div>
                )}{" "}
              </div>
              <div className="flex z-50 w-full justify-center items-center  max-4xl my-4  py-4">
                <div className="bg-slate-900/95 backdrop-blur-md w-full pt-4 rounded-2xl border border-slate-800/50 shadow-xl">
                  <div className="px-4 pb-4 flex items-center justify-between text-sm">
                    <button
                      onClick={() =>
                        handleEpisodeChange(
                          seasonData.episodes[currentEpisodeIndex - 1]
                        )
                      }
                      disabled={currentEpisodeIndex === 0}
                      className={`px-3 py-1.5 rounded-full flex items-center space-x-1 text-sm
                      ${
                        currentEpisodeIndex === 0
                          ? "bg-slate-800/50 text-slate-500 cursor-not-allowed"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }
                    `}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous Episode</span>
                    </button>
                    <div className=" flex flex-col items-center justify-between gap-4">
                      <div className="hidden sm:block flex-shrink-0">
                        <p className="text-sm font-medium text-white">
                          {seriesData.name}
                        </p>
                        <span className="flex flex-row gap-2 justify-center items-center text-slate-400">
                          Episode {selectedEpisode.episode_number}
                          <p className="text-sm text-slate-400">
                            S{selectedEpisode.season_number} E
                            {selectedEpisode.episode_number}
                          </p>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleEpisodeChange(
                          seasonData.episodes[currentEpisodeIndex + 1]
                        )
                      }
                      disabled={currentEpisodeIndex === totalEpisodes - 1}
                      className={`px-3 py-1.5 rounded-full flex items-center space-x-1 text-sm
                      ${
                        currentEpisodeIndex === totalEpisodes - 1
                          ? "bg-slate-800/50 text-slate-500 cursor-not-allowed"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }
                    `}
                    >
                      <span>Next Episode</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {episodeExtraInfo && (
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {episodeExtraInfo.still_path && (
                  <div className="relative rounded-xl overflow-hidden shadow-2xl group">
                    <img
                      src={`https://image.tmdb.org/t/p/original${episodeExtraInfo.still_path}`}
                      alt="Episode Still"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
                <div className="space-y-6">
                  <div className="bg-slate-800/50 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
                      Episode Overview
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      {episodeExtraInfo.overview || "No overview available."}
                    </p>
                  </div>
                  {castInfo.length > 0 && (
                    <div className="bg-slate-800/50 p-6 rounded-xl">
                      <h3 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
                        Featured Cast
                      </h3>
                      <div className="grid grid-cols-1 md:grid-col-2 gap-4">
                        {castInfo.map((actor) => (
                          <div
                            key={actor.id}
                            className="flex items-center space-x-3 bg-slate-900/50 p-2 rounded-lg"
                          >
                            {actor.profile_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w92${actor.profile_path}`}
                                alt={actor.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-slate-400" />
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
              </div>
            )}
            <div className="mb-12 ">
              <div className="flex justify-between flex-row">
                <div></div>
                <div className="flex w-min p-2 rounded-xl bg-slate-800 justify-end mb-4 space-x-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-2 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition
    ${
      viewMode === "grid"
        ? "bg-indigo-600 text-white shadow-lg"
        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:shadow-md"
    }
    focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                  >
                    <Grid className="w-6 h-6" />
                    {/* <span></span> */}
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-2 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition
    ${
      viewMode === "list"
        ? "bg-indigo-600 text-white shadow-lg"
        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:shadow-md"
    }
    focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                  >
                    <List className="w-6 h-6" />
                    {/* <span></span> */}
                  </button>
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
                All Episodes
              </h3>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
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
                <div className="space-y-4">
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
            {totalSeasons > 1 && (
              <div className="mb-12 pb-12">
                <h3 className="text-2xl  font-semibold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
                  Other Seasons
                </h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(
                    (seasonNum) => (
                      <Link
                        key={seasonNum}
                        href={`/series/${seriesId}/season/${seasonNum}`}
                        className={`
                        px-4 py-2 rounded-full transition-all duration-300
                        ${
                          seasonNum === selectedEpisode.season_number
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }
                      `}
                      >
                        Season {seasonNum}
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

  const {
    episode_number,
    name,
    overview,
    still_path,
    air_date,
    runtime,
    season_number,
  } = episodeinfo;

  if (!episode_number || !season_number) {
    console.error("Missing required episode data:", episodeinfo);
    return null;
  }

  const imageUrl = still_path
    ? `https://image.tmdb.org/t/p/w500${still_path}`
    : "/placeholder-episode.jpg";

  const episodeLink = `/series/${seriesId}/season/${season_number}/${episode_number}`;

  return (
    <Link href={episodeLink} legacyBehavior>
      <a className="block group relative bg-slate-900/50 rounded-xl overflow-hidden transition-transform hover:scale-105 hover:shadow-xl">
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
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-white group-hover:text-indigo-400 transition-colors truncate">
            {episode_number}. {name || `Episode ${episode_number}`}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
            {runtime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{runtime} min</span>
              </div>
            )}
            {air_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(air_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          {overview && (
            <p className="text-sm text-gray-400 line-clamp-2">{overview}</p>
          )}
        </div>
        <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-sm text-white">
          S{season_number} E{episode_number}
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

  const {
    episode_number,
    name,
    overview,
    still_path,
    air_date,
    runtime,
    season_number,
  } = episodeinfo;

  if (!episode_number || !season_number) {
    console.error("Missing required episode data:", episodeinfo);
    return null;
  }

  const imageUrl = still_path
    ? `https://image.tmdb.org/t/p/w500${still_path}`
    : "/placeholder-episode.jpg";

  const episodeLink = `/series/${seriesId}/season/${season_number}/${episode_number}`;

  return (
    <div className="flex gap-4 overflow-x-hidden scrollbar-hide bg-slate-900/50 rounded-xl p-4 shadow-lg">
      <div className="flex items-center bg-slate-900/50 w-full overflow-hidden rounded-xl  shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl relative min-w-[280px]">
        <Link href={episodeLink} legacyBehavior>
          <a className="flex items-center p-4 w-full">
            <div className="flex-shrink-0">
              <img
                src={imageUrl}
                alt={name || `Episode ${episode_number}`}
                className="w-24 h-24 object-cover rounded-lg"
                loading="lazy"
              />
            </div>
            <div className="ml-4 flex-grow">
              <h3 className="font-semibold text-lg mb-2 text-white hover:text-indigo-400 transition-colors truncate">
                {episode_number}. {name || `Episode ${episode_number}`}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                {runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{runtime} min</span>
                  </div>
                )}
                {/* {air_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(air_date).toLocaleDateString()}</span>
                  </div>
                )} */}
              </div>
              {overview && (
                <p className="text-xs md:text-sm text-gray-400 line-clamp-2">
                  {overview}
                </p>
              )}
            </div>
          </a>
        </Link>
        <div className="absolute top-2 right-2 bg-black/80 hidden md:block px-2 py-1 rounded text-sm text-white">
          S{season_number} E{episode_number}
        </div>
      </div>
    </div>
  );
};

export default EpisodeInfo;
