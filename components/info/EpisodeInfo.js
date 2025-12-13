"use client";
import React, { useState, useEffect } from "react";
import {
  Play,
  Star,
  Clock,
  Calendar,
  Server,
  Heart,
  Share2,
  Film,
  ArrowRight,
  Zap,
  Languages,
  Check,
  Clapperboard,
  ShieldAlert,
  List,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- CONSTANTS ---
const TV_SOURCES = [
  {
    name: "VidLink",
    url: "https://vidlink.pro/tv/",
    paramStyle: "path-slash",
    icon: <Zap className="w-4 h-4 text-yellow-400" />,
    features: ["Recommended", "Fast"],
    description: "Fast loading with a modern player and tracking.",
  },
  {
    name: "VidSrc",
    url: "https://v2.vidsrc.me/embed/tv/",
    paramStyle: "path-slash",
    icon: <Languages className="w-4 h-4 text-blue-400" />,
    features: ["Multi-Language"],
    description: "Good source for non-English audio options.",
  },
  {
    name: "MoviesAPI",
    url: "https://moviesapi.club/tv/",
    paramStyle: "path-hyphen-mapi",
    icon: <List className="w-4 h-4 text-green-400" />,
    features: ["Multi-Language", "Fast"],
    description: "A reliable alternative with good subtitle support.",
  },
  {
    name: "videasy",
    url: "https://player.videasy.net/tv/",
    paramStyle: "path-slash",
    icon: <Clapperboard className="w-4 h-4 text-purple-400" />,
    features: ["Multi-sub", "Clean UI"],
    description: "Features a clean player with multiple subtitle choices.",
  },
  {
    name: "Vidsrc 2",
    url: "https://vidsrc.to/embed/tv/",
    paramStyle: "path-slash",
    icon: <Server className="w-4 h-4 text-slate-400" />,
    features: ["Multi-Language", "Backup"],
    description: "A secondary backup source for language options.",
  },
  {
    name: "2Embed",
    url: "https://2embed.cc/embed/tv/",
    paramStyle: "path-slash",
    icon: <ShieldAlert className="w-4 h-4 text-orange-400" />,
    features: ["Ads"],
    description: "Backup source. Adblocker is highly recommended.",
  },
  {
    name: "VidSrc 3",
    url: "https://vidsrc.net/embed/tv/",
    paramStyle: "path-slash",
    icon: <Languages className="w-4 h-4 text-blue-400" />,
    features: ["Multi-Language", "Backup"],
    description: "Alternative source for subtitles.",
  },
  {
    name: "EmbedSu",
    url: "https://embed.su/embed/tv/",
    paramStyle: "path-slash",
    icon: <Server className="w-4 h-4 text-indigo-400" />,
    features: ["Multi-Language"],
    description: "Stable embed with language options.",
  },
];

// --- MICRO COMPONENTS ---

const MaterialChip = ({ children, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`
      relative px-4 py-2 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide transition-all duration-300 flex items-center gap-2 overflow-hidden shrink-0
      ${
        active
          ? "text-[#001d35]"
          : "text-neutral-400 hover:text-white hover:bg-white/5"
      }
    `}
  >
    {active && (
      <motion.div
        layoutId="activeServer"
        className="absolute inset-0 bg-[#cce5ff] z-0"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
    <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
      {icon} {children}
    </span>
  </button>
);

const MetaBadge = ({ icon: Icon, value, color }) => (
  <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/5 px-3 py-1.5 rounded-lg">
    <Icon size={14} className={color} />
    <span className="text-xs font-bold text-white">{value}</span>
  </div>
);

// --- MAIN COMPONENT ---

const EpisodeInfo = ({ episodeDetails, seriesId, seasonData, seriesData }) => {
  // --- STATE ---
  const [selectedServer, setSelectedServer] = useState(TV_SOURCES[0]);
  const [selectedSeason, setSelectedSeason] = useState(seasonData);
  const [selectedEpisode, setSelectedEpisode] = useState(episodeDetails);
  const [iframeSrc, setIframeSrc] = useState("");

  const [cast, setCast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("episodes");
  const [showAdPopup, setShowAdPopup] = useState(false);

  // --- EFFECTS ---

  useEffect(() => {
    const dismissed = sessionStorage.getItem("adblockerNoticeDismissed");
    if (dismissed !== "true") setShowAdPopup(true);

    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favs.some((i) => i.id === seriesData.id));

    const fetchRecs = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${seriesId}/recommendations?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
        );
        const data = await res.json();
        setRecommendations(data.results.slice(0, 10));
      } catch (e) {
        console.error(e);
      }
    };
    fetchRecs();
  }, [seriesId, seriesData.id]);

  useEffect(() => {
    const fetchCast = async () => {
      if (!selectedEpisode) return;
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${seriesId}/season/${selectedEpisode.season_number}/episode/${selectedEpisode.episode_number}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
        );
        const data = await res.json();
        setCast(data.cast || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCast();
  }, [seriesId, selectedEpisode]);

  useEffect(() => {
    if (!selectedServer || !seriesId || !selectedEpisode) return;
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
  }, [selectedServer, seriesId, selectedEpisode]);

  // --- HANDLERS ---

  const handleSeasonChange = async (seasonNumber) => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
      );
      const data = await res.json();
      setSelectedSeason(data);
      if (data.episodes?.length > 0) setSelectedEpisode(data.episodes[0]);
    } catch (e) {
      setToast(`Error loading Season ${seasonNumber}`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const toggleFav = () => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (isFavorite) {
      localStorage.setItem(
        "favorites",
        JSON.stringify(favs.filter((i) => i.id !== seriesData.id))
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
    setToast("Link copied");
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
    <div className="h-screen w-full bg-[#050505] text-white font-sans overflow-hidden flex flex-col pt-16 lg:pt-0">
      {/* 1. BACKGROUND LAYERS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        <img
          src={bgImage}
          className="w-full h-full object-cover blur-3xl opacity-20"
          alt="Background"
        />
      </div>

      {/* 2. MAIN LAYOUT (Grid 4/8 for Balance) */}
      <div className="relative z-10 flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-0 lg:divide-x divide-white/5 border-t border-white/5 lg:h-[calc(100vh)]">
        {/* === LEFT COLUMN: INFO & SELECTORS === */}
        {/* Adjusted padding to be tighter for laptops */}
        <div className="order-2 lg:order-1 lg:col-span-4 bg-[#050505]/60 backdrop-blur-xl flex flex-col h-auto lg:h-full lg:overflow-y-auto custom-scrollbar pb-20 lg:pb-0 lg:pt-20">
          {/* Header */}
          <div className="px-5 md:px-8 pb-0 pt-6 lg:pt-0">
            <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-[#d0bcff]">
                TV Series
              </span>
              {seriesData.genres?.slice(0, 2).map((g) => (
                <span
                  key={g.id}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-neutral-400"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Slightly reduced text size from 5xl to 3xl/4xl for laptop fit */}
            <h1 className="text-3xl lg:text-4xl font-black tracking-tighter leading-[0.95] text-white uppercase break-words mb-3 drop-shadow-lg">
              {seriesData.name}
            </h1>

            <div className="flex items-center gap-2 mb-5 md:mb-6 text-neutral-400 font-mono text-[10px] md:text-xs uppercase tracking-widest">
              <span className="text-[#cce5ff]">
                S{selectedEpisode.season_number}
              </span>
              <span>•</span>
              <span className="text-[#cce5ff]">
                E{selectedEpisode.episode_number}
              </span>
              <span>•</span>
              <span className="truncate max-w-[150px] md:max-w-none">
                {selectedEpisode.name}
              </span>
            </div>

            {/* Metadata Pills - Tighter margins */}
            <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
              <MetaBadge
                icon={Star}
                value={selectedEpisode.vote_average?.toFixed(1)}
                color="text-yellow-400"
              />
              <MetaBadge
                icon={Clock}
                value={`${selectedEpisode.runtime || 24}m`}
                color="text-blue-400"
              />
              <MetaBadge
                icon={Calendar}
                value={selectedEpisode.air_date?.split("-")[0]}
                color="text-green-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 md:px-8 grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={toggleFav}
              className={`h-10 rounded-[0.8rem] flex items-center justify-center gap-2 font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all ${
                isFavorite
                  ? "bg-[#ffb4ab] text-[#690005]"
                  : "bg-[#252525] text-white hover:bg-white hover:text-black"
              }`}
            >
              <Heart size={16} className={isFavorite ? "fill-current" : ""} />{" "}
              {isFavorite ? "Saved" : "Save"}
            </button>
            <button
              onClick={copyLink}
              className="h-10 rounded-[0.8rem] bg-[#252525] flex items-center justify-center gap-2 font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#e6e1e5] hover:text-[#1c1b1f] transition-all"
            >
              <Share2 size={16} /> Share
            </button>
          </div>

          {/* Tabs - Fill remaining height */}
          <div className="flex-1 border-t border-white/5 flex flex-col min-h-[300px]">
            <div className="flex px-8 pt-4 gap-2 overflow-x-auto scrollbar-hide shrink-0">
              {["episodes", "info", "cast"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors shrink-0 ${
                    activeTab === tab
                      ? "bg-white text-black"
                      : "text-neutral-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-4 md:p-8 flex-1 lg:overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {/* TAB: EPISODES */}
                {activeTab === "episodes" && (
                  <motion.div
                    key="episodes"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="mb-4">
                      <Select
                        value={selectedSeason.season_number.toString()}
                        onValueChange={handleSeasonChange}
                      >
                        <SelectTrigger className="w-full h-10 bg-[#1a1a1a] border-white/10 text-white rounded-xl focus:ring-0 focus:ring-offset-0">
                          <SelectValue placeholder="Select Season" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-60 z-[100]">
                          {seriesData.seasons
                            ?.filter((s) => s.episode_count > 0)
                            .map((s) => (
                              <SelectItem
                                key={s.id}
                                value={s.season_number.toString()}
                              >
                                {s.name} ({s.episode_count} Eps)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      {selectedSeason.episodes?.map((ep) => (
                        <button
                          key={ep.id}
                          onClick={() => setSelectedEpisode(ep)}
                          className={`w-full text-left p-2 rounded-xl transition-all flex gap-3 items-center group ${
                            selectedEpisode.id === ep.id
                              ? "bg-[#cce5ff] text-[#001d35]"
                              : "bg-[#111] hover:bg-white/10 text-neutral-300"
                          }`}
                        >
                          <div className="relative w-16 aspect-video bg-black rounded-lg overflow-hidden shrink-0 border border-black/20">
                            {ep.still_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w200${ep.still_path}`}
                                className="w-full h-full object-cover"
                                alt={`Ep ${ep.episode_number}`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-600">
                                <Film size={12} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-mono opacity-60 mb-0.5">
                              EP {ep.episode_number}
                            </div>
                            <div className="text-xs font-bold truncate leading-tight">
                              {ep.name}
                            </div>
                          </div>
                          {selectedEpisode.id === ep.id && (
                            <Play size={12} fill="currentColor" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* TAB: INFO */}
                {activeTab === "info" && (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="mb-6">
                      <h3 className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest mb-2">
                        Episode Overview
                      </h3>
                      <p className="text-xs lg:text-sm leading-relaxed text-neutral-200 font-medium">
                        {selectedEpisode.overview || "No overview available."}
                      </p>
                    </div>
                    <div className="pt-6 border-t border-white/5">
                      <h3 className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest mb-2">
                        Series Overview
                      </h3>
                      <p className="text-xs lg:text-sm leading-relaxed text-neutral-400">
                        {seriesData.overview}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* TAB: CAST */}
                {activeTab === "cast" && (
                  <motion.div
                    key="cast"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {cast.length > 0 ? (
                      cast.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
                        >
                          <img
                            src={
                              c.profile_path
                                ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
                                : "https://via.placeholder.com/50"
                            }
                            className="w-8 h-8 rounded-full object-cover bg-neutral-800"
                            alt={c.name}
                          />
                          <div>
                            <div className="text-xs font-bold text-white">
                              {c.name}
                            </div>
                            <div className="text-[10px] text-neutral-500">
                              {c.character}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-neutral-500 italic text-xs">
                        No cast info available.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: PLAYER & SUGGESTIONS === */}
        <div className="order-1 lg:order-2 lg:col-span-8 flex flex-col h-auto lg:h-full bg-black/40 backdrop-blur-md relative lg:pt-20">
          {/* 1. TOP BAR: Compressed Height (h-14 vs h-20) */}
          <div className="h-14 flex items-center px-4 md:px-6 border-b border-white/5 gap-4 overflow-x-auto scrollbar-hide shrink-0 bg-[#050505]/40">
            <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest shrink-0 hidden md:block">
              Source
            </span>
            <div className="flex gap-2 pr-4">
              {TV_SOURCES.map((s) => (
                <MaterialChip
                  key={s.name}
                  active={selectedServer.name === s.name}
                  onClick={() => setSelectedServer(s)}
                  icon={s.icon}
                >
                  {s.name}
                </MaterialChip>
              ))}
            </div>
          </div>

          {/* 2. PLAYER STAGE: Reduced Padding (p-4 vs p-12) */}
          <div className="flex-1 flex items-center justify-center p-4 lg:p-6 bg-[#0a0a0a] relative group min-h-[250px] lg:min-h-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 opacity-50 pointer-events-none" />

            <div className="w-full h-full max-w-6xl aspect-video relative rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 z-10 bg-black">
              {iframeSrc ? (
                <iframe
                  src={iframeSrc}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                  title="Player"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500">
                  Loading Player...
                </div>
              )}
            </div>
          </div>

          {/* 3. RECOMMENDATIONS: Compressed Height (h-36 vs h-44) */}
          <div className="h-auto py-6 lg:py-0 lg:h-36 border-t border-white/5 bg-[#050505]/80 backdrop-blur-lg flex flex-col justify-center px-4 md:px-6 shrink-0">
            <div className="flex items-center justify-between mb-2 lg:hidden">
              <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest flex items-center gap-2">
                <Film size={12} /> Recommended
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto items-center scrollbar-hide pb-2 lg:pb-0 h-full">
              {/* Added a text label for desktop layout */}
              <div className="hidden lg:flex flex-col justify-center mr-4 w-24 shrink-0">
                <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest mb-1">
                  Up Next
                </span>
                <span className="text-xs font-bold leading-tight">
                  Similar Series
                </span>
              </div>

              {recommendations.map((m) => (
                <a
                  key={m.id}
                  href={`/series/${m.id}`}
                  className="w-36 md:w-44 shrink-0 aspect-video relative group cursor-pointer overflow-hidden rounded-lg border border-white/10 block"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w300${
                      m.backdrop_path || m.poster_path
                    }`}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    alt={m.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="text-[10px] font-bold truncate text-white translate-y-6 group-hover:translate-y-0 transition-transform">
                      {m.name}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TOAST & AD POPUP */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-10 lg:bottom-10 z-[100] bg-[#cce5ff] text-[#001d35] px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center justify-center lg:justify-start gap-3 border border-white/20"
          >
            <Check size={16} /> {toast}
          </motion.div>
        )}

        {showAdPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-4 left-4 right-4 lg:bottom-10 lg:left-10 lg:right-auto z-[100] max-w-sm mx-auto bg-[#1a1a1a] border border-white/10 p-4 rounded-2xl shadow-2xl"
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="text-yellow-500" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">
                  Adblock Recommended
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Video providers often have popups. Use{" "}
                  <span className="text-indigo-400">uBlock Origin</span> for the
                  best experience.
                </p>
              </div>
              <button
                onClick={dismissAd}
                className="text-neutral-500 hover:text-white h-fit"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
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
