"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  Film,
  Star,
  LayoutGrid,
  LayoutList,
  ChevronDown,
  ChevronUp,
  Heart,
  Info,
  Share2,
  Users,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import EpisodeListCard from "./EpisodeListCard";
import EpisodeDisplay from "../display/EpisodeDisplay";

const CastMember = ({ cast }) => (
  <div className="flex items-center space-x-3">
    <img
      src={
        cast.profile_path
          ? `https://image.tmdb.org/t/p/w200${cast.profile_path}`
          : "https://via.placeholder.com/200x300?text=No+Image"
      }
      alt={cast.name}
      className="w-12 h-12 rounded-full object-cover"
    />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-200 truncate">{cast.name}</p>
      <p className="text-xs text-slate-400 truncate">{cast.character}</p>
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
    <div className="bg-slate-900/50 rounded-lg p-6 shadow-lg mb-4 border border-slate-800/50 hover:border-slate-700/50 transition-colors">
      <div className="flex items-start space-x-4">
        <Avatar className="w-10 h-10">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.author}`}
          />
          <AvatarFallback>
            {review.author.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-slate-200">
              {review.author}
            </h3>
            <div className="flex items-center space-x-2 text-slate-400">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">
                {review.author_details?.rating || "N/A"}/10
              </span>
            </div>
          </div>
          <div className="mt-2 text-slate-300 text-sm leading-relaxed">
            <p>
              {displayContent}
              {isLongContent && !expanded && "..."}
            </p>
            {isLongContent && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
              >
                {expanded ? "Show Less" : "Read More"}
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
          <div className="mt-2 text-slate-400 text-sm">
            {new Date(review.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const SeasonInfo = (props) => {
  let { SeasonInfos, seriesId } = props;
  let episodes = SeasonInfos.episodes || [];
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [viewType, setViewType] = useState("grid");
  const [castInfo, setCastInfo] = useState([]);
  const [isLoadingCast, setIsLoadingCast] = useState(false);
  const [showMoreCast, setShowMoreCast] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const posterPath = SeasonInfos.poster_path
    ? `https://image.tmdb.org/t/p/w500/${SeasonInfos.poster_path}`
    : "https://i.imgur.com/a5SqB4h.jpeg";

  const airYear = SeasonInfos.air_date
    ? SeasonInfos.air_date.substr(0, 4)
    : "N/A";

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
      showNotification("Removed from favorites");
    } else {
      if (!favorites.some((item) => item.id === SeasonInfos.id)) {
        favorites.push(SeasonInfos);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        showNotification("Added to favorites");
      }
    }
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showNotification("Link copied to clipboard!");
    } catch (err) {
      showNotification("Failed to copy link");
    }
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.some((item) => item.id === SeasonInfos.id));

    const savedViewType = localStorage.getItem("viewType");
    if (savedViewType) {
      setViewType(savedViewType);
    }

    const fetchData = async () => {
      setIsLoadingCast(true);
      setIsLoadingReviews(true);
      try {
        const [castResponse, reviewsResponse] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/tv/${seriesId}/season/${SeasonInfos.season_number}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
          ),
          fetch(
            `https://api.themoviedb.org/3/tv/${seriesId}/reviews?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
          ),
        ]);

        const castData = await castResponse.json();
        const reviewsData = await reviewsResponse.json();

        setCastInfo(castData.cast?.slice(0, 10) || []);
        setReviews(reviewsData.results || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        showNotification("Failed to load some content");
      } finally {
        setIsLoadingCast(false);
        setIsLoadingReviews(false);
      }
    };

    fetchData();
  }, [SeasonInfos.id, seriesId, SeasonInfos.season_number]);

  useEffect(() => {
    localStorage.setItem("viewType", viewType);
  }, [viewType]);

  return (
    <TooltipProvider>
      <div className="min-h-screen pt-16 md:pt-20 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 to-slate-950/70" />
            <img
              src={posterPath}
              alt="background"
              className="w-full h-full object-cover object-center opacity-30"
            />
          </div>

          <div className="max-w-8xl mx-auto px-3 py-4 lg:px-8 lg:py-6">
            <div className="grid lg:grid-cols-[2fr_1fr] gap-4 lg:gap-6">
              <div className="order-1 lg:order-1">
                <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-slate-800/50">
                  <div className="p-4 border-b border-slate-800/50 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                      <Film className="w-5 h-5 text-indigo-400" />
                      {SeasonInfos.name} Episodes
                    </h2>
                    <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setViewType("list")}
                            className={`p-1.5 rounded-md transition-colors ${
                              viewType === "list"
                                ? "bg-indigo-500/20 text-indigo-400"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <LayoutList className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>List view</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setViewType("grid")}
                            className={`p-1.5 rounded-md transition-colors ${
                              viewType === "grid"
                                ? "bg-indigo-500/20 text-indigo-400"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <LayoutGrid className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Grid view</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="p-4 max-h-[600px] overflow-y-auto space-y-4">
                    {viewType === "list" ? (
                      episodes.map((episode) => (
                        <EpisodeListCard
                          key={episode.id}
                          episode={episode}
                          seriesId={seriesId}
                          seasonNumber={SeasonInfos.season_number}
                        />
                      ))
                    ) : (
                      <EpisodeDisplay
                        EpisodeInfos={episodes}
                        seriesId={seriesId}
                      />
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-slate-800/50 mt-4">
                  <div className="p-4 border-b border-slate-800/50">
                    <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-indigo-400" />
                      Reviews
                      {reviews.length > 0 && (
                        <span className="text-sm text-slate-400">
                          ({reviews.length})
                        </span>
                      )}
                    </h2>
                  </div>
                  <div className="p-4 max-h-[600px] overflow-y-auto">
                    {isLoadingReviews ? (
                      Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className="animate-pulse bg-slate-800/50 rounded-lg p-6 mb-4"
                          >
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-slate-700 rounded-full" />
                              <div className="flex-1 space-y-3">
                                <div className="h-4 bg-slate-700 rounded w-1/4" />
                                <div className="space-y-2">
                                  <div className="h-3 bg-slate-700 rounded w-full" />
                                  <div className="h-3 bg-slate-700 rounded w-full" />
                                  <div className="h-3 bg-slate-700 rounded w-3/4" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : reviews.length > 0 ? (
                      reviews.map((review) => (
                        <Review key={review.id} review={review} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No reviews yet</p>
                        <p className="text-sm">
                          Be the first to review this season!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="order-2 lg:order-2 space-y-4">
                <div className="rounded-xl overflow-hidden shadow-xl border border-slate-800/50">
                  <img
                    src={posterPath}
                    alt={SeasonInfos.name}
                    className="w-full"
                  />
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-slate-800/50 space-y-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">
                      {SeasonInfos.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        {/* <Star className */}
                        <Star className="text-yellow-400 w-4 h-4" />
                        <span>
                          {SeasonInfos.vote_average?.toFixed(1) || "N/A"}/10
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="text-indigo-400 w-4 h-4" />
                        <span>{airYear}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Film className="text-pink-400 w-4 h-4" />
                        <span>{episodes.length} Episodes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2
                          className="text-emerald-400 w-4 h-4 cursor-pointer"
                          onClick={handleShare}
                        />
                      </div>
                    </div>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleFavoriteToggle}
                        className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg transition-all ${
                          isFavorite
                            ? "bg-red-500/20 text-red-700 hover:bg-red-700/30"
                            : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 mr-2 transition-transform ${
                            isFavorite ? "fill-current scale-110" : "scale-100"
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {isFavorite
                            ? "Remove from Favorites"
                            : "Add to Favorites"}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"}
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    {SeasonInfos.overview || "No overview available."}
                  </p>

                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      Cast
                    </h2>
                    <div className="space-y-3">
                      {isLoadingCast ? (
                        Array(3)
                          .fill(0)
                          .map((_, i) => (
                            <div
                              key={i}
                              className="animate-pulse flex items-center space-x-3"
                            >
                              <div className="w-12 h-12 bg-slate-800 rounded-full" />
                              <div className="flex-1">
                                <div className="h-4 bg-slate-800 rounded w-24" />
                                <div className="h-3 bg-slate-800 rounded w-20 mt-1" />
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="space-y-3">
                          {castInfo
                            .slice(0, showMoreCast ? undefined : 4)
                            .map((cast) => (
                              <CastMember key={cast.id} cast={cast} />
                            ))}
                          {castInfo.length > 4 && (
                            <button
                              onClick={() => setShowMoreCast(!showMoreCast)}
                              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                            >
                              {showMoreCast ? "Show Less" : "Show More"}
                              {showMoreCast ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-4 right-4 z-50">
          <Alert
            className={`transition-opacity duration-300 ${
              showAlert ? "opacity-100" : "opacity-0 pointer-events-none"
            } bg-slate-900/95 backdrop-blur-sm border-slate-700`}
          >
            <AlertDescription className="text-slate-200 flex items-center gap-2">
              <Info className="w-4 h-4" />
              {alertMessage}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SeasonInfo;
