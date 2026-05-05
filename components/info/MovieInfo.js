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
  List,
  Clapperboard,
  Zap,
  Languages,
  Check,
  Webhook,
  ShieldAlert,
  X,
  Crown,
  Settings2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- CONSTANTS ---
const VIDEO_SOURCES = [
  {
    name: "vidking",
    url: "https://www.vidking.net/embed/movie/",
    params: "?color=c3f0c2&icons=default&autoplay=true&nextbutton=true",
    icon: <Crown className="w-3.5 h-3.5" />,
    features: ["Recommended", "Fast"],
    description: "Fast loading with a modern player.",
  },
  {
    name: "VidLink",
    url: "https://vidlink.pro/movie/",
    params:
      "?primaryColor=6a5fef&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=jw&title=true&poster=true&autoplay=true&nextbutton=true",
    icon: <Play className="w-3.5 h-3.5" />,
    features: ["Recommended", "Fast"],
    description: "Fast loading with a modern player.",
  },
  {
    name: "VidAPI",
    url: "https://vaplayer.ru/embed/movie/",
    params: "?skin=cinematic",
    icon: <Webhook className="w-3.5 h-3.5" />,
    features: ["Recommended", "Fast"],
    description: "Fast loading with a modern player.",
  },
  {
    name: "VidSrc",
    url: "https://v2.vidsrc.me/embed/movie/",
    params: "?multiLang=true",
    icon: <Languages className="w-3.5 h-3.5" />,
    features: ["Multi-Language"],
    description: "Good source for non-English audio.",
  },
  {
    name: "MoviesAPI",
    url: "https://moviesapi.club/movie/",
    params: "?multiLang=true",
    icon: <List className="w-3.5 h-3.5" />,
    features: ["Multi-Language", "Fast"],
    description: "A reliable alternative with good subtitle support.",
  },
  {
    name: "videasy",
    url: "https://player.videasy.net/movie/",
    params: "?multiLang=true",
    icon: <Clapperboard className="w-3.5 h-3.5" />,
    features: ["Multi-sub", "Clean UI"],
    description: "Features a clean player with multiple subtitle choices.",
  },
  {
    name: "Vidsrc 2",
    url: "https://vidsrc.net/embed/movie/",
    params: "?multiLang=true",
    icon: <Server className="w-3.5 h-3.5" />,
    features: ["Multi-Language", "Backup"],
    description: "A secondary backup source for language options.",
  },
  {
    name: "VidSrc 3",
    url: "https://vidsrc.icu/embed/movie/",
    params: "?multiLang=true",
    icon: <Languages className="w-3.5 h-3.5" />,
    features: ["Multi-Language", "Backup"],
    description: "Alternative source for subtitles.",
  },
  {
    name: "VidSrc 4",
    url: "https://player.vidsrc.co/embed/movie/",
    params:
      "?autoplay=true&autonext=true&nextbutton=true&poster=true&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&fontcolor=FFFFFF&fontsize=16px&opacity=0.5&font=Poppins",
    icon: <Clapperboard className="w-3.5 h-3.5" />,
    features: [],
    download: true,
    description: "A reliable classic player.",
  },
  {
    name: "2Embed",
    url: "https://2embed.cc/embed/movie/",
    icon: <Film className="w-3.5 h-3.5" />,
    features: ["Ads"],
    params: "?multiLang=true",
    description: "May have more pop-up ads.",
  },
  {
    name: "Binge",
    url: "https://vidbinge.dev/embed/movie/",
    icon: <Zap className="w-3.5 h-3.5" />,
    features: ["Fast"],
    parseUrl: true,
    description: "Quick-loading, lightweight player.",
  },
];

// --- MICRO COMPONENTS ---
const MetaBadge = ({ icon: Icon, value, label, colorClass }) => (
  <div className="flex flex-col bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl backdrop-blur-md">
    <div className={`flex items-center gap-1.5 mb-1 ${colorClass}`}>
      <Icon size={14} />
      <span className="text-[10px] uppercase tracking-widest font-bold opacity-90">
        {label}
      </span>
    </div>
    <span className="text-sm font-black text-white">{value}</span>
  </div>
);

// --- MAIN COMPONENT ---

