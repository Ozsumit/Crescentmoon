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
        if (!res.ok) throw new Error("API Key missing or invalid");
        const data = await res.json();
        setTrending(data.results.slice(0, 10));
      } catch (err) {
        console.error("Error fetching top 10:", err);
        // Fallback mock data
        setTrending(Array.from({ length: 10 }).map((_, i) => ({
          id: `mock-${i}`,
          title: `Top Pick ${i + 1}`,
          poster_path: null,
          media_type: i % 2 === 0 ? "movie" : "tv",
          vote_average: 9.0 - i * 0.1,
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchTopTen();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-12 px-6 md:px-12 lg:px-16 overflow-hidden">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg mb-8" />
        <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="min-w-[200px] aspect-[2/3] bg-muted animate-pulse rounded-[2rem]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 px-4 sm:px-6 md:px-12 lg:px-16 overflow-hidden bg-background">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1.5 h-8 bg-primary rounded-full" />
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground uppercase">
          Top 10 Today
        </h2>
      </div>

      <div className="flex gap-8 md:gap-12 overflow-x-auto pb-12 custom-scrollbar snap-x snap-mandatory px-4">
        {trending.map((item, index) => {
          const isTV = item.media_type === "tv";
          const title = item.title || item.name;
          const href = isTV ? `/series/${item.id}` : `/movie/${item.id}`;
          const poster = item.poster_path
            ? `https://image.tmdb.org/t/p/w342/${item.poster_path}`
            : "https://i.imgur.com/HIYYPtZ.png";

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative min-w-[180px] sm:min-w-[220px] md:min-w-[260px] group snap-start"
            >
              {/* Ranking Number */}
              <div className="absolute -left-6 md:-left-10 bottom-0 z-0">
                <span className="text-[120px] md:text-[180px] font-black leading-none text-transparent stroke-text select-none opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                  {index + 1}
                </span>
              </div>

              {/* Card */}
              <Link href={href} className="block relative z-10 ml-6 md:ml-10">
                <div className="relative aspect-[2/3] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.05] group-hover:-translate-y-2 ring-1 ring-border">
                  <Image
                    src={poster}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 180px, 260px"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-primary text-primary-foreground uppercase">
                         {isTV ? "Series" : "Movie"}
                       </span>
                       <div className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                         <Star size={12} className="fill-yellow-400" />
                         {item.vote_average?.toFixed(1)}
                       </div>
                    </div>
                    <h3 className="text-white text-sm md:text-lg font-bold line-clamp-2 leading-tight mb-3">
                      {title}
                    </h3>
                    <div className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs md:text-sm flex items-center justify-center gap-2">
                       <Play size={14} className="fill-black" />
                       <span>Watch Now</span>
                    </div>
                  </div>
                </div>
              </Link>

              <style jsx>{`
                .stroke-text {
                  -webkit-text-stroke: 2px rgba(255, 255, 255, 0.3);
                }
                :global(.dark) .stroke-text {
                  -webkit-text-stroke: 2px rgba(255, 255, 255, 0.2);
                }
              `}</style>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TopTen;
