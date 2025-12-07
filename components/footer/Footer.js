"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Github,
  Instagram,
  Facebook,
  ArrowUpRight,
  Mail,
  Clapperboard,
  PlayCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const [movieOfTheDay, setMovieOfTheDay] = useState(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        if (!apiKey) return;

        // Fetch Top Rated for quality suggestions
        const resp = await fetch(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&page=1`
        );

        if (!resp.ok) throw new Error("Failed to fetch");
        const data = await resp.json();
        const movies = data.results;
        // Random pick
        setMovieOfTheDay(movies[Math.floor(Math.random() * movies.length)]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMovie();
  }, []);

  const footerSections = [
    {
      title: "Discover",
      links: [
        { label: "Now Playing", href: "/movies" },
        { label: "Trending TV", href: "/series" },
        { label: "Top Rated", href: "/top-rated" },
        { label: "Upcoming", href: "/upcoming" },
      ],
    },
    {
      title: "Studio",
      links: [
        { label: "About Crescent", href: "/about" },
        { label: "The Team", href: "/team" },
        { label: "Careers", href: "/careers" },
        { label: "Press Kit", href: "/press" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Use", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
      ],
    },
  ];

  return (
    <footer className="w-full bg-black text-white border-t border-white/10 mt-20 relative overflow-hidden">
      {/* Massive Background Brand Text (Subtle) */}
      <div className="absolute bottom-[-5vw] left-0 w-full select-none pointer-events-none opacity-[0.03] overflow-hidden leading-none">
        <h1 className="text-[25vw] font-black tracking-tighter text-white whitespace-nowrap">
          CRESCENT
        </h1>
      </div>

      <div className="max-w-[1600px] mx-auto">
        {/* --- ROW 1: NEWSLETTER & BRAND --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-white/10">
          {/* Brand Identity */}
          <div className="p-8 md:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center">
                  <span className="font-black text-xl">C</span>
                </div>
                <span className="text-xl font-bold tracking-tight">
                  Crescent Moon
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight leading-[1.1] max-w-md">
                The new standard for{" "}
                <span className="text-neutral-500">digital cinema</span>{" "}
                exploration.
              </h2>
            </div>
          </div>

          {/* Newsletter */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <label className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-4">
              Weekly Digest
            </label>
            <div className="relative group">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-transparent border-b border-white/20 py-4 text-xl md:text-2xl outline-none placeholder:text-neutral-700 focus:border-white transition-colors"
              />
              <button className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-white hover:text-white transition-colors">
                <ArrowUpRight size={32} />
              </button>
            </div>
            <p className="mt-4 text-sm text-neutral-600">
              Join 10,000+ film enthusiasts. No spam, just cinema.
            </p>
          </div>
        </div>

        {/* --- ROW 2: LINKS & MOVIE PICK --- */}
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Navigation Links (Takes up 8 columns) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 border-b md:border-b-0 md:border-r border-white/10">
            {footerSections.map((section) => (
              <div
                key={section.title}
                className="p-8 md:p-12 border-r border-white/10 last:border-r-0"
              >
                <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-6">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block text-sm text-neutral-400 hover:text-white transition-colors hover:translate-x-1 duration-300"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Movie of the Day (Takes up 4 columns) */}
          <div className="md:col-span-4 p-8 md:p-12 flex flex-col justify-between min-h-[300px] relative group overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#e2e2e2]">
                  <Clapperboard size={14} />
                  <span>Curator's Pick</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>

              {movieOfTheDay ? (
                <Link href={`/movie/${movieOfTheDay.id}`} className="block">
                  <h4 className="text-2xl font-bold leading-tight mb-2 group-hover:underline decoration-1 underline-offset-4 decoration-white/30">
                    {movieOfTheDay.title}
                  </h4>
                  <p className="text-sm text-neutral-400 line-clamp-3 mb-6">
                    {movieOfTheDay.overview}
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm font-bold border-b border-white pb-0.5">
                    <PlayCircle size={16} />
                    Watch Trailer
                  </div>
                </Link>
              ) : (
                <div className="animate-pulse bg-white/5 w-full h-32 rounded-lg" />
              )}
            </div>

            {/* Subtle Backdrop Image */}
            {movieOfTheDay && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/40 z-0" />
                <Image
                  src={`https://image.tmdb.org/t/p/w500/${movieOfTheDay.poster_path}`}
                  alt="Backdrop"
                  fill
                  className="object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-700 z-[-1] grayscale group-hover:grayscale-0"
                />
              </>
            )}
          </div>
        </div>

        {/* --- ROW 3: FOOTER BOTTOM --- */}
        <div className="border-t border-white/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="text-xs text-neutral-600 font-mono">
            © {currentYear} VASS INC. / OMEGA
          </div>

          {/* Social Icons (Minimal) */}
          <div className="flex items-center gap-6">
            {[Github, Instagram, Facebook, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="text-neutral-500 hover:text-white transition-colors hover:-translate-y-1 duration-300"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
