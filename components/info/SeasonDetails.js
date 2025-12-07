"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Film,
  Star,
  LayoutGrid,
  LayoutList,
  ChevronDown,
  ChevronUp,
  Heart,
  Share2,
  MessageCircle,
  ArrowLeft,
  Tv,
} from "lucide-react";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Import your existing display components
import EpisodeListCard from "./EpisodeListCard";
import EpisodeDisplay from "../display/EpisodeDisplay";

// --- SUB-COMPONENTS ---

const CastMember = ({ cast }) => (
  <div className="flex flex-col gap-3 group">
    <div className="w-full aspect-[2/3] overflow-hidden rounded-2xl bg-neutral-900 border border-white/5 relative">
      <img
        src={
          cast.profile_path
            ? `https://image.tmdb.org/t/p/w200${cast.profile_path}`
            : "https://via.placeholder.com/200x300?text=No+Image"
        }
        alt={cast.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
    <div>
      <p className="text-sm font-bold text-white leading-tight">{cast.name}</p>
      <p className="text-xs text-neutral-500 font-mono mt-1">
        {cast.character}
      </p>
    </div>
  </div>
);

const Review = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const isLongContent = review.content.length > 300;
  const displayContent = expanded
    ? review.content
    : review.content.slice(0, 300);

  return (
    <div className="bg-[#0A0A0A] rounded-[1.5rem] p-6 border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-start gap-4">
        <Avatar className="w-10 h-10 border border-white/10">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.author}`}
          />
          <AvatarFallback className="bg-neutral-800 text-white">
            {review.author.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-white">{review.author}</h3>
            {review.author_details?.rating && (
              <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                <Star className="w-3 h-3 text-white" fill="currentColor" />
                <span className="text-xs font-mono text-white">
                  {review.author_details?.rating}/10
                </span>
              </div>
            )}
          </div>
          <div className="text-neutral-400 text-sm leading-relaxed font-light">
            <p>
              {displayContent}
              {isLongContent && !expanded && "..."}
            </p>
            {isLongContent && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-3 text-white hover:underline text-xs font-mono uppercase tracking-wider flex items-center gap-1"
              >
                {expanded ? "Show Less" : "Read More"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const SeasonInfo = (props) => {
  let { SeasonInfos, seriesId } = props;
  let episodes = SeasonInfos.episodes || [];

  const [isFavorite, setIsFavorite] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [viewType, setViewType] = useState("grid");
  const [castInfo, setCastInfo] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("episodes");

  const posterPath = SeasonInfos.poster_path
    ? `https://image.tmdb.org/t/p/w500/${SeasonInfos.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  const backdropPath = SeasonInfos.poster_path
    ? `https://image.tmdb.org/t/p/original${SeasonInfos.poster_path}`
    : posterPath;

  const showNotification = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleFavoriteToggle = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (isFavorite) {
      const updatedFavorites = favorites.filter(
        (item) => item.id !== SeasonInfos.id
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      showNotification("Removed from Library");
    } else {
      if (!favorites.some((item) => item.id === SeasonInfos.id)) {
        favorites.push(SeasonInfos);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        showNotification("Added to Library");
      }
    }
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showNotification("Link copied to clipboard");
    } catch (err) {
      showNotification("Failed to copy link");
    }
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.some((item) => item.id === SeasonInfos.id));

    const savedViewType = localStorage.getItem("viewType");
    if (savedViewType) setViewType(savedViewType);

    const fetchData = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        const [castRes, revRes] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/tv/${seriesId}/season/${SeasonInfos.season_number}/credits?api_key=${apiKey}`
          ),
          fetch(
            `https://api.themoviedb.org/3/tv/${seriesId}/reviews?api_key=${apiKey}`
          ),
        ]);

        const castData = await castRes.json();
        const revData = await revRes.json();

        setCastInfo(castData.cast?.slice(0, 10) || []);
        setReviews(revData.results || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [SeasonInfos.id, seriesId, SeasonInfos.season_number]);

  useEffect(() => {
    localStorage.setItem("viewType", viewType);
  }, [viewType]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden selection:bg-white/20 selection:text-white">
        {/* --- BACKDROP & NOISE --- */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        </div>

        <div className="absolute top-0 left-0 right-0 h-[80vh] z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/80 to-black z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 z-10" />
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ duration: 1.5 }}
            src={backdropPath}
            className="w-full h-full object-cover blur-sm"
          />
        </div>

        {/* --- MAIN CONTAINER --- */}
        <div className="relative z-10 max-w-[2000px] mx-auto px-4 md:px-8 lg:px-12 pt-6 md:pt-12">
          {/* Nav */}
          <div className="flex justify-between items-center mb-12">
            <Link
              href={`/series/${seriesId}`}
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group"
            >
              <div className="p-2 rounded-full border border-white/10 bg-black/50 group-hover:bg-white group-hover:text-black transition-all">
                <ArrowLeft size={20} />
              </div>
              <span className="font-mono text-xs uppercase tracking-widest hidden sm:block">
                Back to Series
              </span>
            </Link>
          </div>

          {/* --- CONTENT SURFACE --- */}
          <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] p-6 md:p-12 shadow-2xl relative overflow-hidden min-h-[800px]">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-[350px_1fr] xl:grid-cols-[400px_1fr] gap-12 items-start">
              {/* LEFT COLUMN: POSTER & ACTIONS */}
              <div className="space-y-8 sticky top-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative group"
                >
                  <img
                    src={posterPath}
                    alt={SeasonInfos.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleFavoriteToggle}
                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all duration-300 ${
                      isFavorite
                        ? "bg-white text-black border-white hover:bg-neutral-200"
                        : "bg-transparent text-white border-white/10 hover:border-white/30 hover:bg-white/5"
                    }`}
                  >
                    <Heart
                      size={18}
                      fill={isFavorite ? "currentColor" : "none"}
                    />
                    <span className="font-bold text-sm tracking-wide">
                      {isFavorite ? "SAVED" : "LIBRARY"}
                    </span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 bg-transparent text-white hover:bg-white/5 hover:border-white/30 transition-all"
                  >
                    <Share2 size={18} />
                    <span className="font-bold text-sm tracking-wide">
                      SHARE
                    </span>
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4 p-6 rounded-[2rem] bg-[#0A0A0A] border border-white/5">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-neutral-500 font-mono text-xs uppercase">
                      Rating
                    </span>
                    <div className="flex items-center gap-2">
                      <Star
                        className="text-white w-4 h-4"
                        fill="currentColor"
                      />
                      <span className="text-white font-bold">
                        {SeasonInfos.vote_average?.toFixed(1) || "N/A"}/10
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-neutral-500 font-mono text-xs uppercase">
                      Year
                    </span>
                    <span className="text-white font-bold">
                      {SeasonInfos.air_date
                        ? SeasonInfos.air_date.substr(0, 4)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 font-mono text-xs uppercase">
                      Episodes
                    </span>
                    <span className="text-white font-bold">
                      {episodes.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: DETAILS & TABS */}
              <div className="space-y-10">
                {/* Header Info */}
                <div className="space-y-6">
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9]">
                    {SeasonInfos.name}
                  </h1>

                  <p className="text-lg text-neutral-300 leading-relaxed font-light max-w-3xl">
                    {SeasonInfos.overview ||
                      "No overview available for this season."}
                  </p>
                </div>

                {/* Tabs Navigation */}
                <Tabs
                  defaultValue="episodes"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="border-b border-white/10 pb-1 mb-8">
                    <TabsList className="bg-transparent p-0 flex gap-8 w-auto justify-start h-auto">
                      {["episodes", "cast", "reviews"].map((tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          className="
                                                relative px-0 py-4 bg-transparent 
                                                text-lg md:text-xl font-medium tracking-tight transition-colors
                                                text-neutral-500 hover:text-neutral-300
                                                data-[state=active]:text-white
                                                data-[state=active]:bg-transparent 
                                                data-[state=active]:shadow-none 
                                            "
                        >
                          <span className="capitalize">{tab}</span>
                          {activeTab === tab && (
                            <motion.div
                              layoutId="seasonTabIndicator"
                              className="absolute bottom-[-5px] left-0 right-0 h-[2px] bg-white"
                            />
                          )}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  {/* EPISODES TAB */}
                  <TabsContent
                    value="episodes"
                    className="mt-0 focus-visible:outline-none"
                  >
                    <div className="flex justify-end mb-6">
                      <div className="bg-[#0A0A0A] p-1 rounded-lg border border-white/10 flex gap-1">
                        <button
                          onClick={() => setViewType("grid")}
                          className={`p-2 rounded-md transition-all ${
                            viewType === "grid"
                              ? "bg-white/10 text-white"
                              : "text-neutral-500"
                          }`}
                        >
                          <LayoutGrid size={16} />
                        </button>
                        <button
                          onClick={() => setViewType("list")}
                          className={`p-2 rounded-md transition-all ${
                            viewType === "list"
                              ? "bg-white/10 text-white"
                              : "text-neutral-500"
                          }`}
                        >
                          <LayoutList size={16} />
                        </button>
                      </div>
                    </div>

                    <motion.div
                      key={viewType}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {viewType === "list" ? (
                        <div className="grid gap-4">
                          {episodes.map((episode) => (
                            /* 
                                                  Note: Assuming EpisodeListCard accepts style overrides or is already styled. 
                                                  If not, you might need to wrap it in a div with specific text colors 
                                                  or update the child component similarly.
                                                */
                            <EpisodeListCard
                              key={episode.id}
                              episode={episode}
                              seriesId={seriesId}
                              seasonNumber={SeasonInfos.season_number}
                            />
                          ))}
                        </div>
                      ) : (
                        /* Assuming EpisodeDisplay is a grid/card container */
                        <EpisodeDisplay
                          EpisodeInfos={episodes}
                          seriesId={seriesId}
                        />
                      )}
                    </motion.div>
                  </TabsContent>

                  {/* CAST TAB */}
                  <TabsContent
                    value="cast"
                    className="mt-0 focus-visible:outline-none"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {castInfo.map((cast) => (
                        <CastMember key={cast.id} cast={cast} />
                      ))}
                    </div>
                  </TabsContent>

                  {/* REVIEWS TAB */}
                  <TabsContent
                    value="reviews"
                    className="mt-0 focus-visible:outline-none"
                  >
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <Review key={review.id} review={review} />
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center border border-white/5 rounded-[2rem] bg-white/5">
                        <MessageCircle className="mx-auto h-12 w-12 text-neutral-700 mb-4" />
                        <p className="text-neutral-500 font-mono uppercase">
                          No Reviews Yet
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>

        {/* NOTIFICATION TOAST */}
        <AnimatePresence>
          {showAlert && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 right-8 z-50 bg-white text-black px-6 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
              {alertMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default SeasonInfo;
