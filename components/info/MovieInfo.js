"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Star,
  Clock,
  CalendarDays,
  Server,
  Download,
  Heart,
  Fullscreen,
  Share2,
  Info,
  ChevronUp,
  ChevronDown,
  Eye,
  ThumbsUp,
  Users,
  Play,
  Film,
  Award,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import HomeCards from "@/components/display/HomeCard";

const VIDEO_SOURCES = [
  {
    name: "VidLink",
    url: `https://vidlink.pro/movie/`,
    params:
      "?primaryColor=6a5fef&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=jw&title=true&poster=true&autoplay=true&nextbutton=true",
    icon: <Play className="w-4 h-4" />,
    downloadSupport: false,
  },
  {
    name: "VidSrc",
    params: "?multiLang=true",
    url: `https://v2.vidsrc.me/embed/movie/`,
    icon: <Award className="w-4 h-4" />,
    downloadSupport: true,
    getDownloadLink: (id) => `https://v2.vidsrc.me/download/${id}`,
  },
  {
    name: "VidSrc 2",
    params:
      "?autoplay=true&autonext=true&nextbutton=true&poster=true&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&fontcolor=FFFFFF&fontsize=16px&opacity=0.5&font=Poppins",
    url: `https://player.vidsrc.co/embed/movie/`,
    icon: <Share2 className="w-4 h-4" />,
    // downloadSupport: true,
    // getDownloadLink: (id) => `https://v2.vidsrc.me/download/${id}`,
  },
  {
    name: "2Embed",
    url: `https://2embed.cc/embed/movie/`,
    icon: <Film className="w-4 h-4" />,
    downloadSupport: false,
  },
  {
    name: "Binge",
    url: `https://vidbinge.dev/embed/movie/`,
    icon: <Eye className="w-4 h-4" />,
    downloadSupport: false,
    parseUrl: true,
  },
  {
    name: "EmbedSu",
    url: `https://embed.su/embed/movie/`,
    params: "?multiLang=true",
    icon: <Server className="w-4 h-4" />,
    downloadSupport: false,
  },
  {
    name: "MultiEmbed",
    url: `https://multiembed.mov/directstream.php?video_id=`,
    params: "&tmdb=1",
    icon: <Film className="w-4 h-4" />,
    downloadSupport: false,
  },
];

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

