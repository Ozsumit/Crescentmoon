"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Play } from "lucide-react";

const TopTen = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopTen = async () => {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}`,
        );
        if (!res.ok) throw new Error("API response error");
        const data = await res.json();
        // Slice top 10 items
        setTrending(data.results.slice(0, 5));
      } catch (err) {
        console.warn("Falling back to mock data:", err);
        setTrending(
          Array.from({ length: 5 }).map((_, i) => ({
            id: `mock-${i}`,
            title:
              i % 2 === 0 ? "Swiss Editorial Title" : "Dynamic Material Block",
            backdrop_path: null,
            media_type: i % 2 === 0 ? "movie" : "tv",
            vote_average: 8.5 - i * 0.1,
          })),
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTopTen();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-16 px-4 sm:px-6 md:px-12 lg:px-16 bg-background">
        <div className="h-12 w-64 bg-secondary/60 animate-pulse rounded-[1rem] mb-12" />
        <div className="flex overflow-x-auto gap-6 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 scrollbar-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="w-[75vw] min-w-[240px] max-w-[280px] sm:w-auto sm:min-w-0 sm:max-w-none shrink-0 aspect-[2/3] bg-secondary/40 animate-pulse rounded-[2rem]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 md:px-12 lg:px-16 bg-background text-foreground overflow-hidden">
      {/* Swiss Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6 sm:pb-8 mb-8 sm:mb-12">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-primary/80">
            Current Leaderboard
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
            Top 10 Today
          </h2>
        </div>
      </div>

      {/* Mobile Carousel & Desktop Grid Layout */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 pt-10 sm:pt-0 sm:pb-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-y-16 sm:gap-x-8 scrollbar-none sm:overflow-visible">
        {trending.map((item, index) => {
          const isTV = item.media_type === "tv";
          const title = item.title || item.name || "Untitled";
          const href = isTV ? `/series/${item.id}` : `/movie/${item.id}`;
          const poster = item.poster_path
            ? `https://image.tmdb.org/t/p/w300/${item.poster_path}`
            : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop";

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (index % 5) * 0.05 }}
              className="w-[75vw] min-w-[240px] max-w-[280px] sm:w-auto sm:min-w-0 sm:max-w-none shrink-0 sm:shrink snap-start flex flex-col relative"
            >
              {/* Massive Swiss Index Number behind the Material You container */}
              <div className="absolute -top-10 -left-2 select-none pointer-events-none z-0">
                <span className="text-[100px] sm:text-[120px] font-black leading-none tracking-tighter text-primary font-sans opacity-70">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Material You Styled Card Container */}
              <div className="relative z-10 flex-1 flex flex-col bg-secondary/30 backdrop-blur-sm rounded-[2rem] p-4 border border-border/50 hover:border-border/100 hover:bg-secondary/50 transition-all duration-300">
                {/* Visual Image Block */}
                <Link
                  href={href}
                  className="relative block aspect-[4/5] rounded-[1.5rem] overflow-hidden group mb-4"
                >
                  <Image
                    src={poster}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 75vw, 300px"
                    priority={index < 3}
                  />
                  {/* Dark layout screen tint */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />

                  {/* Material Dynamic Accent Chip */}
                  <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-foreground border border-border/50">
                    {isTV ? "Series" : "Movie"}
                  </div>
                </Link>

                {/* Swiss Typography & Content Grid */}
                <div className="flex-1 flex flex-col justify-between px-1">
                  <div>
                    <h3 className="text-base font-bold leading-tight tracking-tight text-foreground line-clamp-2 mb-1 hover:text-primary transition-colors">
                      <Link href={href}>{title}</Link>
                    </h3>

                    {/* Rating and Info line */}
                    {item.vote_average ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Star size={12} className="fill-accent text-accent" />
                        <span className="font-bold text-foreground">
                          {item.vote_average.toFixed(1)}
                        </span>
                        <span>•</span>
                        <span className="uppercase text-[9px] font-bold tracking-widest text-muted-foreground">
                          #{index + 1} Trending
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/40">
                    <Link
                      href={href}
                      className="flex-1 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 duration-200"
                    >
                      <Play size={11} className="fill-current stroke-none" />
                      <span>Details</span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default TopTen;
