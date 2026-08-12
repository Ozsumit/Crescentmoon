"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Play,
  Star,
  Clock,
  Calendar,
  Server,
  Heart,
  Share2,
  Film,
  Check,
  ShieldAlert,
  X,
  Info,
  Download,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useSettingsStore from "@/components/settings-store";
import { MOVIE_SERVERS as DEFAULT_VIDEO_SOURCES } from "@/lib/config";

// --- SOCIAL BRAND SVGS ---

const WhatsAppIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const RedditIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-4.566 3.875a.312.312 0 0 0-.222.533c.88.88 2.456.88 3.336 0a.312.312 0 0 0-.442-.442c-.636.636-1.816.636-2.452 0a.302.302 0 0 0-.22-.091z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// --- MAIN MOVIE COMPONENT ---

const MovieInfo = ({
  MovieDetail,
  genreArr,
  id,
  videoSources = [],
  cast: initialCast = [],
  recommendations: initialRecommendations = [],
  reviews: initialReviews = [],
}) => {
  const sources = useMemo(() => {
    const activeSources = videoSources.filter((s) => s.active);
    return activeSources.length > 0 ? activeSources : DEFAULT_VIDEO_SOURCES;
  }, [videoSources]);

  const { defaultMovieServer, setDefaultMovieServer, showAdNotice } =
    useSettingsStore();

  const [isMounted, setIsMounted] = useState(false);
  const [selectedServer, setSelectedServer] = useState(sources[0]);
  const [defaultServerName, setDefaultServerName] = useState("");
  const [iframeSrc, setIframeSrc] = useState("");

  const [cast] = useState(initialCast);
  const [recommendations] = useState(initialRecommendations);
  const [reviews] = useState(initialReviews);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAdPopup, setShowAdPopup] = useState(false);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const lastSavedTime = useRef(0);
  const progressCache = useRef(null);

  // Split recommendations: Top 1 for "Up Next", remaining for list
  const topRecommendation = recommendations[0];
  const remainingRecommendations = useMemo(() => {
    return recommendations.slice(1);
  }, [recommendations]);

  // Background & Share Image URL
  const bgImage = useMemo(() => {
    const imagePath = MovieDetail.backdrop_path || MovieDetail.poster_path;
    return imagePath
      ? `https://image.tmdb.org/t/p/w780${imagePath}`
      : "https://via.placeholder.com/1200x630.png?text=Watch+Movie";
  }, [MovieDetail.backdrop_path, MovieDetail.poster_path]);

  // Current page URL for Meta / OG tags
  const shareUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  }, [isMounted]);

  // Dynamic Server Preconnect Logic
  const serversToPreconnect = useMemo(() => {
    if (!sources || sources.length === 0) return [];
    const selectedIndex = sources.findIndex(
      (s) => s.name === selectedServer?.name,
    );
    const targetIndices = new Set();

    if (selectedIndex !== -1) {
      targetIndices.add(selectedIndex);
      if (selectedIndex - 1 >= 0) targetIndices.add(selectedIndex - 1);
      if (selectedIndex + 1 < sources.length)
        targetIndices.add(selectedIndex + 1);
    } else {
      targetIndices.add(0);
    }

    const result = Array.from(targetIndices).map((i) => sources[i]);

    if (defaultServerName) {
      const defaultServer = sources.find((s) => s.name === defaultServerName);
      if (defaultServer && !result.some((s) => s.name === defaultServer.name)) {
        result.push(defaultServer);
      }
    }

    return result;
  }, [sources, selectedServer, defaultServerName]);

  useEffect(() => {
    if (!serversToPreconnect.length) return;

    document
      .querySelectorAll("link[data-dynamic-preconnect='true']")
      .forEach((el) => el.remove());

    serversToPreconnect.forEach((server) => {
      try {
        if (!server?.url) return;
        const origin = new URL(server.url).origin;

        const preconnectLink = document.createElement("link");
        preconnectLink.rel = "preconnect";
        preconnectLink.href = origin;
        preconnectLink.crossOrigin = "anonymous";
        preconnectLink.setAttribute("data-dynamic-preconnect", "true");
        document.head.appendChild(preconnectLink);

        const dnsLink = document.createElement("link");
        dnsLink.rel = "dns-prefetch";
        dnsLink.href = origin;
        dnsLink.setAttribute("data-dynamic-preconnect", "true");
        document.head.appendChild(dnsLink);
      } catch (e) {}
    });
  }, [serversToPreconnect]);

  // Dynamic Head Meta Tag Management for Client-side Navigation
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Update Page Title
    document.title = `${MovieDetail.title} - Watch Free Full Movie`;

    // Helper to dynamically set or update meta tags
    const updateMeta = (selector, attribute, value) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        const [attrName, attrVal] = selector
          .replace("meta[", "")
          .replace("]", "")
          .split("=");
        element.setAttribute(attrName, attrVal.replace(/"/g, ""));
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    const overviewText =
      MovieDetail.overview || `Watch ${MovieDetail.title} online for free.`;

    updateMeta('meta[name="description"]', "content", overviewText);

    // Open Graph
    updateMeta('meta[property="og:title"]', "content", MovieDetail.title);
    updateMeta('meta[property="og:description"]', "content", overviewText);
    updateMeta('meta[property="og:image"]', "content", bgImage);
    updateMeta('meta[property="og:url"]', "content", window.location.href);
    updateMeta('meta[property="og:type"]', "content", "video.movie");

    // Twitter Card
    updateMeta('meta[name="twitter:title"]', "content", MovieDetail.title);
    updateMeta('meta[name="twitter:description"]', "content", overviewText);
    updateMeta('meta[name="twitter:image"]', "content", bgImage);
    updateMeta('meta[name="twitter:card"]', "content", "summary_large_image");
  }, [MovieDetail, bgImage]);

  // --- HYDRATION & INITIALIZATION ---
  useEffect(() => {
    setIsMounted(true);
    const dismissed = sessionStorage.getItem("adblockerNoticeDismissed");
    if (dismissed !== "true" && showAdNotice) setShowAdPopup(true);

    const savedDefault =
      defaultMovieServer || localStorage.getItem("defaultServerName") || "";
    const savedSession = sessionStorage.getItem("sessionServerName");

    if (savedDefault) setDefaultServerName(savedDefault);

    const initialServerName =
      savedSession || savedDefault || sources[0]?.name || "";
    const initialServer =
      sources.find((s) => s.name === initialServerName) || sources[0];

    if (initialServer) {
      setSelectedServer(initialServer);
    }
  }, [sources, defaultMovieServer, showAdNotice]);

  // --- PROGRESS WATCHER & FAV STATUS ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favs.some((i) => i.id === MovieDetail.id));

    const initProgress = () => {
      try {
        const raw = localStorage.getItem("mediaProgress");
        const progress = raw ? JSON.parse(raw) : {};
        progressCache.current = progress;

        if (!progress[id]) {
          progress[id] = {
            id,
            type: "movie",
            title: MovieDetail.title,
            poster_path: MovieDetail.poster_path,
            backdrop_path: MovieDetail.backdrop_path,
            vote_average: MovieDetail.vote_average,
            overview: MovieDetail.overview,
            last_updated: Date.now(),
            progress: { watched: 0, duration: MovieDetail.runtime * 60 || 1 },
          };
          localStorage.setItem("mediaProgress", JSON.stringify(progress));
        }
      } catch (err) {}
    };
    initProgress();

    const handleMessage = (event) => {
      let data = event.data;
      if (!data) return;

      if (typeof data === "string") {
        if (!data.includes("time") && !data.includes("currentTime")) return;
        try {
          data = JSON.parse(data);
        } catch (err) {
          return;
        }
      }

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
          data.duration ?? data.data?.duration ?? MovieDetail.runtime * 60 ?? 1;

        if (
          currentTime > 0 &&
          Math.abs(currentTime - lastSavedTime.current) >= 5
        ) {
          requestAnimationFrame(() => {
            const progressDict = progressCache.current || {};
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
            progressCache.current = progressDict;
            localStorage.setItem("mediaProgress", JSON.stringify(progressDict));
            window.dispatchEvent(new Event("storage"));
            lastSavedTime.current = currentTime;
          });
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [id, MovieDetail]);

  // --- URL BUILDER ---
  useEffect(() => {
    if (!isMounted || !selectedServer) return;

    const { url, params, paramStyle } = selectedServer;
    let finalUrl = "";

    switch (paramStyle) {
      case "path-slash":
      case "path-hyphen-mapi":
        finalUrl = `${url}${id}`;
        break;
      default:
        finalUrl = `${url}${id}${params || ""}`;
        break;
    }

    setIframeSrc(finalUrl);
  }, [selectedServer, id, isMounted]);

  // --- HANDLERS ---
  const handleServerChange = useCallback((server) => {
    setSelectedServer(server);
    sessionStorage.setItem("sessionServerName", server.name);
  }, []);

  const handleSetDefault = useCallback(
    (e, serverName) => {
      e?.stopPropagation();
      setDefaultServerName(serverName);
      localStorage.setItem("defaultServerName", serverName);

      if (typeof setDefaultMovieServer === "function") {
        setDefaultMovieServer(serverName);
      }

      setToast(`Set ${serverName} as default source`);
      setTimeout(() => setToast(null), 3000);
    },
    [setDefaultMovieServer],
  );

  const toggleFav = useCallback(() => {
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
  }, [isFavorite, id, MovieDetail]);

  const copyToClipboard = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setToast("Link copied to clipboard");
      setTimeout(() => setToast(null), 3000);
    }
  }, []);

  // Web Native Sharing Support (iOS / Android Native Share Sheet)
  const handleNativeShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: MovieDetail.title,
          text: MovieDetail.overview || `Watch ${MovieDetail.title}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      setShowShareModal(true);
    }
  }, [MovieDetail]);

  const dismissAd = useCallback(() => {
    sessionStorage.setItem("adblockerNoticeDismissed", "true");
    setShowAdPopup(false);
  }, []);

  // Dynamic share options
  const shareLinks = useMemo(() => {
    if (typeof window === "undefined") return [];
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`Watch ${MovieDetail.title}`);

    return [
      {
        name: "WhatsApp",
        icon: WhatsAppIcon,
        color:
          "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20",
        action: () =>
          window.open(
            `https://api.whatsapp.com/send?text=${title}%20${url}`,
            "_blank",
          ),
      },
      {
        name: "Facebook",
        icon: FacebookIcon,
        color:
          "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20",
        action: () =>
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            "_blank",
          ),
      },
      {
        name: "Reddit",
        icon: RedditIcon,
        color:
          "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20",
        action: () =>
          window.open(
            `https://reddit.com/submit?url=${url}&title=${title}`,
            "_blank",
          ),
      },
      {
        name: "Twitter / X",
        icon: TwitterIcon,
        color:
          "bg-sky-500/10 text-sky-500 border-sky-500/20 hover:bg-sky-500/20",
        action: () =>
          window.open(
            `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
            "_blank",
          ),
      },
      {
        name: "Instagram",
        icon: InstagramIcon,
        color:
          "bg-pink-500/10 text-pink-500 border-pink-500/20 hover:bg-pink-500/20",
        action: () => {
          copyToClipboard();
          setToast("Link copied! Open Instagram to share");
        },
      },
      {
        name: "Copy Link",
        icon: Copy,
        color:
          "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
        action: () => {
          copyToClipboard();
          setShowShareModal(false);
        },
      },
    ];
  }, [MovieDetail.title, copyToClipboard]);

  return (
    <div className="min-h-screen lg:pt-8 pt-20 bg-background text-foreground font-sans sm:pt-6 pb-12 sm:pb-16 selection:bg-primary/30 relative">
      {/* Dynamic Meta Elements for React/Next Document Head Insertion */}
      <title>{`${MovieDetail.title} - Watch Online`}</title>
      <meta
        name="description"
        content={
          MovieDetail.overview ||
          `Watch ${MovieDetail.title} in HD quality online.`
        }
      />

      {/* Open Graph Meta Elements */}
      <meta property="og:type" content="video.movie" />
      <meta property="og:title" content={MovieDetail.title} />
      <meta
        property="og:description"
        content={MovieDetail.overview || `Watch ${MovieDetail.title} online.`}
      />
      <meta property="og:image" content={bgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={shareUrl} />
      <meta property="og:site_name" content="Movie Platform" />

      {/* Twitter Card Meta Elements */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={MovieDetail.title} />
      <meta
        name="twitter:description"
        content={MovieDetail.overview || `Watch ${MovieDetail.title} online.`}
      />
      <meta name="twitter:image" content={bgImage} />

      {/* Cinematic Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background to-background z-10" />
        <img
          src={bgImage}
          className="w-full h-full object-cover blur-[80px] opacity-20 scale-110"
          alt="Background shadow"
        />
      </div>

      <div className="max-w-[1800px] mx-auto px-3 sm:px-6 sm:pt-16 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* =========================================
              LEFT COLUMN: PLAYER & INFO
              ========================================= */}
          <div className="flex-1 lg:w-[65%] xl:w-[70%] flex flex-col gap-4 sm:gap-6">
            {/* 1. THE PLAYER */}
            <div className="w-full aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-border relative group ring-1 ring-border">
              {isMounted && iframeSrc ? (
                <iframe
                  src={iframeSrc}
                  className="w-full h-full absolute inset-0 z-10"
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope"
                  referrerPolicy="no-referrer"
                  title="Player"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-xs sm:text-sm gap-3 sm:gap-4 absolute inset-0 z-0 bg-background">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
                  <span className="font-medium tracking-wide">
                    Loading Player...
                  </span>
                </div>
              )}
            </div>

            {/* 2. HEADER INFO & METADATA */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-start bg-card/40 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-border backdrop-blur-md">
              <div className="flex-1 min-w-0 w-full">
                {/* Genres Pills */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                  {genreArr?.slice(0, 4).map((g, i) => (
                    <span
                      key={i}
                      className="text-primary font-bold bg-primary/10 px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs border border-primary/20"
                    >
                      {g.name || g}
                    </span>
                  ))}
                </div>

                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground mb-1 leading-tight">
                  {MovieDetail.title}
                </h1>

                {MovieDetail.tagline && (
                  <p className="text-[11px] sm:text-xs text-muted-foreground italic mb-2">
                    "{MovieDetail.tagline}"
                  </p>
                )}

                {/* SYNOPSIS BELOW TITLE */}
                <p className="text-xs sm:text-sm text-muted-foreground font-medium line-clamp-3 mb-3 leading-relaxed">
                  {MovieDetail.overview || "No synopsis available."}
                </p>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs sm:text-sm font-medium">
                  <span className="text-primary font-bold flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded text-[11px] sm:text-xs border border-primary/20">
                    <Star size={12} className="fill-current" />
                    {MovieDetail.vote_average?.toFixed(1)} / 10
                  </span>
                  <span className="text-foreground/30">•</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock size={13} /> {MovieDetail.runtime || "-"}m
                  </span>
                  <span className="text-foreground/30">•</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar size={13} />{" "}
                    {MovieDetail.release_date?.split("-")[0] || "N/A"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                <button
                  onClick={toggleFav}
                  className={`flex-1 sm:flex-none h-11 sm:w-12 sm:h-12 flex items-center justify-center gap-2 px-3 sm:px-0 rounded-xl transition-all active:scale-95 shadow-md border ${
                    isFavorite
                      ? "bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20"
                      : "bg-primary text-primary-foreground border-primary hover:opacity-90"
                  }`}
                  title="Save to Library"
                >
                  <Heart
                    size={18}
                    className={isFavorite ? "fill-current" : ""}
                  />
                  <span className="sm:hidden text-xs font-bold">
                    {isFavorite ? "Saved" : "Save"}
                  </span>
                </button>
                <button
                  onClick={handleNativeShare}
                  className="flex-1 sm:flex-none h-11 sm:w-12 sm:h-12 flex items-center justify-center gap-2 px-3 sm:px-0 rounded-xl transition-all active:scale-95 shadow-md bg-muted border border-border text-foreground hover:bg-muted/80"
                  title="Share"
                >
                  <Share2 size={18} />
                  <span className="sm:hidden text-xs font-bold">Share</span>
                </button>
                <button
                  onClick={() => setShowDownloadPopup(true)}
                  className="flex-1 sm:flex-none h-11 sm:w-12 sm:h-12 flex items-center justify-center gap-2 px-3 sm:px-0 rounded-xl transition-all active:scale-95 shadow-md border border-primary text-foreground hover:bg-primary/5"
                  title="Download Movie"
                >
                  <Download size={18} />
                  <span className="sm:hidden text-xs font-bold">Download</span>
                </button>
              </div>
            </div>

            {/* 3. SOURCE SELECTION GRID */}
            <div className="bg-card/40 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-border backdrop-blur-md">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <Server size={14} className="text-primary" />
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Select Stream Server
                  </h3>
                </div>
                <span className="text-[10px] text-muted-foreground bg-foreground/5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-border">
                  {sources.length} Available
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {sources.map((s) => {
                  const isActive = selectedServer?.name === s.name;
                  const isDefault = s.name === defaultServerName;
                  return (
                    <button
                      key={s.name}
                      onClick={() => handleServerChange(s)}
                      onDoubleClick={(e) => handleSetDefault(e, s.name)}
                      className={`relative p-2.5 sm:p-3 rounded-xl border text-left flex items-center gap-2.5 sm:gap-3 transition-all duration-200 group active:scale-95
                        ${
                          isActive
                            ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                            : "bg-foreground/[0.02] border-border hover:bg-foreground/[0.05] hover:border-foreground/10"
                        }
                      `}
                    >
                      {/* Icon Container */}
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors
                        ${
                          isActive
                            ? "bg-primary/20 text-primary border-primary/20"
                            : "bg-muted text-muted-foreground border-border group-hover:text-foreground"
                        }
                      `}
                      >
                        <Server size={15} />
                      </div>

                      {/* Server Details */}
                      <div className="min-w-0 flex-1">
                        <span
                          className={`text-xs font-bold block truncate transition-colors ${
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {s.name}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-medium block uppercase tracking-wide mt-0.5 truncate">
                          {s.description || s.features?.[0] || "Standard"}
                        </span>
                      </div>

                      {/* Default Server Indicator / Direct Setter for Touch Devices */}
                      <button
                        type="button"
                        onClick={(e) => handleSetDefault(e, s.name)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full hover:bg-foreground/10 transition-colors"
                        title={
                          isDefault ? "Default source" : "Tap to set as default"
                        }
                      >
                        <Star
                          size={12}
                          className={
                            isDefault
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground/30 hover:text-amber-500"
                          }
                        />
                      </button>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-neutral-500 mt-3 px-0.5 flex items-center gap-1.5">
                <Info size={11} className="text-neutral-600 shrink-0" />
                <span>
                  Tap star or double-click a server to save as default.
                </span>
              </p>
            </div>

            {/* 4. DETAILS TABS (Overview, Cast, Reviews) */}
            <div className="mt-1 sm:mt-2">
              <div className="flex gap-1 p-1 bg-foreground/[0.04] border border-border rounded-xl sm:rounded-2xl w-full sm:w-fit overflow-x-auto scrollbar-hide mb-4 sm:mb-5">
                {["overview", "cast", "reviews"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="relative flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-bold capitalize tracking-wide transition-colors shrink-0 text-center"
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg sm:rounded-xl z-0"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 ${
                        activeTab === tab
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </span>
                  </button>
                ))}
              </div>

              <div className="bg-card/40 border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-md min-h-[180px]">
                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 sm:space-y-6"
                    >
                      <div>
                        <h3 className="text-[10px] font-bold uppercase text-primary tracking-widest mb-1.5 sm:mb-2">
                          Movie Synopsis
                        </h3>
                        <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground font-medium">
                          {MovieDetail.overview ||
                            "No overview available for this movie."}
                        </p>
                      </div>
                      <div className="pt-3 sm:pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                          <h3 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-0.5 sm:mb-1">
                            Original Title
                          </h3>
                          <p className="text-xs font-semibold text-foreground truncate">
                            {MovieDetail.original_title || "-"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-0.5 sm:mb-1">
                            Status
                          </h3>
                          <p className="text-xs font-semibold text-foreground">
                            {MovieDetail.status || "Released"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-0.5 sm:mb-1">
                            Language
                          </h3>
                          <p className="text-xs font-semibold text-foreground uppercase">
                            {MovieDetail.original_language || "-"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "cast" && (
                    <motion.div
                      key="cast"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3"
                    >
                      {cast.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-foreground/5 transition-colors group"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 bg-muted border border-border">
                            <img
                              src={
                                c.profile_path
                                  ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
                                  : "https://via.placeholder.com/50"
                              }
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              alt={c.name}
                              loading="lazy"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm font-bold text-foreground truncate">
                              {c.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wide truncate mt-0.5">
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
                      className="space-y-3 sm:space-y-4"
                    >
                      {reviews.length > 0 ? (
                        reviews.map((r) => (
                          <div
                            key={r.id}
                            className="p-3.5 sm:p-4 rounded-xl bg-foreground/[0.02] border border-border text-xs"
                          >
                            <div className="font-bold text-foreground mb-1">
                              {r.author}
                            </div>
                            <p className="text-muted-foreground leading-relaxed line-clamp-4">
                              "{r.content}"
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-muted-foreground text-xs flex items-center justify-center h-24">
                          No reviews available for this movie.
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* =========================================
              RIGHT COLUMN: SIDEBAR FEED
              ========================================= */}
          <div className="w-full lg:w-[35%] xl:w-[30%] shrink-0 space-y-4 sm:space-y-6">
            {/* 1. UP NEXT (NEXT MOST RECOMMENDED MOVIE) */}
            {topRecommendation && (
              <div className="bg-card/50 p-3.5 sm:p-4 border border-border rounded-xl sm:rounded-2xl backdrop-blur-xl">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider block mb-2.5">
                  Up Next
                </span>

                <a
                  href={`/movie/${topRecommendation.id}`}
                  className="flex gap-3 cursor-pointer group"
                >
                  <div className="relative w-30 sm:w-44 md:w-56 aspect-video bg-muted rounded-lg overflow-hidden shrink-0 border border-border">
                    {topRecommendation.backdrop_path ||
                    topRecommendation.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${
                          topRecommendation.backdrop_path ||
                          topRecommendation.poster_path
                        }`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={topRecommendation.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <Film size={16} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-start">
                    <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">
                      Recommended Movie
                    </span>
                    <h4 className="text-xs sm:text-sm md:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {topRecommendation.title}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {topRecommendation.overview || "No summary available."}
                    </p>

                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground font-semibold">
                      <span className="flex items-center gap-0.5 text-primary">
                        <Star size={10} className="fill-current" />
                        {topRecommendation.vote_average?.toFixed(1)}
                      </span>
                      <span>•</span>
                      <span>
                        {topRecommendation.release_date?.split("-")[0] || "-"}
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            )}

            {/* 2. MORE RECOMMENDED MOVIES */}
            <div className="bg-card/50 p-3.5 sm:p-4 border border-border rounded-xl sm:rounded-2xl backdrop-blur-xl space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-foreground border-b border-border pb-2">
                More Recommendations
              </h3>

              <div className="space-y-3 max-h-[700px] sm:max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                {(remainingRecommendations.length > 0
                  ? remainingRecommendations
                  : recommendations
                ).map((m) => (
                  <a
                    key={m.id}
                    href={`/movie/${m.id}`}
                    className="flex gap-3 cursor-pointer group"
                  >
                    <div className="relative w-24 sm:w-42 md:w-52 aspect-video bg-muted rounded-md overflow-hidden shrink-0 border border-border">
                      <img
                        src={`https://image.tmdb.org/t/p/w300${
                          m.backdrop_path || m.poster_path
                        }`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={m.title}
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {m.title}
                      </h4>
                      <p className="text-[10px] sm:text-xs font-normal text-muted-foreground leading-relaxed line-clamp-2 mt-0.5">
                        {m.overview || "No description available."}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1 text-[11px] sm:text-xs text-muted-foreground font-semibold">
                        <span className="flex items-center gap-0.5 text-primary">
                          <Star size={9} className="fill-current" />
                          {m.vote_average?.toFixed(1)}
                        </span>
                        <span>•</span>
                        <span>{m.release_date?.split("-")[0] || "-"}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS & NOTIFICATIONS */}
      <AnimatePresence>
        {/* TOAST NOTIFICATION */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border text-foreground px-4 py-3 rounded-full shadow-2xl font-bold text-xs flex items-center gap-2.5 min-w-[220px] max-w-[90vw] justify-center backdrop-blur-xl"
          >
            <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Check size={10} strokeWidth={3} />
            </div>
            <span className="truncate">{toast}</span>
          </motion.div>
        )}

        {/* ADBLOCK WARNING */}
        {showAdPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-[100] sm:w-[340px] bg-card border border-border p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            <div className="flex gap-3.5 items-start">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <ShieldAlert className="text-primary" size={18} />
              </div>
              <div className="flex-1 pt-0.5">
                <h4 className="font-bold text-foreground text-xs sm:text-sm mb-0.5">
                  Adblock Recommended
                </h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  Third-party sources may contain popups. We strongly advise
                  using{" "}
                  <span className="text-primary font-bold">uBlock Origin</span>.
                </p>
              </div>
              <button
                onClick={dismissAd}
                className="text-muted-foreground hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-full p-1 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* SHARE MODAL */}
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-card border border-border/80 p-5 sm:p-6 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="font-bold text-xs sm:text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Share2 size={16} className="text-primary" /> Share Movie
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Share{" "}
                <strong className="text-foreground">{MovieDetail.title}</strong>{" "}
                directly to your favorite platforms:
              </p>

              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-4">
                {shareLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={item.action}
                      className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border text-xs font-bold transition-all ${item.color}`}
                    >
                      <Icon />
                      <span className="truncate">{item.name}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2.5 rounded-xl bg-muted border border-border text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* DOWNLOAD PORTAL MODAL */}
        {showDownloadPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl h-[85vh] sm:h-[80vh] bg-background border border-border rounded-2xl overflow-hidden flex flex-col shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-foreground/[0.02]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                    <Download size={15} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-foreground uppercase tracking-wider truncate">
                      Download Options
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-light truncate">
                      {MovieDetail.title} — Access direct lines
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDownloadPopup(false)}
                  className="text-muted-foreground hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-full p-1.5 sm:p-2 transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Iframe Body */}
              <div className="flex-1 bg-background relative">
                <iframe
                  src={`https://vidvault.ru/movie/${id}`}
                  className="w-full h-full absolute inset-0 z-10 border-0"
                  allowFullScreen
                  title="Download Portal"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
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

export default React.memo(MovieInfo);
