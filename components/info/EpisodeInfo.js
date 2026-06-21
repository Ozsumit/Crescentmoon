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
  ChevronDown,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useSettingsStore from "@/components/settings-store";
import { TV_SERVERS as DEFAULT_TV_SOURCES } from "@/lib/config";

// --- CONSTANTS & HELPERS ---

const getIcon = (iconName, props = { className: "w-4 h-4" }) => {
  const icons = {
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
    ChevronDown,
    Download,
  };
  const IconComponent = icons[iconName] || Play;
  return <IconComponent {...props} />;
};

// --- MAIN COMPONENT ---

const EpisodeInfo = ({
  episodeDetails,
  seriesId,
  seasonData,
  seriesData,
  videoSources = [],
}) => {
  const sources =
    videoSources.length > 0
      ? videoSources.filter((s) => s.active)
      : DEFAULT_TV_SOURCES;

  const { defaultTvServer, showAdNotice } = useSettingsStore();

  const [isMounted, setIsMounted] = useState(false);
  const [selectedServer, setSelectedServer] = useState(sources[0]);
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
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);

  const lastSavedTime = useRef(0);
  const dropdownRef = useRef(null);

  // Determine Next Episode
  const nextEpisode = selectedSeason.episodes?.find(
    (ep) => ep.episode_number === selectedEpisode.episode_number + 1,
  );

  // --- HYDRATION & INITIALIZATION ---
  useEffect(() => {
    setIsMounted(true);
    const dismissed = sessionStorage.getItem("adblockerNoticeDismissed");
    if (dismissed !== "true" && showAdNotice) setShowAdPopup(true);

    const savedDefault = defaultTvServer;
    const savedSession = sessionStorage.getItem("sessionTvServerName");

    if (savedDefault) setDefaultServerName(savedDefault);

    const initialServerName = savedSession || savedDefault || sources[0].name;
    const initialServer =
      sources.find((s) => s.name === initialServerName) || sources[0];
    setSelectedServer(initialServer);
  }, [sources, defaultTvServer, showAdNotice]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSeasonDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        setRecommendations(data.results.slice(0, 10));
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
      case "cinesrc":
        finalUrl = `${url}${seriesId}?s=${season_number}&e=${episode_number}`;
        break;
      default:
        finalUrl = `${url}${seriesId}/${season_number}/${episode_number}`;
        break;
    }
    setIframeSrc(finalUrl);
  }, [selectedServer, seriesId, selectedEpisode, isMounted]);

  // --- PROGRESS TRACKING ---
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
      setSelectedSeason(data); // Browsing context updated, active video unchanged.
    } catch (e) {
      setToast(`Error loading Season ${seasonNumber}`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleEpisodeClick = (ep) => {
    setSelectedEpisode(ep);
    updateURL(ep.season_number, ep.episode_number);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          alt="Background shadow"
        />
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* =========================================
              LEFT COLUMN: PLAYER & INFO (Original Layout)
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
                  // sandbox="allow-scripts allow-same-origin allow-presentation"
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
                <button
                  onClick={() => setShowDownloadPopup(true)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl transition-all active:scale-95 shadow-lg border border-indigo-500 text-white"
                  title="Download Episode"
                >
                  <Download size={20} />
                </button>
              </div>
            </div>

            {/* 3. REDESIGNED SOURCE SELECTION GRID */}
            <div className="bg-[#0a0a0a]/40 p-5 rounded-2xl border border-white/[0.05] backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Server size={14} className="text-indigo-400" />
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    Select Stream Server
                  </h3>
                </div>
                <span className="text-[10px] text-neutral-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                  {sources.length} Available
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sources.map((s) => {
                  const isActive = selectedServer.name === s.name;
                  const isDefault = s.name === defaultServerName;
                  return (
                    <button
                      key={s.name}
                      onClick={() => handleServerChange(s)}
                      onDoubleClick={() => handleSetDefault(s.name)}
                      className={`relative p-3 rounded-xl border text-left flex items-center gap-3 transition-all duration-200 group active:scale-95
                        ${
                          isActive
                            ? "bg-indigo-600/10 border-indigo-500/40 ring-1 ring-indigo-500/20"
                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                        }
                      `}
                    >
                      {/* Icon Container */}
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors
                        ${
                          isActive
                            ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/20"
                            : "bg-white/5 text-neutral-400 border-white/5 group-hover:text-neutral-300"
                        }
                      `}
                      >
                        {typeof s.icon === "string"
                          ? getIcon(s.icon, { className: "w-4 h-4" })
                          : s.icon}
                      </div>

                      {/* Server Details */}
                      <div className="min-w-0 flex-1">
                        <span
                          className={`text-xs font-bold block truncate transition-colors ${isActive ? "text-white" : "text-neutral-300"}`}
                        >
                          {s.name}
                        </span>
                        <span className="text-[9px] text-neutral-500 font-medium block uppercase tracking-wide mt-0.5">
                          {s.features?.[0] || "Standard"}
                        </span>
                      </div>

                      {/* Default Server Indicator */}
                      {isDefault && (
                        <div className="absolute top-2 right-2">
                          <Star
                            size={10}
                            className="text-amber-400 fill-amber-400"
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-neutral-500 mt-3 px-1 flex items-center gap-1.5">
                <Info size={11} className="text-neutral-600" />
                <span>
                  Double-click a server card to save as your default preference.
                </span>
              </p>
            </div>

            {/* 4. DETAILS TABS (Overview & Cast) */}
            <div className="mt-2">
              <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl w-fit mb-5">
                {["overview", "cast"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="relative px-6 py-2.5 rounded-xl text-xs font-bold capitalize tracking-wide transition-colors shrink-0"
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white/[0.08] border border-white/[0.05] rounded-xl z-0"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 ${activeTab === tab ? "text-white" : "text-neutral-400"}`}
                    >
                      {tab}
                    </span>
                  </button>
                ))}
              </div>

              <div className="bg-[#0a0a0a]/40 border border-white/[0.05] rounded-2xl p-5 sm:p-6 backdrop-blur-md min-h-[200px]">
                <AnimatePresence mode="wait">
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
                        <h3 className="text-[10px] font-bold uppercase text-indigo-500 tracking-widest mb-2">
                          Series Overview
                        </h3>
                        <p className="text-xs leading-relaxed text-neutral-400">
                          {seriesData.overview}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "cast" && (
                    <motion.div
                      key="cast"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      {cast.map((c) => (
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
                          <div>
                            <div className="text-sm font-bold text-white truncate">
                              {c.name}
                            </div>
                            <div className="text-[10px] text-neutral-400 uppercase tracking-wide truncate mt-0.5">
                              {c.character}
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* =========================================
              RIGHT COLUMN: YOUTUBE SIDEBAR FEED
              ========================================= */}
          <div className="w-full lg:w-[35%] xl:w-[30%] shrink-0 space-y-6">
            {/* 1. UP NEXT / NEXT EPISODE */}
            {nextEpisode && (
              <div className="bg-[#0a0a0a]/50 p-4 border border-white/[0.08] rounded-2xl backdrop-blur-xl">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-3">
                  Up Next
                </span>

                <div
                  onClick={() => handleEpisodeClick(nextEpisode)}
                  className="flex gap-3.5 cursor-pointer group"
                >
                  <div className="relative w-36 aspect-video bg-neutral-900 rounded-lg overflow-hidden shrink-0 border border-white/10">
                    {nextEpisode.still_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${nextEpisode.still_path}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={nextEpisode.name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-700">
                        <Film size={16} />
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-bold px-1.5 py-0.5 rounded text-white tracking-wide">
                      {nextEpisode.runtime || 24}m
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-start">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1">
                      Episode {nextEpisode.episode_number}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {nextEpisode.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                      {nextEpisode.overview || "No summary available."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. OTHER EPISODES WITH DROPDOWN SELECTOR */}
            <div className="bg-[#0a0a0a]/50 p-4 border border-white/[0.08] rounded-2xl backdrop-blur-xl space-y-4">
              <div className="space-y-3">
                {/* Custom Elegant Dropdown */}
                <div className="relative w-full" ref={dropdownRef}>
                  <button
                    onClick={() =>
                      setIsSeasonDropdownOpen(!isSeasonDropdownOpen)
                    }
                    className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold tracking-wide text-white hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <List size={14} className="text-indigo-400" />
                      {selectedSeason.name ||
                        `Season ${selectedSeason.season_number}`}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-neutral-400 transition-transform duration-200 ${isSeasonDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isSeasonDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 mt-2 z-50 max-h-64 overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl custom-scrollbar"
                      >
                        {seriesData.seasons
                          ?.filter((s) => s.episode_count > 0)
                          .map((s) => {
                            const isActive =
                              selectedSeason.season_number === s.season_number;
                            return (
                              <button
                                key={s.id}
                                onClick={() => {
                                  handleSeasonChange(s.season_number);
                                  setIsSeasonDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-xs font-semibold transition-colors flex items-center justify-between
                                  ${isActive ? "text-indigo-400 bg-indigo-500/10" : "text-neutral-300 hover:bg-white/5 hover:text-white"}`}
                              >
                                <span>{s.name}</span>
                                <span className="text-[10px] text-neutral-500 font-normal">
                                  {s.episode_count} Episodes
                                </span>
                              </button>
                            );
                          })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Episodes List */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-1 pt-1">
                {selectedSeason.episodes?.map((ep) => {
                  const isCurrentPlaying =
                    selectedEpisode.season_number === ep.season_number &&
                    selectedEpisode.episode_number === ep.episode_number;

                  return (
                    <div
                      key={ep.id}
                      onClick={() => handleEpisodeClick(ep)}
                      className={`flex gap-3 cursor-pointer group p-1.5 rounded-lg transition-colors
                          ${isCurrentPlaying ? "bg-indigo-500/10 border border-indigo-500/20" : "hover:bg-white/5"}`}
                    >
                      <div className="relative w-28 aspect-video bg-neutral-900 rounded-lg overflow-hidden shrink-0 border border-white/5">
                        {ep.still_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            alt={ep.name}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-800">
                            <Film size={14} />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-bold px-1 rounded text-white">
                          {ep.runtime || 24}m
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-[9px] font-bold ${isCurrentPlaying ? "text-indigo-400" : "text-neutral-500"} uppercase`}
                        >
                          {isCurrentPlaying
                            ? "Now Playing"
                            : `Episode ${ep.episode_number}`}
                        </span>
                        <h4
                          className={`text-xs font-bold group-hover:text-indigo-400 transition-colors line-clamp-1 mt-0.5
                            ${isCurrentPlaying ? "text-white" : "text-neutral-200"}`}
                        >
                          {ep.name}
                        </h4>
                        <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                          {ep.air_date?.split("-")[0] || "-"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. RECOMMENDATIONS (YT Style Related Media Feed) */}
            <div className="bg-[#0a0a0a]/50 p-4 border border-white/[0.08] rounded-2xl backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">
                Recommended Shows
              </h3>

              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {recommendations.map((m) => (
                  <a
                    key={m.id}
                    href={`/series/${m.id}`}
                    className="flex gap-3 cursor-pointer group"
                  >
                    <div className="relative w-28 h-16 bg-neutral-900 rounded-lg overflow-hidden shrink-0 border border-white/5">
                      <img
                        src={`https://image.tmdb.org/t/p/w300${m.backdrop_path || m.poster_path}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={m.name}
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-neutral-200 group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {m.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-neutral-500 font-semibold">
                        <span className="flex items-center gap-0.5 text-amber-500">
                          <Star size={8} className="fill-current" />
                          {m.vote_average?.toFixed(1)}
                        </span>
                        <span>•</span>
                        <span>{m.first_air_date?.split("-")[0] || "-"}</span>
                      </div>
                    </div>
                  </a>
                ))}
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

        {/* DOWNLOAD PORTAL MODAL */}
        {showDownloadPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl h-[80vh] bg-[#0c0c0c] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <Download size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                      Download Options
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-light">
                      S{selectedEpisode?.season_number} E
                      {selectedEpisode?.episode_number} — Access direct lines
                      via VidVault
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDownloadPopup(false)}
                  className="text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Iframe Body */}
              <div className="flex-1 bg-[#050505] relative">
                {selectedEpisode && (
                  <iframe
                    src={`https://vidvault.ru/tv/${seriesId}/${selectedEpisode.season_number}/${selectedEpisode.episode_number}`}
                    className="w-full h-full absolute inset-0 z-10 border-0"
                    allowFullScreen
                    title="Download Portal"
                  />
                )}
              </div>
            </motion.div>
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
