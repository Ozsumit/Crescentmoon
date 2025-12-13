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
  List,
  Clapperboard,
  Zap,
  Languages,
  Check,
  ShieldAlert,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- CONSTANTS ---
const VIDEO_SOURCES = [
  {
    name: "VidLink",
    url: "https://vidlink.pro/movie/",
    params:
      "?primaryColor=6a5fef&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=jw&title=true&poster=true&autoplay=true&nextbutton=true",
    icon: <Play className="w-4 h-4 text-pink-400" />,
    features: ["Recommended", "Fast"],
    description: "Fast loading with a modern player.",
  },
  {
    name: "VidSrc",
    url: "https://v2.vidsrc.me/embed/movie/",
    params: "?multiLang=true",
    icon: <Languages className="w-4 h-4 text-blue-400" />,
    features: ["Multi-Language"],
    description: "Good source for non-English audio.",
  },
  {
    name: "MoviesAPI",
    url: "https://moviesapi.club/movie/",
    params: "?multiLang=true",
    icon: <List className="w-4 h-4 text-green-400" />,
    features: ["Multi-Language", "Fast"],
    description: "A reliable alternative with good subtitle support.",
  },
  {
    name: "videasy",
    url: "https://player.videasy.net/movie/",
    params: "?multiLang=true",
    icon: <Clapperboard className="w-4 h-4 text-purple-400" />,
    features: ["Multi-sub", "Clean UI"],
    description: "Features a clean player with multiple subtitle choices.",
  },
  {
    name: "Vidsrc 2",
    url: "https://vidsrc.net/embed/movie/",
    params: "?multiLang=true",
    icon: <Server className="w-4 h-4 text-slate-400" />,
    features: ["Multi-Language", "Backup"],
    description: "A secondary backup source for language options.",
  },
  {
    name: "VidSrc 3",
    url: "https://vidsrc.icu/embed/movie/",
    params: "?multiLang=true",
    icon: <Languages className="w-4 h-4 text-blue-400" />,
    features: ["Multi-Language", "Backup"],
    description: "Alternative source for subtitles.",
  },
  {
    name: "VidSrc 4",
    url: "https://player.vidsrc.co/embed/movie/",
    params:
      "?autoplay=true&autonext=true&nextbutton=true&poster=true&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&fontcolor=FFFFFF&fontsize=16px&opacity=0.5&font=Poppins",
    icon: <Clapperboard className="w-4 h-4 text-slate-400" />,
    features: [],
    download: true,
    description: "A reliable classic player.",
  },
  {
    name: "2Embed",
    url: "https://2embed.cc/embed/movie/",
    icon: <Film className="w-4 h-4 text-teal-400" />,
    features: ["Ads"],
    description: "May have more pop-up ads.",
  },
  {
    name: "Binge",
    url: "https://vidbinge.dev/embed/movie/",
    icon: <Zap className="w-4 h-4 text-yellow-400" />,
    features: ["Fast"],
    parseUrl: true,
    description: "Quick-loading, lightweight player.",
  },
];

// --- MICRO COMPONENTS ---

