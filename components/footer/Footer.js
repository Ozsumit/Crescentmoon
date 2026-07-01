"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Github,
  Instagram,
  Facebook,
  Mail,
  Clapperboard,
  PlayCircle,
} from "lucide-react";
import { StaticDeveloperFeedback } from "@/components/feedback";

const Footer = () => {
  const [movieOfTheDay, setMovieOfTheDay] = useState(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        if (!apiKey) return;

        const resp = await fetch(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&page=1`,
        );

        if (!resp.ok) throw new Error("Failed to fetch");
        const data = await resp.json();
        const movies = data.results;
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
        { label: "Now Playing", href: "/#movies" },
        { label: "Trending TV", href: "/#series" },
        { label: "Top Rated", href: "/#top-rated" },
        { label: "Upcoming", href: "/#upcoming" },
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
        { label: "Privacy Policy", href: "/legal/privacy" },
        { label: "Terms of Use", href: "/legal/terms" },
        { label: "Cookie Policy", href: "/legal/cookies" },
      ],
    },
  ];

  return (
    <footer className="w-full bg-card text-foreground border-t border-border mt-20 relative overflow-hidden">
      {/* Massive Background Brand Text (Subtle) */}
      <div className="absolute bottom-[-5vw] z-100 left-0 w-full select-none pointer-events-none opacity-[0.05] overflow-hidden leading-none">
        <h1 className="text-[25vw] font-black tracking-tighter text-foreground whitespace-nowrap">
          CRESCENT
        </h1>
      </div>

      <div className="max-w-[1600px] mx-auto">
        {/* --- ROW 1: BRAND & FEEDBACK --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-border">
          {/* Brand Identity */}
          <div className="p-8 md:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                  <span className="font-black text-xl">C</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  Crescent Moon
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight leading-[1.1] max-w-md">
                The new standard for{" "}
                <span className="text-muted-foreground">digital cinema</span>{" "}
                exploration.
              </h2>
            </div>
          </div>

          {/* Inline Developer Feedback Form */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-foreground/[0.01]">
            <StaticDeveloperFeedback />
          </div>
        </div>

        {/* --- ROW 2: LINKS & MOVIE PICK --- */}
        <div className="grid z-1 grid-cols-1 md:grid-cols-12">
          {/* Navigation Links (Takes up 8 columns) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 border-b md:border-b-0 md:border-r border-border">
            {footerSections.map((section) => (
              <div
                key={section.title}
                className="p-8 md:p-12 border-r border-border last:border-r-0"
              >
                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-6">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 duration-300"
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
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted-foreground">
                  <Clapperboard size={14} />
                  <span>Curator's Pick</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>

              {movieOfTheDay ? (
                <Link href={`/movie/${movieOfTheDay.id}`} className="block">
                  <h4 className="text-2xl font-bold leading-tight mb-2 group-hover:underline decoration-1 underline-offset-4 decoration-border">
                    {movieOfTheDay.title}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6">
                    {movieOfTheDay.overview}
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm font-bold border-b border-foreground pb-0.5">
                    <PlayCircle size={16} />
                    Watch Trailer
                  </div>
                </Link>
              ) : (
                <div className="animate-pulse bg-muted w-full h-32 rounded-lg" />
              )}
            </div>

            {/* Subtle Backdrop Image */}
            {movieOfTheDay && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/40 z-0" />
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
        <div className="border-t border-border p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xs text-muted-foreground font-mono">
            © {currentYear} VASS INC. / OMEGA
          </div>
          <div className="flex items-center gap-6">
            {[Github, Instagram, Facebook, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors hover:-translate-y-1 duration-300"
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
