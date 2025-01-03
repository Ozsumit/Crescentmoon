"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  Star,
  PlayCircle,
  AlertCircle,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Info,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// API configuration
const API_CONFIG = {
  JIKAN_BASE_URL: "https://api.jikan.moe/v4",
  // Using Gogoanime API endpoint
  VIDEO_API: "https://anime-api.xyz/gogoanime",
  // Backup APIs
  BACKUP_APIS: ["https://api.animex.live", "https://api.animeplus.dev"],
  POSTER_API: "https://image.tmdb.org/t/p/w300", // For episode thumbnails
};

// Custom video player component with controls
const CustomVideoPlayer = ({ src, poster, onError, onNext }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        setVolume(0);
      } else {
        setVolume(1);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative group">
      <video
        ref={videoRef}
        className="w-full aspect-video rounded-lg"
        src={src}
        poster={poster}
        onError={onError}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress bar */}
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          className="mb-4"
          onValueChange={(value) => {
            videoRef.current.currentTime = value[0];
          }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-indigo-400"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-indigo-400"
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </button>
              <Slider
                value={[volume]}
                max={1}
                step={0.1}
                className="w-24"
                onValueChange={handleVolumeChange}
              />
            </div>

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onNext}
              className="text-white hover:text-indigo-400"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-indigo-400"
            >
              <Maximize className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Episode Card Component with enhanced UI
const EpisodeCard = ({ episode, onPlay, viewMode, anime, isPlaying }) => {
  const episodePoster = episode.still_path
    ? `${API_CONFIG.POSTER_API}${episode.still_path}`
    : anime?.images?.jpg?.large_image_url;

  if (viewMode === "grid") {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-colors group">
        <CardContent className="p-0">
          <div className="relative aspect-video">
            <img
              src={episodePoster}
              alt={`Episode ${episode.mal_id}`}
              className="w-full h-full object-cover rounded-t-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => onPlay(episode)}
                className="bg-indigo-600 p-3 rounded-full transform scale-90 group-hover:scale-100 transition-transform"
              >
                <PlayCircle className="w-8 h-8 text-white" />
              </button>
            </div>
            {isPlaying && (
              <div className="absolute top-2 right-2 bg-indigo-600 px-2 py-1 rounded text-xs text-white">
                Now Playing
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-medium text-white">
              Episode {episode.mal_id}
            </h3>
            <p className="text-slate-400 text-sm mt-1 line-clamp-2">
              {episode.title}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-colors group ${
        isPlaying ? "border-l-4 border-l-indigo-600" : ""
      }`}
    >
      <CardContent className="p-4 flex gap-4">
        <div className="flex-shrink-0 w-48 relative aspect-video">
          <img
            src={episodePoster}
            alt={`Episode ${episode.mal_id}`}
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            onClick={() => onPlay(episode)}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <PlayCircle className="w-12 h-12 text-white" />
          </button>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                Episode {episode.mal_id}
                {isPlaying && (
                  <span className="bg-indigo-600 px-2 py-1 rounded text-xs">
                    Now Playing
                  </span>
                )}
              </h3>
              <p className="text-xl font-semibold text-white mt-1">
                {episode.title}
              </p>
            </div>
            <span className="text-slate-400 text-sm">
              {utils.formatDate(episode.aired)}
            </span>
          </div>
          <p className="text-slate-400 mt-2 line-clamp-2">
            {episode.synopsis || "No synopsis available"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Utility functions
const utils = {
  normalizeTitle: (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  formatDate: (dateString) => {
    if (!dateString) return "Release date unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  getColorByScore: (score) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-red-500";
  },

  // Function to fetch video sources from multiple providers
  async getVideoSources(title, episode) {
    const providers = [API_CONFIG.VIDEO_API, ...API_CONFIG.BACKUP_APIS];

    for (const provider of providers) {
      try {
        const response = await axios.get(
          `${provider}/anime/${utils.normalizeTitle(title)}/episode/${episode}`
        );

        if (response.data.sources?.length > 0) {
          return response.data.sources.sort((a, b) => b.quality - a.quality);
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${provider}:`, error);
        continue;
      }
    }

    throw new Error("No video sources found from any provider");
  },
};

