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
} from "lucide-react";
// import { Play, Clock, Calendar } from "lucide-react";

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

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 max-w-6xl pt-8">
        {/* Navigation Bar */}
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
            {/* Episode Header */}
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

            {/* Video Player Section */}
            <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 shadow-xl relative">
              {/* Server Selection */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-3 bg-slate-900/50 p-2 rounded-full">
                  {VIDEO_SOURCES.map((server) => (
                    <button
                      key={server.name}
                      onClick={() => handleServerChange(server)}
                      className={`px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-300
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

              {/* Video Player */}
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

              {/* Episode Navigation */}
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t z-[100] border-slate-800 py-4 px-6">
              <div className="container mx-auto max-w-6xl flex items-center justify-between">
                <div className="flex items-center space-x-4">
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
                    <span>Previous</span>
                  </button>
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
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-slate-400 text-sm">
                  Episode {selectedEpisode.episode_number} of {totalEpisodes}
                </div>
              </div>
            </div>
            {/* Episode Details */}
            {episodeExtraInfo && (
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Episode Still */}
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

                {/* Episode Info */}
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
                      <div className="grid grid-cols-2 gap-4">
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

            {/* Episode Grid */}
            <div className="mb-12">
              <h3 className="text-2xl font-semibold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
                All Episodes
              </h3>
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
            </div>

            {/* Season Navigation */}
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
  // Data validation
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

  // Ensure we have the minimum required data
  if (!episode_number || !season_number) {
    console.error("Missing required episode data:", episodeinfo);
    return null;
  }

  const imageUrl = still_path
    ? `https://image.tmdb.org/t/p/w500${still_path}`
    : "/placeholder-episode.jpg"; // Make sure to add a placeholder image

  // Construct the proper link
  const episodeLink = `/series/${seriesId}/season/${season_number}/${episode_number}`;

  return (
    <Link href={episodeLink} legacyBehavior>
      <a className="block group relative bg-slate-900/50 rounded-xl overflow-hidden transition-transform hover:scale-105 hover:shadow-xl">
        {/* Episode Image */}
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

        {/* Episode Info */}
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

        {/* Season & Episode Indicator */}
        <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-sm text-white">
          S{season_number} E{episode_number}
        </div>
      </a>
    </Link>
  );
};

export default EpisodeInfo;