const MovieInfo = ({ MovieDetail, genreArr, id }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedServer, setSelectedServer] = useState(VIDEO_SOURCES[0]);
  const [defaultServerName, setDefaultServerName] = useState("");
  const [iframeSrc, setIframeSrc] = useState(null);

  const [cast, setCast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAdPopup, setShowAdPopup] = useState(false);

  const lastSavedTime = useRef(0);

  // --- HYDRATION & STORAGE INIT ---
  useEffect(() => {
    setIsMounted(true);
    const dismissed = sessionStorage.getItem("adblockerNoticeDismissed");
    if (dismissed !== "true") setShowAdPopup(true);

    const savedDefault = localStorage.getItem("defaultServerName");
    const savedSession = sessionStorage.getItem("sessionServerName");

    if (savedDefault) setDefaultServerName(savedDefault);

    const initialServerName =
      savedSession || savedDefault || VIDEO_SOURCES[0].name;
    const initialServer =
      VIDEO_SOURCES.find((s) => s.name === initialServerName) ||
      VIDEO_SOURCES[0];
    setSelectedServer(initialServer);
  }, []);

  // --- DATA FETCHING & PROGRESS TRACKING ---
  useEffect(() => {
    const fetchData = async () => {
      const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      try {
        const [c, r, rv] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${key}`,
          ).then((res) => res.json()),
          fetch(
            `https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${key}`,
          ).then((res) => res.json()),
          fetch(
            `https://api.themoviedb.org/3/movie/${id}/reviews?api_key=${key}`,
          ).then((res) => res.json()),
        ]);
        setCast(c.cast?.slice(0, 10) || []);
        setRecommendations(r.results?.slice(0, 12) || []);
        setReviews(rv.results?.slice(0, 5) || []);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();

    if (typeof window !== "undefined") {
      const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(favs.some((i) => i.id === MovieDetail.id));

      const initProgress = () => {
        const progress = JSON.parse(
          localStorage.getItem("mediaProgress") || "{}",
        );
        if (!progress[id]) {
          progress[id] = {
            id,
            type: "movie",
            title: MovieDetail.title,
            poster_path: MovieDetail.poster_path,
            last_updated: Date.now(),
            progress: { watched: 0, duration: MovieDetail.runtime * 60 || 1 },
          };
          localStorage.setItem("mediaProgress", JSON.stringify(progress));
        }
      };
      initProgress();

      const handleMessage = (event) => {
        try {
          let data = event.data;
          if (typeof data === "string") data = JSON.parse(data);

          const isTimeUpdate =
            data.event === "timeupdate" ||
            data.type === "timeupdate" ||
            data.event === "time" ||
            data.type === "time";
          if (
            isTimeUpdate ||
            data.currentTime !== undefined ||
            data?.data?.currentTime !== undefined
          ) {
            const currentTime =
              data.currentTime ??
              data.data?.currentTime ??
              data.time ??
              data.data?.time ??
              data.seconds ??
              0;
            const duration =
              data.duration ??
              data.data?.duration ??
              MovieDetail.runtime * 60 ??
              1;

            if (
              currentTime > 0 &&
              Math.abs(currentTime - lastSavedTime.current) >= 5
            ) {
              const progressDict = JSON.parse(
                localStorage.getItem("mediaProgress") || "{}",
              );
              progressDict[id] = {
                id,
                type: "movie",
                title: MovieDetail.title,
                poster_path: MovieDetail.poster_path,
                backdrop_path: MovieDetail.backdrop_path,
                vote_average: MovieDetail.vote_average,
                overview: MovieDetail.overview,
                last_updated: Date.now(),
                progress: {
                  watched: Number(currentTime),
                  duration: Number(duration),
                },
              };
              localStorage.setItem(
                "mediaProgress",
                JSON.stringify(progressDict),
              );
              lastSavedTime.current = currentTime;
            }
          }
        } catch (err) {}
      };

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }
  }, [id, MovieDetail]);

  useEffect(() => {
    if (!isMounted) return;
    const iframeSrc =
      isMounted && selectedServer?.url && id
        ? `${selectedServer.url}${id}${selectedServer.params ?? ""}`
        : null;
  }, [selectedServer, id, isMounted]);

  // --- HANDLERS ---
  const handleServerChange = (server) => {
    setSelectedServer(server);
    sessionStorage.setItem("sessionServerName", server.name);
  };

  const handleSetDefault = (serverName) => {
    setDefaultServerName(serverName);
    localStorage.setItem("defaultServerName", serverName);
    setToast(`Set ${serverName} as default source`);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleFav = () => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (isFavorite) {
      localStorage.setItem(
        "favorites",
        JSON.stringify(favs.filter((i) => i.id !== id)),
      );
      setToast("Removed from Library");
    } else {
      localStorage.setItem("favorites", JSON.stringify([...favs, MovieDetail]));
      setToast("Added to Library");
    }
    setIsFavorite(!isFavorite);
    setTimeout(() => setToast(null), 3000);
  };

  const share = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast("Link copied to clipboard");
    setTimeout(() => setToast(null), 3000);
  };

  const dismissAd = () => {
    sessionStorage.setItem("adblockerNoticeDismissed", "true");
    setShowAdPopup(false);
  };

  const bgImage = MovieDetail.backdrop_path
    ? `https://image.tmdb.org/t/p/original${MovieDetail.backdrop_path}`
    : `https://image.tmdb.org/t/p/original${MovieDetail.poster_path}`;

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#0a0a0a] text-neutral-100 font-sans flex flex-col pt-16 lg:pt-0 overflow-x-hidden selection:bg-indigo-500/30">
      {/* Cinematic Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent lg:w-1/2" />
        <img
          src={bgImage}
          className="w-full h-full object-cover blur-[100px] opacity-10 scale-110"
          alt="Background"
        />
      </div>

      {/* Main Grid Layout */}
      <div className="relative z-10 flex-1 pt-16 flex flex-col lg:grid lg:grid-cols-12 gap-0 lg:overflow-hidden lg:h-screen">
        {/* === LEFT COLUMN: INFO & CONTROLS === */}
        <div className="order-2 lg:order-1 lg:col-span-4 bg-[#0a0a0a]/40 backdrop-blur-2xl flex flex-col lg:overflow-y-auto custom-scrollbar h-auto lg:h-full lg:border-r border-white/5 pb-12 lg:pb-0 shadow-2xl">
          <div className="p-6 md:p-8 shrink-0">
            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {genreArr?.slice(0, 3).map((g, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-indigo-500/10 text-[10px] font-bold uppercase tracking-widest text-indigo-400"
                >
                  {g.name || g}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-[1.1] text-white mb-6">
              {MovieDetail.title}
            </h1>

            {/* Meta Grid */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <MetaBadge
                icon={Star}
                value={`${MovieDetail.vote_average?.toFixed(1)}`}
                label="Rating"
                colorClass="text-yellow-500"
              />
              <MetaBadge
                icon={Clock}
                value={`${MovieDetail.runtime}m`}
                label="Runtime"
                colorClass="text-blue-400"
              />
              <MetaBadge
                icon={Calendar}
                value={MovieDetail.release_date?.split("-")[0]}
                label="Year"
                colorClass="text-emerald-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={toggleFav}
                className={`h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all shadow-lg ${
                  isFavorite
                    ? "bg-rose-500 text-white shadow-rose-500/20"
                    : "bg-white text-black hover:bg-neutral-200"
                }`}
              >
                <Heart size={16} className={isFavorite ? "fill-current" : ""} />{" "}
                {isFavorite ? "Saved" : "Save"}
              </button>
              <button
                onClick={share}
                className="h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all text-white"
              >
                <Share2 size={16} /> Share
              </button>
            </div>

            {/* --- IMPROVED MATERIAL SOURCE CARD --- */}
            <div className="bg-[#121212] rounded-2xl border border-white/5 shadow-xl overflow-hidden mb-8 flex flex-col">
              {/* 1. Active Source Display (Header) */}
              <div className="p-5 border-b border-white/5 bg-white/[0.02] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />

                <div className="flex items-start justify-between relative z-10 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shrink-0 shadow-inner">
                      {selectedServer.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                          {selectedServer.name}
                        </h3>
                        {selectedServer.name === defaultServerName && (
                          <span className="bg-yellow-500/10 text-yellow-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                            <Star size={8} className="fill-current" /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        {selectedServer.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex gap-1.5 flex-wrap">
                    {selectedServer.features?.map((f, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-[#1a1a1a] text-neutral-300 border border-white/5 rounded-md text-[9px] uppercase font-bold tracking-wider"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  {isMounted && selectedServer.name !== defaultServerName && (
                    <button
                      onClick={() => handleSetDefault(selectedServer.name)}
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg ml-auto border border-indigo-500/20"
                    >
                      <Star size={12} /> Set Default
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Available Sources Grid (Body) */}
              <div className="p-5 bg-[#0a0a0a]/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Server size={12} /> Change Source
                  </span>
                  <span className="text-[10px] font-bold text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                    {VIDEO_SOURCES.length} Options
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                  {VIDEO_SOURCES.map((s) => {
                    const active = selectedServer.name === s.name;
                    const isDefault = s.name === defaultServerName;
                    return (
                      <button
                        key={s.name}
                        onClick={() => handleServerChange(s)}
                        className={`
                          flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 text-left group
                          ${
                            active
                              ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
                              : "bg-[#161616] border-white/5 hover:border-white/10 hover:bg-white/5"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div
                            className={`shrink-0 transition-colors ${active ? "text-indigo-400" : "text-neutral-500 group-hover:text-neutral-400"}`}
                          >
                            {s.icon}
                          </div>
                          <span
                            className={`text-[11px] font-semibold truncate transition-colors ${active ? "text-indigo-100" : "text-neutral-400 group-hover:text-neutral-200"}`}
                          >
                            {s.name}
                          </span>
                        </div>
                        {isDefault && (
                          <Star
                            size={10}
                            className={`shrink-0 ${active ? "text-yellow-500 fill-yellow-500" : "text-neutral-600 fill-neutral-600"}`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* --- TABS --- */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-2xl w-fit mb-6">
              {["overview", "cast", "reviews", "related"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="relative px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors shrink-0"
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/10 rounded-xl z-0"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span
                    className={`relative z-10 ${activeTab === tab ? "text-white" : "text-neutral-500 hover:text-neutral-300"}`}
                  >
                    {tab}
                  </span>
                </button>
              ))}
            </div>

            {/* --- TAB CONTENT --- */}
            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                {/* OVERVIEW */}
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-sm leading-relaxed text-neutral-300 font-medium">
                      {MovieDetail.overview}
                    </p>
                    <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                      <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest">
                        Original Title
                      </span>
                      <span className="text-sm font-bold text-white">
                        {MovieDetail.original_title}
                      </span>
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
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {cast.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors group"
                      >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#121212]">
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
                        <div className="min-w-0 flex-1">
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

                {/* REVIEWS */}
                {activeTab === "reviews" && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {reviews.length > 0 ? (
                      reviews.map((r) => (
                        <div
                          key={r.id}
                          className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-sm relative"
                        >
                          <div className="font-bold text-white mb-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs shadow-lg">
                              {r.author[0].toUpperCase()}
                            </div>
                            {r.author}
                          </div>
                          <p className="text-neutral-300 leading-relaxed text-xs">
                            "{r.content.slice(0, 250)}
                            {r.content.length > 250 ? "..." : ""}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-neutral-500 text-sm flex items-center justify-center h-32 bg-white/[0.02] rounded-2xl border border-white/5">
                        No reviews available yet.
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
                    className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                  >
                    {recommendations.length > 0 ? (
                      recommendations.map((m) => (
                        <a
                          key={m.id}
                          href={`/movie/${m.id}`}
                          className="aspect-[2/3] relative group cursor-pointer overflow-hidden rounded-xl border border-white/5 block bg-[#121212] shadow-lg"
                        >
                          <img
                            src={`https://image.tmdb.org/t/p/w300${m.poster_path || m.backdrop_path}`}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                            alt={m.title}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="text-xs font-bold text-white line-clamp-2 leading-tight">
                              {m.title}
                            </div>
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className="col-span-full text-neutral-500 text-sm flex items-center justify-center h-32 bg-white/[0.02] rounded-2xl border border-white/5">
                        No related movies found.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: PURE PLAYER STAGE === */}
        <div className="order-1 lg:order-2 lg:col-span-8 flex flex-col items-center justify-center relative p-0 lg:p-8 min-h-[35vh] sm:min-h-[50vh] lg:h-full bg-black">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-60 pointer-events-none" />

          {/* Player Container */}
          <div className="w-full h-full lg:max-h-[85%] aspect-video relative lg:rounded-2xl overflow-hidden lg:shadow-[0_0_100px_rgba(0,0,0,1)] lg:border border-white/10 z-10 bg-[#050505] lg:ring-1 ring-white/5 group">
            {isMounted ? (
              <iframe
                src={iframeSrc}
                className="w-full h-full absolute inset-0 z-10 bg-black"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                title="Player"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 text-sm gap-4 absolute inset-0 z-0">
                <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-indigo-500 animate-spin" />
                Initializing Player...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOAST NOTIFICATIONS */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1e1e1e] border border-white/10 text-white px-5 py-3.5 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-3 min-w-[250px] justify-center"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check size={12} />
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
            className="fixed bottom-6 right-6 z-[100] w-[340px] bg-[#1a1a1a] border border-white/10 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
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

export default MovieInfo;