// Main Page Component
const AnimeSeasonPage = ({ params }) => {
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [videoSrc, setVideoSrc] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [videoQuality, setVideoQuality] = useState("auto");
  const episodesPerPage = viewMode === "grid" ? 12 : 8;

  const router = useRouter();

  // Fetch anime data with enhanced error handling
  useEffect(() => {
    const fetchAnimeData = async () => {
      if (!params?.id) {
        setError("No anime ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const [animeRes, episodesRes] = await Promise.all([
          axios.get(`${API_CONFIG.JIKAN_BASE_URL}/anime/${params.id}`),
          axios.get(`${API_CONFIG.JIKAN_BASE_URL}/anime/${params.id}/episodes`),
        ]);

        // Enhance episodes with more metadata
        const enhancedEpisodes = episodesRes.data.data.map((episode) => ({
          ...episode,
          still_path: `/episodes/${params.id}/${episode.mal_id}.jpg`,
          synopsis: `Episode ${episode.mal_id} of ${animeRes.data.data.title}`,
        }));

        setAnime(animeRes.data.data);
        setEpisodes(enhancedEpisodes);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimeData();
  }, [params?.id]);

  // Handle video errors with retry mechanism
  const handleVideoError = async (error) => {
    console.error("Video error:", error);

    try {
      // Attempt to fetch from backup sources
      const sources = await utils.getVideoSources(
        anime.title,
        selectedEpisode.mal_id
      );
      if (sources.length > 0) {
        setVideoSrc(sources[0].url);
        return;
      }
    } catch (retryError) {
      setError("Failed to load video. Please try again later.");
      setIsLoadingVideo(false);
    }
  };

  // Handle episode selection with enhanced video source handling
  const handleEpisodeClick = async (episode) => {
    setSelectedEpisode(episode);
    setIsLoadingVideo(true);
    setError(null);

    try {
      const sources = await utils.getVideoSources(anime.title, episode.mal_id);

      if (sources.length > 0) {
        setVideoSrc(sources[0].url);
        // Scroll to player
        document
          .getElementById("video-player")
          ?.scrollIntoView({ behavior: "smooth" });
      } else {
        throw new Error("No video sources found");
      }
    } catch (error) {
      handleVideoError(error);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  // Handle next episode
  const handleNextEpisode = () => {
    const currentIndex = episodes.findIndex(
      (ep) => ep.mal_id === selectedEpisode.mal_id
    );
    if (currentIndex < episodes.length - 1) {
      handleEpisodeClick(episodes[currentIndex + 1]);
    }
  };

  // Calculate pagination
  const paginatedEpisodes = episodes.slice(
    (currentPage - 1) * episodesPerPage,
    currentPage * episodesPerPage
  );
  // ... (previous code remains the same)
  // Calculate pagination
  // const episodesPerPage = viewMode === "grid" ? 12 : 8;

  // Calculate start and end indices for current page

  // Calculate total number of pages
  const totalPages = Math.ceil(episodes.length / episodesPerPage);

  // Optional: Add safety checks
  useEffect(() => {
    // If current page is beyond total pages, reset to last available page
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, viewMode]);

  // Optional: Add page size handler for view mode changes
  useEffect(() => {
    // Reset to first page when changing view mode to prevent empty pages
    setCurrentPage(1);
  }, [viewMode]);
  // Loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto" />
          <p className="mt-4 text-slate-400 text-lg">
            Loading anime details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-red-500 max-w-md mx-auto p-6 bg-slate-800 rounded-lg">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Content</h2>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Enhanced Hero Section */}
      <div className="relative h-[60vh]">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm"
          style={{
            backgroundImage: `url(${anime?.images?.jpg?.large_image_url})`,
            opacity: 0.3,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="relative group">
                <img
                  src={anime?.images?.jpg?.large_image_url}
                  alt={anime?.title}
                  className="w-48 h-72 rounded-lg shadow-2xl group-hover:shadow-indigo-500/25 transition-shadow"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Info className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex flex-col justify-center gap-6 max-w-2xl">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {anime?.title}
                  </h1>
                  <h2 className="text-xl text-slate-400">
                    {anime?.title_japanese}
                  </h2>
                </div>
                <p className="text-slate-300 text-lg leading-relaxed line-clamp-3">
                  {anime?.synopsis}
                </p>
                <div className="flex flex-wrap gap-4 text-slate-300">
                  <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4" />
                    {anime?.aired?.string}
                  </span>
                  <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className={utils.getColorByScore(anime?.score)}>
                      {anime?.score}
                    </span>
                  </span>
                  {anime?.genres?.map((genre) => (
                    <span
                      key={genre.mal_id}
                      className="bg-slate-800/50 px-3 py-1 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Section */}
      {selectedEpisode && (
        <div id="video-player" className="container mx-auto px-4 py-8">
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-white">
                  Episode {selectedEpisode.mal_id}: {selectedEpisode.title}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {utils.formatDate(selectedEpisode.aired)}
                </p>
              </div>
              <Select value={videoQuality} onValueChange={setVideoQuality}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="480p">480p</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isLoadingVideo ? (
              <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto" />
                  <p className="mt-4 text-slate-400">Loading video...</p>
                </div>
              </div>
            ) : videoSrc ? (
              <CustomVideoPlayer
                src={videoSrc}
                poster={selectedEpisode.still_path}
                onError={handleVideoError}
                onNext={handleNextEpisode}
              />
            ) : (
              <div className="flex items-center justify-center h-[60vh] text-slate-400">
                <AlertCircle className="w-6 h-6 mr-2" />
                Unable to load video. Please try again.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Episodes Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Episodes</h2>
            <p className="text-slate-400 mt-1">
              {episodes.length} episodes available
            </p>
          </div>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && setViewMode(value)}
            className="bg-slate-800 p-1 rounded-lg"
          >
            <ToggleGroupItem
              value="list"
              aria-label="List view"
              className="data-[state=on]:bg-indigo-600 data-[state=on]:text-white"
            >
              <List className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="grid"
              aria-label="Grid view"
              className="data-[state=on]:bg-indigo-600 data-[state=on]:text-white"
            >
              <Grid className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "grid gap-6"
          }
        >
          {paginatedEpisodes.map((episode) => (
            <EpisodeCard
              key={episode.mal_id}
              episode={episode}
              onPlay={handleEpisodeClick}
              viewMode={viewMode}
              anime={anime}
              isPlaying={selectedEpisode?.mal_id === episode.mal_id}
            />
          ))}
        </div>

        {/* Enhanced Pagination */}
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNumber = currentPage - 2 + i;
            if (pageNumber > 0 && pageNumber <= totalPages) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-4 py-2 rounded ${
                    currentPage === pageNumber
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            }
            return null;
          })}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimeSeasonPage;
