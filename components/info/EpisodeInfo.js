"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Star,
  Clock,
  Calendar,
  Server,
  Heart,
  Share2,
  Film,
  Languages,
  Check,
  Crown,
  Webhook,
  Clapperboard,
  ShieldAlert,
  List,
  X,
  Info,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- CONSTANTS ---
const TV_SOURCES = [
  {
    name: "vidking",
    url: "https://www.vidking.net/embed/tv/",
    paramStyle: "path-slash",
    icon: <Crown className="w-4 h-4" />,
    features: ["Recommended", "Fast"],
    description: "Fast loading with a modern player.",
  },
  {
    name: "VidLink",
    url: "https://vidlink.pro/tv/",
    paramStyle: "path-slash",
    icon: <Play className="w-4 h-4" />,
    features: ["Recommended"],
    description: "Fast loading with a modern player.",
  },
  {
    name: "VidAPI",
    url: "https://vaplayer.ru/embed/tv/",
    paramStyle: "path-slash",
    icon: <Webhook className="w-4 h-4" />,
    features: ["Recommended"],
    description: "Fast loading with a modern player.",
  },
  {
    name: "VidSrc",
    url: "https://v2.vidsrc.me/embed/tv/",
    paramStyle: "path-slash",
    icon: <Languages className="w-4 h-4" />,
    features: ["Multi-Language"],
    description: "Good for non-English audio.",
  },
  {
    name: "MoviesAPI",
    url: "https://moviesapi.club/tv/",
    paramStyle: "path-hyphen-mapi",
    icon: <List className="w-4 h-4" />,
    features: ["Multi-Language"],
    description: "Reliable alternative.",
  },
  {
    name: "videasy",
    url: "https://player.videasy.net/tv/",
    paramStyle: "path-slash",
    icon: <Clapperboard className="w-4 h-4" />,
    features: ["Multi-sub"],
    description: "Clean player with subtitle choices.",
  },
  {
    name: "Vidsrc 2",
    url: "https://vidsrc.to/embed/tv/",
    paramStyle: "path-slash",
    icon: <Server className="w-4 h-4" />,
    features: ["Backup"],
    description: "Secondary backup source.",
  },
  {
    name: "2Embed",
    url: "https://2embed.cc/embed/tv/",
    paramStyle: "path-slash",
    icon: <ShieldAlert className="w-4 h-4" />,
    features: ["Ads"],
    description: "Adblocker is highly recommended.",
  },
];

// --- MAIN COMPONENT ---

