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
  CalendarDays,
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
import HomeCards from "@/components/display/HomeCard";
import Link from "next/link";

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

const SeasonCard = ({ season, viewType, seriesId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (viewType === "grid") {
    return (
      <Link href={`/series/${seriesId}/season/${season.season_number}`}>
        <Card className="flex flex-col h-full bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600/50 transition-all duration-300">
          <div className="relative w-full">
            <div className="relative aspect-[16/9] rounded-t-lg overflow-hidden">
              <img
                src={
                  season.poster_path
                    ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
                    : "/api/placeholder/500/750"
                }
                alt={season.name}
                className="w-full h-full object-cover"
              />
              {season.vote_average > 0 && (
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-md">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-slate-100">
                    {season.vote_average.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col flex-grow p-4 space-y-3">
            <h3 className="text-lg font-semibold text-slate-100 line-clamp-1">
              {season.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-700/30 px-2 py-1 rounded-md">
                <Film className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-slate-300">
                  {season.episode_count} Episodes
                </span>
              </div>
              {season.air_date && (
                <div className="flex items-center gap-1.5 bg-slate-700/30 px-2 py-1 rounded-md">
                  <Calendar className="w-4 h-4 text-pink-400" />
                  <span className="text-sm text-slate-300">
                    {new Date(season.air_date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-auto space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Episode Progress</span>
                <span className="text-slate-300">
                  {Math.round((season.episode_count / 24) * 100)}%
                </span>
              </div>
              <div className="relative h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"
                  style={{ width: `${(season.episode_count / 24) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }
  return (
    <Link href={`/series/${seriesId}/season/${season.season_number}`}>
      <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-colors">
        <CardHeader className="flex flex-row items-start space-x-4 p-4">
          <div className="relative flex-shrink-0 w-24 group">
            <img
              src={
                season.poster_path
                  ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
                  : "https://via.placeholder.com/500x750?text=No+Image"
              }
              alt={season.name}
              className="w-full aspect-[2/3] object-cover rounded-md"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base text-slate-100">
                {season.name}
              </CardTitle>
              {season.vote_average > 0 && (
                <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-md">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-slate-200">
                    {season.vote_average.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-md">
                <Film className="w-3 h-3 text-slate-300" />
                <span className="text-xs text-slate-300">
                  {season.episode_count} Episodes
                </span>
              </div>
              {season.air_date && (
                <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-md">
                  <Calendar className="w-3 h-3 text-slate-300" />
                  <span className="text-xs text-slate-300">
                    {new Date(season.air_date).getFullYear()}
                  </span>
                </div>
              )}
            </div>
            {season.overview && (
              <div className="space-y-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Info className="w-3 h-3" />
                  {isExpanded ? "Hide Overview" : "Show Overview"}
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
                {isExpanded && (
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                    {season.overview}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
};

const SeasonsDisplay = ({ seasons, seriesId }) => {
  const [viewType, setViewType] = useState("list");

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-slate-800/50">
        <div className="p-4 border-b border-slate-800/50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Film className="w-5 h-5 text-indigo-400" />
            Seasons
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
        <div
          className={`p-4 max-h-[600px] overflow-y-auto ${
            viewType === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4"
              : "space-y-4"
          }`}
        >
          {seasons?.map((season) => (
            <SeasonCard
              key={season.id}
              season={season}
              viewType={viewType}
              seriesId={seriesId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const TvInfo = ({ TvDetail, genreArr, id }) => {
  const [castInfo, setCastInfo] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoadingCast, setIsLoadingCast] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showMoreCast, setShowMoreCast] = useState(false);

  const posterPath = TvDetail.poster_path
    ? `https://image.tmdb.org/t/p/w500${TvDetail.poster_path}`
    : "https://via.placeholder.com/500x750.png?text=TV+Show+Poster";

  const backgroundPath = TvDetail.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${TvDetail.backdrop_path}`
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
        (item) => item.id !== TvDetail.id
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      showNotification("Removed from favorites");
    } else {
      if (!favorites.some((item) => item.id === TvDetail.id)) {
        favorites.push(TvDetail);
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
    setIsFavorite(favorites.some((item) => item.id === TvDetail.id));

    const fetchData = async () => {
      setIsLoadingCast(true);
      setIsLoadingRecommendations(true);
      setIsLoadingReviews(true);
      try {
        const [castResponse, recommendationsResponse, reviewsResponse] =
          await Promise.all([
            fetch(
              `https://api.themoviedb.org/3/tv/${id}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
            ),
            fetch(
              `https://api.themoviedb.org/3/tv/${id}/recommendations?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
            ),
            fetch(
              `https://api.themoviedb.org/3/tv/${id}/reviews?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
            ),
          ]);

        const castData = await castResponse.json();
        const recommendationsData = await recommendationsResponse.json();
        const reviewsData = await reviewsResponse.json();

        setCastInfo(castData.cast.slice(0, 10));
        setRecommendations(recommendationsData.results.slice(0, 6));
        setReviews(reviewsData.results.slice(0, 5));
      } catch (error) {
        showNotification("Failed to load some content");
      } finally {
        setIsLoadingCast(false);
        setIsLoadingRecommendations(false);
        setIsLoadingReviews(false);
      }
    };

    fetchData();
  }, [TvDetail.id, id]);

  return (
    <TooltipProvider>
      <div className="min-h-screen pt-16 md:pt-20 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 to-slate-950/70" />
            <img
              src={backgroundPath}
              alt="background"
              className="w-full h-full object-cover object-center opacity-30"
            />
          </div>

          <div className="max-w-8xl mx-auto px-3 py-4 lg:px-8 lg:py-6">
            <div className="grid lg:grid-cols-[2fr_1fr] gap-4 lg:gap-6">
              <div className="order-2 lg:order-1 space-y-4">
                <SeasonsDisplay
                  seasons={TvDetail.seasons}
                  seriesId={TvDetail.id}
                />

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

                <div className="hidden lg:block space-y-4 mt-6">
                  <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                    <Film className="w-5 h-5 text-indigo-400" />
                    Similar Shows
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {isLoadingRecommendations
                      ? Array(6)
                          .fill(0)
                          .map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="aspect-[2/3] bg-slate-800 rounded-lg" />
                              <div className="h-4 bg-slate-800 rounded mt-2" />
                            </div>
                          ))
                      : recommendations.map((show) => (
                          <HomeCards
                            key={`${show.media_type}-${show.id}`}
                            MovieCard={show}
                            className="aspect-[2/3]"
                          />
                        ))}
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2 space-y-4">
                <div className="rounded-xl overflow-hidden shadow-xl border border-slate-800/50">
                  <img
                    src={posterPath}
                    alt={TvDetail.name}
                    className="w-full"
                  />
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-slate-800/50 space-y-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">
                      {TvDetail.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Star className="text-yellow-400 w-4 h-4" />
                        <span>
                          {TvDetail.vote_average?.toFixed(1) || "N/A"}/10
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="text-indigo-400 w-4 h-4" />
                        <span>{TvDetail.number_of_seasons} Seasons</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarDays className="text-pink-400 w-4 h-4" />
                        <span>
                          {TvDetail.first_air_date
                            ? new Date(TvDetail.first_air_date).getFullYear()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2
                          className="text-emerald-400 w-4 h-4 cursor-pointer"
                          onClick={handleShare}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {genreArr?.map((genre, index) => (
                      <span
                        key={index}
                        className="bg-indigo-900/40 text-indigo-200 px-2.5 py-1 rounded-full text-xs"
                      >
                        {genre.name || genre}
                      </span>
                    ))}
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
                    {TvDetail.overview}
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

              <div className="order-3 lg:hidden space-y-4">
                <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                  <Film className="w-5 h-5 text-indigo-400" />
                  Similar Shows
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {isLoadingRecommendations
                    ? Array(6)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="aspect-[2/3] bg-slate-800 rounded-lg" />
                            <div className="h-4 bg-slate-800 rounded mt-2" />
                          </div>
                        ))
                    : recommendations.map((show) => (
                        <HomeCards
                          key={`${show.media_type}-${show.id}`}
                          MovieCard={show}
                          className="aspect-[2/3]"
                        />
                      ))}
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

export default TvInfo;
