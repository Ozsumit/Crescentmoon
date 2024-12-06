"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Github, Instagram, Facebook, Moon, Star } from "lucide-react";

const Footer = () => {
  const [movieOfTheDay, setMovieOfTheDay] = useState(null);
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: Github,
      href: "https://github.com/ozsumit",
      label: "GitHub",
    },
    {
      icon: Instagram,
      href: "https://instagram.com/sumitp0khrel",
      label: "Instagram",
    },
    {
      icon: Facebook,
      href: "https://facebook.com/ozsumit",
      label: "Facebook",
    },
  ];

  const footerLinks = [
    { href: "/", label: "Home" },
    { href: "/movies", label: "Movies" },
    { href: "/series", label: "TV Series" },
  ];

  // Fetch Movie of the Day
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        const resp = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=1`
        );

        if (!resp.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await resp.json();
        const movies = data.results;
        const randomMovie = movies[Math.floor(Math.random() * movies.length)];
        setMovieOfTheDay(randomMovie);
      } catch (error) {
        console.error("Error fetching movie data:", error);
      }
    };

    fetchMovie();
  }, []);

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200 rounded-t-3xl shadow-2xl py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <Link href="/" className="group">
              <div className="flex items-center space-x-3">
                <Moon
                  className="text-indigo-500 fill-indigo-500 group-hover:rotate-12 transition-transform"
                  size={36}
                />
                <h1 className="text-white font-bold text-3xl group-hover:text-indigo-400 transition-colors">
                  Crescent Moon
                </h1>
              </div>
            </Link>
            <p className="text-gray-400 text-center md:text-left max-w-xs leading-relaxed">
              Discover cinematic magic, one frame at a time. Your ultimate
              destination for endless entertainment.
            </p>

            {movieOfTheDay && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-lg w-full transform transition-all hover:scale-105 hover:shadow-xl">
                <div className="flex items-center space-x-4">
                  <img
                    src={`https://image.tmdb.org/t/p/w200/${movieOfTheDay.poster_path}`}
                    alt={movieOfTheDay.title}
                    className="w-24 h-36 object-cover rounded-lg shadow-md"
                  />
                  <div>
                    <div className="flex items-center mb-2">
                      <Star className="w-5 h-5 text-yellow-500 mr-2" />
                      <h3 className="text-indigo-400 font-bold">Movie Pick</h3>
                    </div>
                    <p className="text-white font-semibold">
                      {movieOfTheDay.title}
                    </p>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {movieOfTheDay.overview}
                    </p>
                    <Link
                      href={`/movie/${movieOfTheDay.id}`}
                      className="text-indigo-400 hover:text-indigo-300 mt-2 inline-block text-sm"
                    >
                      Explore Movie
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <h2 className="text-white font-semibold text-xl border-b-2 border-indigo-500 pb-2 w-full text-center md:text-left">
              Quick Links
            </h2>
            <nav className="w-full">
              <ul className="space-y-3 text-center md:text-left">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-indigo-400 hover:translate-x-2 transition-all inline-block"
                    >
                      → {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Trending Movies */}
            <div className="space-y-4 w-full">
              <h2 className="text-white font-semibold text-xl border-b-2 border-indigo-500 pb-2 w-full text-center md:text-left">
                Trending Movies
              </h2>
              {[
                { title: "The Shawshank Redemption", id: 278, year: 1994 },
                { title: "Inception", id: 27205, year: 2010 },
                { title: "The Dark Knight", id: 155, year: 2008 },
                { title: "Pulp Fiction", id: 680, year: 1994 },
              ].map((movie) => (
                <div
                  key={movie.title}
                  className="group text-center md:text-left"
                >
                  <Link
                    href={`/movie/${movie.id}`}
                    className="text-gray-300 group-hover:text-indigo-400 transition-all flex items-center justify-center md:justify-start"
                  >
                    <span className="mr-2 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                    {movie.title}{" "}
                    <span className="text-xs text-gray-500 ml-2">
                      ({movie.year})
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <h2 className="text-white font-semibold text-xl border-b-2 border-indigo-500 pb-2 w-full text-center md:text-left">
              Connect With Us
            </h2>
            <div className="flex space-x-6">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-gray-300 hover:text-indigo-400 transition-all transform hover:scale-125 hover:rotate-6"
                >
                  <social.icon className="w-7 h-7" />
                </Link>
              ))}
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-lg w-full text-center">
              <p className="text-gray-400 mb-3">
                Love movies? Join our community!
              </p>
              <Link
                href="/about"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 inline-block"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 border-t border-gray-700 pt-6 text-sm flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0 text-center w-full md:w-auto">
            &copy; {currentYear} Crescent Moon. All rights reserved.
          </p>
          <div className="space-x-4 flex flex-col md:flex-row items-center text-center w-full md:w-auto">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-indigo-400 transition-colors mb-2 md:mb-0 block md:inline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-indigo-400 transition-colors block md:inline"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