const MaterialChip = ({ children, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`
      relative px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide transition-all duration-300 flex items-center gap-2 overflow-hidden shrink-0
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

const MovieInfo = ({ MovieDetail, genreArr, id }) => {
  const [selectedServer, setSelectedServer] = useState(VIDEO_SOURCES[0]);
  const [iframeSrc, setIframeSrc] = useState("");
  const [cast, setCast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAdPopup, setShowAdPopup] = useState(false);

  // --- DATA FETCHING ---
  useEffect(() => {
    // Adblock check
    const dismissed = sessionStorage.getItem("adblockerNoticeDismissed");
    if (dismissed !== "true") setShowAdPopup(true);

    const fetchData = async () => {
      const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      try {
        const [c, r, rv] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${key}`
          ).then((res) => res.json()),
          fetch(
            `https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${key}`
          ).then((res) => res.json()),
          fetch(
            `https://api.themoviedb.org/3/movie/${id}/reviews?api_key=${key}`
          ).then((res) => res.json()),
        ]);
        setCast(c.cast?.slice(0, 10) || []);
        setRecommendations(r.results?.slice(0, 8) || []); // slightly more recs
        setReviews(rv.results?.slice(0, 5) || []);
      } catch (e) {
        console.error(e);
      }
    };

    if (typeof window !== "undefined") {
      const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(favs.some((i) => i.id === MovieDetail.id));

      const progress = JSON.parse(
        localStorage.getItem("mediaProgress") || "{}"
      );
      if (!progress[id]) {
        progress[id] = {
          id,
          type: "movie",
          title: MovieDetail.title,
          poster_path: MovieDetail.poster_path,
          last_updated: Date.now(),
          progress: { watched: 0, duration: MovieDetail.runtime || 1 },
        };
        localStorage.setItem("mediaProgress", JSON.stringify(progress));
      }
    }

    fetchData();
  }, [id, MovieDetail]);

  useEffect(() => {
    setIframeSrc(`${selectedServer.url}${id}${selectedServer.params}`);
  }, [selectedServer, id]);

  // --- HANDLERS ---
  const toggleFav = () => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (isFavorite) {
      localStorage.setItem(
        "favorites",
        JSON.stringify(favs.filter((i) => i.id !== id))
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
    setToast("Link copied");
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
    <div className="min-h-screen lg:h-screen w-full bg-[#050505] text-white font-sans flex flex-col pt-16 lg:pt-0 overflow-x-hidden">
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

      {/* Main Layout */}
      <div className="relative z-10 flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-0 lg:divide-x divide-white/5 border-t border-white/5 lg:overflow-hidden lg:h-screen">
        {/* === LEFT COLUMN: INFO & METADATA === */}
        <div className="order-2 lg:order-1 lg:col-span-4 bg-[#050505]/60 backdrop-blur-xl flex flex-col lg:overflow-y-auto custom-scrollbar h-auto lg:h-full pb-20 lg:pb-0 lg:pt-16">
          {/* Header */}
          <div className="p-5 md:p-6 pb-0 shrink-0">
            <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
              {genreArr?.slice(0, 3).map((g, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-[#d0bcff]"
                >
                  {g.name || g}
                </span>
              ))}
            </div>

            {/* Compact Title */}
            <h1 className="text-3xl lg:text-4xl font-black tracking-tighter leading-none text-white uppercase break-words mb-4 drop-shadow-lg">
              {MovieDetail.title}
            </h1>

            {/* Metadata Pills */}
            <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
              <MetaBadge
                icon={Star}
                value={`${MovieDetail.vote_average?.toFixed(1)}`}
                color="text-yellow-400"
              />
              <MetaBadge
                icon={Clock}
                value={`${MovieDetail.runtime}m`}
                color="text-blue-400"
              />
              <MetaBadge
                icon={Calendar}
                value={MovieDetail.release_date?.split("-")[0]}
                color="text-green-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 md:px-6 grid grid-cols-2 gap-3 mb-6 shrink-0">
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
              onClick={share}
              className="h-10 rounded-[0.8rem] bg-[#252525] flex items-center justify-center gap-2 font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#e6e1e5] hover:text-[#1c1b1f] transition-all"
            >
              <Share2 size={16} /> Share
            </button>
          </div>

          {/* Tabs & Content */}
          <div className="flex-1 border-t border-white/5 flex flex-col min-h-[300px]">
            <div className="flex px-6 pt-4 gap-2 overflow-x-auto scrollbar-hide shrink-0">
              {["overview", "cast", "reviews"].map((tab) => (
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

            <div className="p-6 flex-1 lg:overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-xs md:text-sm leading-relaxed font-medium text-neutral-300">
                      {MovieDetail.overview}
                    </p>
                    <div className="mt-6 p-4 rounded-xl bg-[#111] border border-white/5">
                      <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest block mb-1">
                        Original Title
                      </span>
                      <span className="text-xs font-bold text-white">
                        {MovieDetail.original_title}
                      </span>
                    </div>
                  </motion.div>
                )}

                {activeTab === "cast" && (
                  <motion.div
                    key="cast"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {cast.map((c) => (
                      <div key={c.id} className="flex items-center gap-4 group">
                        <img
                          src={
                            c.profile_path
                              ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
                              : "https://via.placeholder.com/50"
                          }
                          className="w-10 h-10 rounded-full object-cover bg-neutral-800"
                          alt={c.name}
                        />
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-[#d0bcff] transition-colors">
                            {c.name}
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            {c.character}
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === "reviews" && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {reviews.length > 0 ? (
                      reviews.map((r) => (
                        <div
                          key={r.id}
                          className="p-3 rounded-xl bg-[#1a1a1a] border border-white/5 text-xs"
                        >
                          <div className="font-bold text-white mb-2 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 text-[10px]">
                              {r.author[0].toUpperCase()}
                            </div>
                            {r.author}
                          </div>
                          <p className="text-neutral-400 italic leading-relaxed text-[11px]">
                            "{r.content.slice(0, 150)}..."
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-neutral-500 italic text-xs">
                        No reviews yet.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: PLAYER & SUGGESTIONS === */}
        <div className="order-1 lg:order-2 lg:col-span-8 flex flex-col h-auto lg:h-full bg-black/40 backdrop-blur-md relative lg:pt-16">
          {/* 1. TOP BAR: Compact Source Selector (h-14) */}
          <div className="h-14 flex items-center px-4 md:px-6 border-b border-white/5 gap-4 overflow-x-auto scrollbar-hide shrink-0 bg-[#050505]/40">
            <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest shrink-0 hidden md:block">
              Source
            </span>
            <div className="flex gap-2 pr-4">
              {VIDEO_SOURCES.map((s) => (
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

          {/* 2. PLAYER STAGE: Minimized Padding (p-4) */}
          <div className="flex-1 flex items-center justify-center p-4 lg:p-6 bg-[#0a0a0a] relative group min-h-[250px] lg:min-h-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-blue-500/5 opacity-50 pointer-events-none" />

            <div className="w-full h-full max-w-6xl aspect-video relative rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 z-10 bg-black">
              <iframe
                src={iframeSrc}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                title="Player"
              />
            </div>
          </div>

          {/* 3. RECOMMENDATIONS: Compact Strip (h-36) */}
          <div className="h-auto py-6 lg:py-0 lg:h-36 border-t border-white/5 bg-[#050505]/80 backdrop-blur-lg flex flex-col justify-center px-4 md:px-6 shrink-0">
            <div className="flex items-center justify-between mb-2 lg:hidden">
              <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest flex items-center gap-2">
                <Film size={12} /> Related Content
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto items-center scrollbar-hide pb-2 lg:pb-0 h-full">
              <div className="hidden lg:flex flex-col justify-center mr-4 w-24 shrink-0">
                <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest mb-1">
                  Up Next
                </span>
                <span className="text-xs font-bold leading-tight">
                  Similar Movies
                </span>
              </div>

              {recommendations.map((m) => (
                <a
                  key={m.id}
                  href={`/movie/${m.id}`}
                  className="w-36 md:w-44 shrink-0 aspect-video relative group cursor-pointer overflow-hidden rounded-lg border border-white/10 block"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w300${
                      m.backdrop_path || m.poster_path
                    }`}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    alt={m.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="text-[10px] font-bold truncate text-white translate-y-4 group-hover:translate-y-0 transition-transform">
                      {m.title}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TOAST & POPUP */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-4 z-50 bg-[#cce5ff] text-[#001d35] px-4 py-2 rounded-lg shadow-xl font-bold text-xs flex items-center gap-2"
          >
            <Check size={14} /> {toast}
          </motion.div>
        )}

        {showAdPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-[100] w-72 bg-[#1a1a1a] border border-white/10 p-3 rounded-xl shadow-2xl"
          >
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="text-yellow-500" size={16} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white text-xs">
                  Adblock Advised
                </h4>
                <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                  Video sources often have popups. Use{" "}
                  <span className="text-indigo-400">uBlock Origin</span> for the
                  best experience.
                </p>
              </div>
              <button
                onClick={dismissAd}
                className="text-neutral-500 hover:text-white"
              >
                <X size={14} />
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

export default MovieInfo;