const EpisodeInfo = ({ episodeDetails, seriesId, seasonData, seriesData }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedServer, setSelectedServer] = useState(TV_SOURCES[0]);
  const [defaultServerName, setDefaultServerName] = useState("");
  const [selectedSeason, setSelectedSeason] = useState(seasonData);
  const [selectedEpisode, setSelectedEpisode] = useState(episodeDetails);
  const [iframeSrc, setIframeSrc] = useState("");

  const [cast, setCast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAdPopup, setShowAdPopup] = useState(false);

  const lastSavedTime = useRef(0);
  const episodesContainerRef = useRef(null);

  // --- HYDRATION & INITIALIZATION ---
  useEffect(() => {
    setIsMounted(true);
    const dismissed = sessionStorage.getItem("adblockerNoticeDismissed");
    if (dismissed !== "true") setShowAdPopup(true);

    const savedDefault = localStorage.getItem("defaultTvServerName");
    const savedSession = sessionStorage.getItem("sessionTvServerName");

    if (savedDefault) setDefaultServerName(savedDefault);

    const initialServerName =
      savedSession || savedDefault || TV_SOURCES[0].name;
    const initialServer =
      TV_SOURCES.find((s) => s.name === initialServerName) || TV_SOURCES[0];
    setSelectedServer(initialServer);
  }, []);

  // Scroll to active episode on load
  useEffect(() => {
    if (episodesContainerRef.current) {
      const activeEp = episodesContainerRef.current.querySelector(
        '[data-active="true"]',
      );
      if (activeEp) {
        activeEp.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedEpisode]);

  // --- DATA FETCHING ---
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favs.some((i) => i.id === seriesData.id));

    const fetchRecs = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${seriesId}/recommendations?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
        );
        const data = await res.json();
        setRecommendations(data.results.slice(0, 8));
      } catch (e) {}
    };
    fetchRecs();
  }, [seriesId, seriesData.id]);

  useEffect(() => {
    const fetchCast = async () => {
      if (!selectedEpisode) return;
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${seriesId}/season/${selectedEpisode.season_number}/episode/${selectedEpisode.episode_number}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
        );
        const data = await res.json();
        setCast(data.cast || []);
      } catch (e) {}
    };
    fetchCast();
  }, [seriesId, selectedEpisode]);

  // --- URL BUILDER ---
  useEffect(() => {
    if (!isMounted || !selectedServer || !seriesId || !selectedEpisode) return;
    const { url, paramStyle } = selectedServer;
    const { season_number, episode_number } = selectedEpisode;
    let finalUrl = "";

    switch (paramStyle) {
      case "path-hyphen-mapi":
        finalUrl = `${url}${seriesId}-${season_number}-${episode_number}`;
        break;
      default:
        finalUrl = `${url}${seriesId}/${season_number}/${episode_number}`;
        break;
    }
    setIframeSrc(finalUrl);
  }, [selectedServer, seriesId, selectedEpisode, isMounted]);

  // --- PROGRESS TRACKING (Simplified for brevity) ---
  useEffect(() => {
    if (!seriesData || !selectedEpisode || typeof window === "undefined")
      return;
    const saveProgressPayload = (currentTime, duration) => {
      try {
        const progressDict = JSON.parse(
          localStorage.getItem("mediaProgress") || "{}",
        );
        progressDict[seriesData.id] = {
          id: seriesData.id,
          type: "tv",
          title: seriesData.name,
          poster_path: seriesData.poster_path,
          backdrop_path: seriesData.backdrop_path,
          overview: seriesData.overview,
          vote_average: seriesData.vote_average,
          last_season_watched: selectedEpisode.season_number,
          last_episode_watched: selectedEpisode.episode_number,
          last_updated: Date.now(),
          progress: {
            watched: Number(currentTime),
            duration: Number(duration),
          },
        };
        localStorage.setItem("mediaProgress", JSON.stringify(progressDict));
        window.dispatchEvent(new Event("storage"));
      } catch (e) {}
    };

    const currentProgress = JSON.parse(
      localStorage.getItem("mediaProgress") || "{}",
    )[seriesData.id];
    const isSameEpisode =
      currentProgress &&
      currentProgress.last_season_watched === selectedEpisode.season_number &&
      currentProgress.last_episode_watched === selectedEpisode.episode_number;

    if (!isSameEpisode) {
      saveProgressPayload(0, (selectedEpisode.runtime || 24) * 60);
      lastSavedTime.current = 0;
    }

    const handleMessage = (event) => {
      try {
        let data = event.data;
        if (typeof data === "string") data = JSON.parse(data);
        const isTimeUpdate =
          data.event === "timeupdate" || data.type === "timeupdate";
        if (
          isTimeUpdate ||
          data.currentTime !== undefined ||
          data?.data?.currentTime !== undefined
        ) {
          const currentTime =
            data.currentTime ?? data.data?.currentTime ?? data.time ?? 0;
          const duration =
            data.duration ??
            data.data?.duration ??
            selectedEpisode.runtime * 60 ??
            1440;

          if (
            currentTime > 0 &&
            Math.abs(currentTime - lastSavedTime.current) >= 5
          ) {
            saveProgressPayload(currentTime, duration);
            lastSavedTime.current = currentTime;
          }
        }
      } catch (err) {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [seriesData, selectedEpisode]);

  // --- HANDLERS ---
  const handleServerChange = (server) => {
    setSelectedServer(server);
    sessionStorage.setItem("sessionTvServerName", server.name);
  };

  const handleSetDefault = (serverName) => {
    setDefaultServerName(serverName);
    localStorage.setItem("defaultTvServerName", serverName);
    setToast(`Set ${serverName} as default source`);
    setTimeout(() => setToast(null), 3000);
  };

  const updateURL = (seasonNumber, episodeNumber) => {
    window.history.pushState(
      null,
      "",
      `/series/${seriesId}/season/${seasonNumber}/${episodeNumber}`,
    );
  };

  const handleSeasonChange = async (seasonNumber) => {
    if (seasonNumber === selectedSeason.season_number) return;
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
      );
      const data = await res.json();
      setSelectedSeason(data);
      if (data.episodes?.length > 0) {
        const firstEp = data.episodes[0];
        setSelectedEpisode(firstEp);
        updateURL(seasonNumber, firstEp.episode_number);
      }
    } catch (e) {
      setToast(`Error loading Season ${seasonNumber}`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleEpisodeClick = (ep) => {
    setSelectedEpisode(ep);
    updateURL(ep.season_number, ep.episode_number);
  };

  const toggleFav = () => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (isFavorite) {
      localStorage.setItem(
        "favorites",
        JSON.stringify(favs.filter((i) => i.id !== seriesData.id)),
      );
      setToast("Removed from Library");
    } else {
      localStorage.setItem("favorites", JSON.stringify([...favs, seriesData]));
      setToast("Added to Library");
    }
    setIsFavorite(!isFavorite);
    setTimeout(() => setToast(null), 3000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast("Link copied to clipboard");
    setTimeout(() => setToast(null), 3000);
  };

  const dismissAd = () => {
    sessionStorage.setItem("adblockerNoticeDismissed", "true");
    setShowAdPopup(false);
  };

  const bgImage = seriesData.backdrop_path
    ? `https://image.tmdb.org/t/p/original${seriesData.backdrop_path}`
    : `https://image.tmdb.org/t/p/original${seriesData.poster_path}`;

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans pt-[72px] lg:pt-[90px] pb-16 selection:bg-indigo-500/30 relative">
      {/* Cinematic Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505] to-[#050505] z-10" />
        <img
          src={bgImage}
          className="w-full h-full object-cover blur-[80px] opacity-20 scale-110"
          alt="Background"
        />
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* =========================================
              LEFT COLUMN: PLAYER & INFO (Main Focus) 
              ========================================= */}
          <div className="flex-1 lg:w-[65%] xl:w-[70%] flex flex-col gap-6">
            {/* 1. THE PLAYER */}
            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group ring-1 ring-white/5">
              {isMounted && iframeSrc ? (
                <iframe
                  src={iframeSrc}
                  className="w-full h-full absolute inset-0 z-10"
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                  title="Player"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 text-sm gap-4 absolute inset-0 z-0 bg-[#0a0a0a]">
                  <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-indigo-500 animate-spin" />
                  <span className="font-medium tracking-wide">
                    Loading Player...
                  </span>
                </div>
              )}
            </div>

            {/* 2. HEADER INFO & METADATA */}
            <div className="flex flex-col sm:flex-row gap-6 justify-between items-start bg-[#0a0a0a]/40 p-5 rounded-2xl border border-white/[0.05] backdrop-blur-md">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2 leading-tight">
                  {seriesData.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium mb-3">
                  <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded text-xs border border-indigo-500/20">
                    S{selectedEpisode.season_number} E
                    {selectedEpisode.episode_number}
                  </span>
                  <span className="text-white/90">{selectedEpisode.name}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Clock size={14} /> {selectedEpisode.runtime || 24}m
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Calendar size={14} />{" "}
                    {selectedEpisode.air_date?.split("-")[0] || "-"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={toggleFav}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all active:scale-95 shadow-lg border ${
                    isFavorite
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20"
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  }`}
                  title="Save to Library"
                >
                  <Heart
                    size={20}
                    className={isFavorite ? "fill-current" : ""}
                  />
                </button>
                <button
                  onClick={copyLink}
                  className="w-12 h-12 flex items-center justify-center rounded-xl transition-all active:scale-95 shadow-lg bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  title="Share"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* 3. SERVER SELECTION (Horizontal sleek row) */}
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <Server size={14} className="text-neutral-500" />
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Sources
                </h3>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x">
                {TV_SOURCES.map((s) => {
                  const isActive = selectedServer.name === s.name;
                  const isDefault = s.name === defaultServerName;
                  return (
                    <button
                      key={s.name}
                      onClick={() => handleServerChange(s)}
                      onDoubleClick={() => handleSetDefault(s.name)}
                      className={`flex flex-col gap-1 px-4 py-2.5 rounded-xl border transition-all snap-start shrink-0 active:scale-95 text-left
                        ${
                          isActive
                            ? "bg-indigo-500/15 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                            : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            isActive ? "text-indigo-400" : "text-neutral-500"
                          }
                        >
                          {s.icon}
                        </span>
                        <span
                          className={`text-sm font-bold ${isActive ? "text-white" : "text-neutral-300"}`}
                        >
                          {s.name}
                        </span>
                        {isDefault && (
                          <Star
                            size={10}
                            className="text-amber-400 fill-amber-400 ml-1"
                          />
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-500 font-medium">
                        {s.features[0] || "Standard"}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 px-1">
                * Double-click a source to set as default. If video buffers, try
                switching sources.
              </p>
            </div>

            {/* 4. DETAILS TABS (Overview, Cast, Related) */}
            <div className="mt-4">
              <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl w-fit mb-5 overflow-x-auto scrollbar-hide max-w-full backdrop-blur-sm">
                {["overview", "cast", "related"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="relative px-6 py-2.5 rounded-xl text-xs font-bold capitalize tracking-wide transition-colors shrink-0"
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white/[0.08] border border-white/[0.05] rounded-xl z-0 shadow-sm"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 ${activeTab === tab ? "text-white" : "text-neutral-400 hover:text-neutral-200"}`}
                    >
                      {tab}
                    </span>
                  </button>
                ))}
              </div>

              <div className="bg-[#0a0a0a]/40 border border-white/[0.05] rounded-2xl p-5 sm:p-6 backdrop-blur-md min-h-[250px]">
                <AnimatePresence mode="wait">
                  {/* OVERVIEW */}
                  {activeTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-[10px] font-bold uppercase text-indigo-400 tracking-widest mb-2">
                          Episode Synopsis
                        </h3>
                        <p className="text-sm leading-relaxed text-neutral-300 font-medium">
                          {selectedEpisode.overview ||
                            "No overview available for this episode."}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        <h3 className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest mb-2">
                          Series Overview
                        </h3>
                        <p className="text-xs leading-relaxed text-neutral-400">
                          {seriesData.overview}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* CAST */}
                  {activeTab === "cast" && (
                    <motion.div
                      key="cast"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      {cast.length > 0 ? (
                        cast.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                          >
                            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#121212] border border-white/10">
                              <img
                                src={
                                  c.profile_path
                                    ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
                                    : "https://via.placeholder.com/50"
                                }
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                alt={c.name}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-white truncate">
                                {c.name}
                              </div>
                              <div className="text-[10px] text-neutral-400 uppercase tracking-wide truncate mt-0.5">
                                {c.character}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-neutral-500 text-sm py-8 text-center">
                          No cast info available for this episode.
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* RELATED */}
                  {activeTab === "related" && (
                    <motion.div
                      key="related"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                    >
                      {recommendations.length > 0 ? (
                        recommendations.map((m) => (
                          <a
                            key={m.id}
                            href={`/series/${m.id}`}
                            className="aspect-[2/3] relative group overflow-hidden rounded-xl border border-white/10 block bg-[#121212]"
                          >
                            <img
                              src={`https://image.tmdb.org/t/p/w300${m.poster_path || m.backdrop_path}`}
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                              alt={m.name}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                              <span className="text-xs font-bold text-white line-clamp-2">
                                {m.name}
                              </span>
                            </div>
                          </a>
                        ))
                      ) : (
                        <div className="col-span-full text-neutral-500 text-sm py-8 text-center">
                          No related series found.
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* =========================================
              RIGHT COLUMN: SEASONS & EPISODES 
              ========================================= */}
          <div className="w-full lg:w-[35%] xl:w-[30%] shrink-0">
            <div className="bg-[#0a0a0a]/80 border border-white/[0.08] rounded-2xl flex flex-col h-auto lg:h-[calc(100vh-120px)] lg:sticky lg:top-[90px] overflow-hidden backdrop-blur-xl shadow-2xl">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-white/[0.02]">
                <h2 className="text-lg font-bold text-white flex items-center justify-between">
                  Episodes
                  <span className="text-xs font-medium text-neutral-500 bg-white/5 px-2.5 py-1 rounded-md">
                    {selectedSeason.episodes?.length || 0} EPS
                  </span>
                </h2>

                {/* Seasons Pills */}
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x">
                  {seriesData.seasons
                    ?.filter((s) => s.episode_count > 0)
                    .map((s) => {
                      const isActive =
                        selectedSeason.season_number === s.season_number;
                      return (
                        <button
                          key={s.id}
                          onClick={() => handleSeasonChange(s.season_number)}
                          className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all snap-start border ${
                            isActive
                              ? "bg-white text-black border-white shadow-md"
                              : "bg-white/[0.03] text-neutral-400 border-white/[0.08] hover:bg-white/[0.08] hover:text-white"
                          }`}
                        >
                          {s.name}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Episodes List Container */}
              <div
                ref={episodesContainerRef}
                className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar min-h-[400px] lg:min-h-0"
              >
                {selectedSeason.episodes?.map((ep) => {
                  const isSelected = selectedEpisode.id === ep.id;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => handleEpisodeClick(ep)}
                      data-active={isSelected}
                      className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 flex gap-3.5 items-center group active:scale-[0.98] border ${
                        isSelected
                          ? "bg-indigo-500/15 border-indigo-500/30 text-white shadow-inner relative overflow-hidden"
                          : "bg-transparent border-transparent hover:bg-white/[0.05] text-neutral-300"
                      }`}
                    >
                      {/* Optional side accent for active state */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl" />
                      )}

                      <div className="relative w-24 sm:w-28 aspect-video bg-black/50 rounded-lg overflow-hidden shrink-0">
                        {ep.still_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                            className={`w-full h-full object-cover transition-transform duration-500 ${
                              isSelected
                                ? "opacity-100"
                                : "opacity-60 group-hover:opacity-100 group-hover:scale-105"
                            }`}
                            alt={`Ep ${ep.episode_number}`}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-700 bg-[#111]">
                            <Film size={16} />
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                            <Play
                              size={16}
                              className="text-white fill-white drop-shadow-md"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span
                          className={`text-[10px] font-bold uppercase mb-1 ${isSelected ? "text-indigo-400" : "text-neutral-500"}`}
                        >
                          Episode {ep.episode_number}
                        </span>
                        <span
                          className={`text-sm font-semibold truncate mb-1 ${isSelected ? "text-white" : "text-neutral-200"}`}
                        >
                          {ep.name}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">
                          {ep.runtime || 24} min
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST NOTIFICATIONS */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 text-white px-5 py-3.5 rounded-full shadow-2xl font-bold text-xs flex items-center gap-3 min-w-[250px] justify-center"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check size={12} strokeWidth={3} />
            </div>
            {toast}
          </motion.div>
        )}

        {/* ADBLOCK WARNING */}
        {showAdPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-[100] w-[340px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl"
          >
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                <ShieldAlert className="text-amber-500" size={18} />
              </div>
              <div className="flex-1 pt-0.5">
                <h4 className="font-bold text-white text-sm mb-1">
                  Adblock Recommended
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Third-party sources may contain popups. We strongly advise
                  using{" "}
                  <span className="text-indigo-400 font-bold">
                    uBlock Origin
                  </span>
                  .
                </p>
              </div>
              <button
                onClick={dismissAd}
                className="text-neutral-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default EpisodeInfo;