const MovieInfo = ({ MovieDetail, genreArr, id }) => {
  const getInitialServer = () => {
    if (typeof window !== "undefined") {
      const storedServerName = localStorage.getItem("selectedMovieServer");
      if (storedServerName) {
        const foundServer = VIDEO_SOURCES.find(
          (server) => server.name === storedServerName
        );
        if (foundServer) {
          return foundServer;
        }
      }
    }
    return VIDEO_SOURCES[0];
  };

  const [selectedServer, setSelectedServer] = useState(getInitialServer);
  const [iframeSrc, setIframeSrc] = useState("");
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMoreCast, setShowMoreCast] = useState(false);
  const videoContainerRef = useRef(null);

  const posterPath = MovieDetail.poster_path
    ? `https://image.tmdb.org/t/p/w500${MovieDetail.poster_path}`
    : "https://via.placeholder.com/500x750.png?text=Movie+Poster";

  const backgroundPath = MovieDetail.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${MovieDetail.backdrop_path}`
    : posterPath;

  const formatRuntime = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const simulateKeyPress = () => {
    const keyEvent = new KeyboardEvent("keydown", {
      key: "M",
      code: "KeyM",
      keyCode: 77,
      which: 77,
      bubbles: true,
      cancelable: true,
    });

    // Dispatch the event on the parent document.
    // IMPORTANT NOTE: Due to browser security (Same-Origin Policy),
    // this event will NOT propagate into the iframe if the iframe content
    // is from a different domain (e.g., vidlink.pro). This means it's
    // highly unlikely to directly unmute the player inside the iframe.
    // Users will typically still need to manually unmute the player.
    document.dispatchEvent(keyEvent);
    console.log("M key press simulated on parent document.");
  };

  // Keep this useEffect for general key logging/debugging (unrelated to the automatic unmute logic)
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "M" || event.key === "m") {
        console.log("M key was pressed on the PARENT document!");
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  // NEW useEffect to conditionally simulate 'm' key press for VidLink
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if the currently selected server is 'VidLink'
      if (selectedServer.name === "VidLink") {
        console.log(
          "VidLink server selected. Scheduling 'm' key press attempt..."
        );
        const timer = setTimeout(() => {
          simulateKeyPress(); // Attempt to simulate 'm' key press
        }, 3000); // Delay to allow the iframe to load

        return () => {
          console.log("Clearing 'm' key press timer for VidLink.");
          clearTimeout(timer);
        };
      } else {
        console.log(
          `Server is ${selectedServer.name}. Not simulating 'm' key press.`
        );
      }
    }
  }, [selectedServer]); // Re-run this effect whenever selectedServer changes

  const showNotification = useCallback((message) => {
    setAlertMessage(message);
    setShowAlert(true);
    const timer = setTimeout(() => setShowAlert(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const generateIframeSrc = async () => {
      if (!selectedServer || !id) {
        setIframeSrc("");
        return;
      }

      let urlToUse = selectedServer.url;
      let paramsToUse = selectedServer.params || "";

      try {
        if (selectedServer.parseUrl) {
          const response = await fetch(`${urlToUse}${id}`);
          const data = await response.json();
          urlToUse = data.url;
        } else {
          urlToUse = `${urlToUse}${id}${paramsToUse}`;
        }
        setIframeSrc(urlToUse);
        // Optional: for debugging to see the generated URL
        // console.log(`Generated iframe src for ${selectedServer.name}: ${urlToUse}`);
      } catch (error) {
        console.error("Error generating iframe source:", error);
        setIframeSrc("");
        showNotification(
          `Failed to load ${selectedServer.name} content. Please try another server.`
        );
      }
    };

    generateIframeSrc();

    if (typeof window !== "undefined") {
      const handleVidLinkMessage = (event) => {
        if (event.origin !== "https://vidlink.pro") return;

        if (event.data?.type === "MEDIA_DATA") {
          const mediaData = event.data.data;
          localStorage.setItem("vidLinkProgress", JSON.stringify(mediaData));
        }
      };
      window.addEventListener("message", handleVidLinkMessage);
      return () => {
        window.removeEventListener("message", handleVidLinkMessage);
      };
    }
  }, [selectedServer, id, showNotification]);

  const handleServerChange = useCallback(
    (server) => {
      setSelectedServer(server);
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedMovieServer", server.name);
      }
      showNotification(`Switched to ${server.name} server`);
    },
    [showNotification]
  );

  const handleFavoriteToggle = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (isFavorite) {
      const updatedFavorites = favorites.filter(
        (item) => item.id !== MovieDetail.id
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      showNotification("Removed from favorites");
    } else {
      if (!favorites.some((item) => item.id === MovieDetail.id)) {
        favorites.push(MovieDetail);
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

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
        <p className="text-sm font-medium text-slate-200 truncate">
          {cast.name}
        </p>
        <p className="text-xs text-slate-400 truncate">{cast.character}</p>
      </div>
    </div>
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(favorites.some((item) => item.id === MovieDetail.id));
    }

    const fetchData = async () => {
      setIsLoadingCast(true);
      setIsLoadingRecommendations(true);
      setIsLoadingReviews(true);
      try {
        const [castResponse, recommendationsResponse, reviewsResponse] =
          await Promise.all([
            fetch(
              `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
            ),
            fetch(
              `https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
            ),
            fetch(
              `https://api.themoviedb.org/3/movie/${id}/reviews?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
            ),
          ]);

        const castData = await castResponse.json();
        const recommendationsData = await recommendationsResponse.json();
        const reviewsData = await reviewsResponse.json();

        setCastInfo(castData.cast.slice(0, 10));
        setRecommendations(recommendationsData.results.slice(0, 6));
        setReviews(reviewsData.results.slice(0, 5));
      } catch (error) {
        console.error("Failed to load movie supplementary content:", error);
        showNotification("Failed to load some content");
      } finally {
        setIsLoadingCast(false);
        setIsLoadingRecommendations(false);
        setIsLoadingReviews(false);
      }
    };

    fetchData();
  }, [MovieDetail.id, id, showNotification]);

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
              <div className="order-1 lg:order-1">
                <div
                  ref={videoContainerRef}
                  className="relative bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800/50"
                >
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <iframe
                      src={iframeSrc}
                      allow="autoplay fullscreen picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                      referrerPolicy="no-referrer"
                    />
                    {!iframeSrc && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-900/90 backdrop-blur-sm">
                    <Sheet>
                      <SheetTrigger asChild>
                        <button className="px-3 py-1.5 text-white bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2">
                          {selectedServer.icon}
                          <span className="text-sm font-medium">
                            {selectedServer.name}
                          </span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </SheetTrigger>
                      <SheetContent
                        side="bottom"
                        className="bg-slate-900/95 backdrop-blur-xl border-slate-700"
                      >
                        <div className="grid grid-cols-3 gap-2 pt-4">
                          {VIDEO_SOURCES.map((server) => (
                            <Tooltip key={server.name}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleServerChange(server)}
                                  className={`p-3 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                    selectedServer.name === server.name
                                      ? "bg-indigo-600 text-white"
                                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                  }`}
                                >
                                  {server.icon}
                                  {server.name}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{`Switch to ${server.name}`}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </SheetContent>
                    </Sheet>

                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleShare}
                            className="p-2 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Share movie</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <p className=" text-sm font-sans text-orange-300 w-full p-2 bg-slate-900/90 backdrop-blur-sm">
                    Not the movie you were hoping for? It might be server's
                    fault which i currently dont have direct access to. But
                    worry not, it might be on other servers. Switch the servers
                    by clicking the button above until it works for you
                  </p>
                  {/* NEW ADDITION: User notification for VidLink muted playback */}
                  {/* {selectedServer.name === "VidLink" && (
                    <p className="text-xs font-sans text-white w-full p-2 bg-yellow-900/50 backdrop-blur-sm border-t border-yellow-800">
                      <Info className="w-3 h-3 inline-block mr-1" />
                      VidLink videos might start muted due to browser autoplay
                      policies. You'll need to unmute it manually in the player
                      controls.
                    </p>
                  )} */}
                </div>
                <div className="order-4 lg:order-3 space-y-4">
                  <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-slate-800/50 mt-4">
                    <div className="p-4 border-b border-slate-800/50">
                      <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
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
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No reviews yet</p>
                          <p className="text-sm">
                            Be the first to review this movie!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block space-y-4 mt-6">
                  <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                    <Film className="w-5 h-5 text-indigo-400" />
                    Similar Movies
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
                      : recommendations.map((movie) => (
                          <HomeCards
                            key={`${movie.media_type}-${movie.id}`}
                            MovieCard={movie}
                            className="aspect-[2/3]"
                          />
                        ))}
                  </div>
                </div>
              </div>

              <div className="order-2 lg:order-2 space-y-4">
                <div className="rounded-xl overflow-hidden shadow-xl border border-slate-800/50">
                  <img
                    src={posterPath}
                    alt={MovieDetail.title}
                    className="w-full"
                  />
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-slate-800/50 space-y-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">
                      {MovieDetail.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Star className="text-yellow-400 w-4 h-4" />
                        <span>
                          {MovieDetail.vote_average?.toFixed(1) || "N/A"}/10
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="text-indigo-400 w-4 h-4" />
                        <span>{formatRuntime(MovieDetail.runtime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarDays className="text-pink-400 w-4 h-4" />
                        <span>
                          {MovieDetail.release_date
                            ? new Date(MovieDetail.release_date).getFullYear()
                            : "N/A"}
                        </span>
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
                    {MovieDetail.overview}
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

                  <div className="flex gap-3">
                    {selectedServer.downloadSupport && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={selectedServer.getDownloadLink(id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center px-4 py-2.5 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download movie</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>

              <div className="order-3 lg:hidden space-y-4">
                <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                  <Film className="w-5 h-5 text-indigo-400" />
                  Similar Movies
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
                    : recommendations.map((movie) => (
                        <HomeCards
                          key={`${movie.media_type}-${movie.id}`}
                          MovieCard={movie}
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

export default MovieInfo;
