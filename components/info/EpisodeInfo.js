import React, { useState, useEffect } from "react";
import {
  Play,
  Clock,
  CalendarDays,
  Server,
  X,
  ArrowLeft,
  ArrowRight,
  Star,
  Loader,
  User,
} from "lucide-react";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const VIDEO_SOURCES = [
  {
    name: "VidLink",
    url: `https://vidlink.pro/tv/`,
    params: "?multiLang=true",
    icon: <Server className="w-4 h-4" />,
    default: true, // Added default flag
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
  // Find the default server (VidLink)
  const defaultServer =
    VIDEO_SOURCES.find((source) => source.default) || VIDEO_SOURCES[3];

  const [iframeSrc, setIframeSrc] = useState("");
  const [selectedServer, setSelectedServer] = useState(defaultServer);
  const [selectedEpisode, setSelectedEpisode] = useState(episodeDetails);
  const [episodeExtraInfo, setEpisodeExtraInfo] = useState(null);
  const [castInfo, setCastInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const totalEpisodes = seasonData.episodes.length;
  const totalSeasons = seriesData.number_of_seasons;

  const currentEpisodeIndex = seasonData.episodes.findIndex(
    (ep) => ep.episode_number === selectedEpisode.episode_number
  );

  const handleEpisodeChange = (episode) => {
    setSelectedEpisode(episode);

    // Automatically generate iframe source when episode changes
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

    // Automatically update iframe source and play when server changes
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
      alert("Unable to fetch episode details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set initial iframe source when component mounts
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
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 pt-16 to-slate-900 min-h-screen py-12 text-white">
      <div className="container mx-auto px-4 max-w-6xl">
        {isLoading ? (
          <div className="flex justify-center items-center h-screen">
            <Loader className="w-12 h-12 animate-spin text-indigo-500" />
          </div>
        ) : (
          <>
            {/* Episode Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                {selectedEpisode.name}
              </h1>
              <div className="flex justify-center items-center space-x-4 text-slate-300">
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
                <div>
                  Season {selectedEpisode.season_number}, Episode{" "}
                  {selectedEpisode.episode_number} of {totalSeasons}
                </div>
              </div>
            </div>

            {/* Video Player Controls */}
            <div className="flex justify-center mb-8 relative">
              <div className="flex items-center space-x-4">
                {VIDEO_SOURCES.map((server) => (
                  <button
                    key={server.name}
                    onClick={() => handleServerChange(server)}
                    className={`p-2 w-[7rem] rounded-full flex gap-2 flex-roww justify-center  items-center transition-all duration-300
                      ${
                        selectedServer.name === server.name
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                  >
                    {server.icon} {server.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Player */}
            <div className="aspect-video mb-10">
              {iframeSrc ? (
                <iframe
                  src={iframeSrc}
                  title="Episode Player"
                  frameBorder="0"
                  allow="autoplay  fullscreen"
                  allowFullScreen
                  className="w-full h-full rounded-xl shadow-2xl"
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-700 text-slate-300 rounded-xl">
                  Select a server to start watching
                </div>
              )}
            </div>

            {/* Episode Navigation Buttons */}
            <div className="flex justify-center mb-8 space-x-4">
              <button
                onClick={() =>
                  handleEpisodeChange(
                    seasonData.episodes[currentEpisodeIndex - 1]
                  )
                }
                disabled={currentEpisodeIndex === 0}
                className={`p-2  rounded-full flex gap-2 flex-roww justify-center  items-center transition-all duration-300${
                  currentEpisodeIndex === 0
                    ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                <ArrowLeft className="w-5 h-5" /> Previous Episode
              </button>
              <button
                onClick={() =>
                  handleEpisodeChange(
                    seasonData.episodes[currentEpisodeIndex + 1]
                  )
                }
                disabled={currentEpisodeIndex === totalEpisodes - 1}
                className={`p-2  rounded-full flex gap-2 flex-roww justify-center  items-center transition-all duration-300 ${
                  currentEpisodeIndex === totalEpisodes - 1
                    ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                <ArrowRight className="w-5 h-5" /> Next Episode
              </button>
            </div>

            {/* Episode Details */}
            {episodeExtraInfo && (
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                {episodeExtraInfo.still_path && (
                  <div className="relative rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={`https://image.tmdb.org/t/p/original${episodeExtraInfo.still_path}`}
                      alt="Episode Still"
                      className="w-full h-full object-cover"
                    />
                    {episodeExtraInfo.vote_average && (
                      <div className="absolute top-4 right-4 bg-black/60 px-3 py-2 rounded-full flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-white">
                          {episodeExtraInfo.vote_average.toFixed(1)} / 10
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-6">
                  <div className="bg-slate-800 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold mb-4 text-indigo-400">
                      Episode Overview
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      {episodeExtraInfo.overview || "No description available."}
                    </p>
                  </div>

                  {castInfo.length > 0 && (
                    <div className="bg-slate-800 p-6 rounded-xl">
                      <h3 className="text-xl font-semibold mb-4 text-indigo-400">
                        Top Cast
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {castInfo.map((actor) => (
                          <div
                            key={actor.id}
                            className="flex items-center space-x-3"
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
                              <p className="text-sm font-medium">
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

            {/* Episode Selector */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-center">
                All Episodes in Season {selectedEpisode.season_number}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {seasonData.episodes.map((episode) => (
                  <div
                    key={episode.episode_number}
                    className={`
                      relative rounded-lg overflow-hidden cursor-pointer
                      transition-all duration-300 group
                      ${
                        selectedEpisode.episode_number ===
                        episode.episode_number
                          ? "ring-4 ring-indigo-500 scale-105 bg-indigo-800"
                          : "hover:scale-105 hover:ring-2 hover:ring-slate-600"
                      }
                    `}
                    onClick={() => handleEpisodeChange(episode)}
                  >
                    {episode.still_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                        alt={episode.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="
                          aspect-video bg-slate-700 flex items-center justify-center
                          text-slate-300 font-semibold
                        "
                      >
                        Ep {episode.episode_number}
                      </div>
                    )}
                    <div
                      className="absolute bottom-0 left-0 right-0 p-2 bg-black/60
                      transform translate-y-full group-hover:translate-y-0
                      transition-transform duration-300"
                    >
                      <p className="text-sm text-white truncate">
                        {episode.name || `Episode ${episode.episode_number}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EpisodeInfo;
