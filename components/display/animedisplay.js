"use client";
import React, { useState, useEffect } from "react";
import { Filter, X, Heart, Star, Calendar, Info } from "lucide-react";
import Link from "next/link";

const AnimeDisplay = () => {
  const [animes, setAnimes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeGenres, setActiveGenres] = useState([]);
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
  const [genres, setGenres] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("https://api.jikan.moe/v4/genres/anime");
        const data = await response.json();
        setGenres(data.data);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites =
      JSON.parse(localStorage.getItem("animeFavorites")) || [];
    setFavorites(storedFavorites);
  }, []);

  const fetchAnime = async (currentPage, genreIds = []) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const genreParam =
        genreIds.length > 0 ? `&genres=${genreIds.join(",")}` : "";
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?page=${currentPage}&limit=24&order_by=popularity${genreParam}&sfw=true`
      );

      if (!response.ok) throw new Error("Failed to fetch anime");
      const data = await response.json();

      const processedAnime = data.data.map((item) => ({
        id: item.mal_id,
        title: item.title,
        image: item.images.jpg.large_image_url,
        score: item.score,
        genres: item.genres,
        type: item.type,
        status: item.status,
        synopsis: item.synopsis,
        aired: item.aired?.from,
        episodes: item.episodes,
      }));

      setAnimes(processedAnime);
      setTotalPages(Math.ceil(data.pagination.items.total / 24));
      setPage(currentPage);
    } catch (error) {
      console.error("Error fetching anime:", error);
      setError("Unable to load anime. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const genreIds = activeGenres.map((genre) => genre.mal_id);
    fetchAnime(page, genreIds);
  }, [page, activeGenres]);

  const toggleGenre = (genre) => {
    setActiveGenres((prev) =>
      prev.some((g) => g.mal_id === genre.mal_id)
        ? prev.filter((g) => g.mal_id !== genre.mal_id)
        : [...prev, genre]
    );
    setPage(1);
  };

  const clearGenres = () => {
    setActiveGenres([]);
    setPage(1);
  };

  const toggleFavorite = (anime) => {
    setFavorites((prev) => {
      const newFavorites = prev.some((f) => f.id === anime.id)
        ? prev.filter((f) => f.id !== anime.id)
        : [...prev, anime];
      localStorage.setItem("animeFavorites", JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const AnimeCard = ({ anime }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const isFavorite = favorites.some((f) => f.id === anime.id);

    return (
      <Link href={`/anime?id=${anime.id}`} key={anime.id}>
        <div className="bg-card rounded-xl h-[14rem] cursor-pointer sm:h-auto overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-border relative group">
          <div className="block relative">
            <div
              className={`relative ${
                !imageLoaded ? "opacity-0" : "opacity-100"
              } transition-opacity duration-300`}
            >
              <img
                src={anime.image || "/api/placeholder/300/450"}
                alt={anime.title}
                className="w-full h-32 sm:h-48 object-cover rounded-xl transition-transform duration-300 ease-in-out group-hover:scale-110"
                onLoad={() => setImageLoaded(true)}
              />
            </div>
            <div className="absolute top-2 left-2 bg-background/40 text-foreground px-3 py-1 rounded-md text-xs font-semibold backdrop-blur-sm border border-border">
              {anime.type || "TV"}
            </div>
          </div>

          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity ease-in-out duration-300 flex flex-col justify-center items-center p-4 text-center text-foreground backdrop-blur-sm">
            <p className="text-sm mb-3 text-shadow-sm line-clamp-3">
              {anime.synopsis || "No synopsis available"}
            </p>
            <button className="flex items-center text-xs sm:text-sm hover:text-primary transition-colors font-bold uppercase tracking-wider">
              <Info size={16} className="mr-2" />
              More Details
            </button>
          </div>

          <div className="p-4">
            <h3 className="text-center text-foreground font-semibold text-base mb-2 line-clamp-1">
              {anime.title}
            </h3>

            <div className="flex flex-col lg:flex-row justify-between items-center text-xs text-muted-foreground">
              <div className="flex items-center">
                <Star size={14} className="mr-1 text-accent-foreground fill-current" />
                <span>
                  {anime.score ? `${anime.score.toFixed(1)}/10` : "N/A"}
                </span>
              </div>

              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                <span>{formatDate(anime.aired)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(anime);
            }}
            className="absolute top-2 right-2 z-20 bg-background/50 rounded-full p-2 hover:bg-background/70 transition-colors border border-border"
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              size={20}
              fill={isFavorite ? "hsl(var(--primary))" : "none"}
              stroke={isFavorite ? "hsl(var(--primary))" : "currentColor"}
              className={`transition-colors ${isFavorite ? "text-primary" : "text-foreground"}`}
            />
          </button>
        </div>
      </Link>
    );
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 mb-8 mt-12 lg:px-8 xl:px-12">
      <div className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-border">
        <div className="p-4 sm:p-6 md:p-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-6 text-foreground tracking-tighter uppercase">
            {activeGenres.length > 0
              ? `${activeGenres.map((g) => g.name).join(", ")} Anime`
              : "Popular Anime"}
          </h2>

          <div className="flex flex-col items-center space-y-4 mb-6 relative">
            <div className="flex flex-wrap justify-end items-center gap-2 sm:gap-4">
              <button
                onClick={() => setIsGenreMenuOpen(!isGenreMenuOpen)}
                className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-full hover:opacity-90 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Filter Genres</span>
                {activeGenres.length > 0 && (
                  <span className="ml-2 bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-xs">
                    {activeGenres.length}
                  </span>
                )}
              </button>

              {activeGenres.length > 0 && (
                <button
                  onClick={clearGenres}
                  className="text-muted-foreground hover:text-foreground flex items-center space-x-1 text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

            {isGenreMenuOpen && (
              <div className="absolute z-50 mt-2 p-6 bg-card border border-border rounded-[2rem] shadow-2xl max-h-96 overflow-y-auto backdrop-blur-2xl">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {genres.map((genre) => (
                    <button
                      key={genre.mal_id}
                      onClick={() => toggleGenre(genre)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                        activeGenres.some((g) => g.mal_id === genre.mal_id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border hover:bg-foreground/5 hover:text-foreground"
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <span className="ml-3 text-primary text-sm font-mono uppercase tracking-widest">Loading...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-destructive font-bold uppercase tracking-widest">{error}</div>
          )}

          {!isLoading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {animes.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          )}

          {!isLoading && !error && totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full disabled:opacity-30 hover:opacity-90 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                Previous
              </button>
              <span className="text-foreground font-mono text-sm font-bold">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full disabled:opacity-30 hover:opacity-90 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeDisplay;
