"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Calendar,
  Clock,
  Play,
  Users,
  Globe,
  Tag,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AnimeDetailsPage = ({ params }) => {
  const router = useRouter();
  const [anime, setAnime] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [staff, setStaff] = useState([]);
  const [related, setRelated] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchAllData = async () => {
      if (!params?.id) {
        setError("No anime ID provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Add delay to prevent rate limiting
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        // Fetch main anime data
        const animeRes = await fetch(
          `https://api.jikan.moe/v4/anime/${params.id}`
        );
        if (!animeRes.ok) throw new Error(`Failed to fetch anime details`);
        const animeData = await animeRes.json();
        setAnime(animeData.data);

        await delay(1000); // Delay to respect rate limiting

        // Fetch characters and staff
        const charactersRes = await fetch(
          `https://api.jikan.moe/v4/anime/${params.id}/characters`
        );
        if (charactersRes.ok) {
          const charactersData = await charactersRes.json();
          setCharacters(charactersData.data);
        }

        await delay(1000);

        // Fetch staff
        const staffRes = await fetch(
          `https://api.jikan.moe/v4/anime/${params.id}/staff`
        );
        if (staffRes.ok) {
          const staffData = await staffRes.json();
          setStaff(staffData.data);
        }

        await delay(1000);

        // Fetch related anime
        const relatedRes = await fetch(
          `https://api.jikan.moe/v4/anime/${params.id}/relations`
        );
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          setRelated(relatedData.data);
        }

        await delay(1000);

        // Fetch recommendations
        const recommendationsRes = await fetch(
          `https://api.jikan.moe/v4/anime/${params.id}/recommendations`
        );
        if (recommendationsRes.ok) {
          const recommendationsData = await recommendationsRes.json();
          setRecommendations(recommendationsData.data);
        }
      } catch (error) {
        console.error("Error fetching anime data:", error);
        setError("Unable to load anime details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [params?.id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading anime details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl">No anime details available.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const RelatedAnimeSection = () => (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-white mb-4">Related Anime</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {related.map((relation) => (
          <div
            key={relation.entry[0].mal_id}
            className="bg-slate-800/50 p-4 rounded-lg shadow-lg"
          >
            <h4 className="text-indigo-400 font-medium mb-2">
              {relation.relation}
            </h4>
            {relation.entry.map((entry) => (
              <Link
                href={`/anime/${entry.mal_id}`}
                key={entry.mal_id}
                className="flex items-center text-slate-300 hover:text-indigo-400 transition-colors"
              >
                <div
                  className="w-16 h-16 bg-cover bg-center rounded mr-4"
                  style={{
                    backgroundImage: `url(${entry.images?.jpg?.image_url})`,
                  }}
                ></div>
                <span>{entry.name}</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const RecommendationsSection = () => (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-white mb-4">Recommendations</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {recommendations.slice(0, 10).map((rec) => (
          <Link
            href={`/anime/${rec.entry.mal_id}`}
            key={rec.entry.mal_id}
            className="group"
          >
            <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={rec.entry.images?.jpg?.image_url}
                    alt={rec.entry.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-sm font-medium line-clamp-2">
                      {rec.entry.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 pb-12">
      {/* Hero Section with Backdrop */}
      <div
        className="relative h-[60vh] bg-cover bg-center"
        style={{
          backgroundImage: `url(${anime.images?.jpg?.large_image_url})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-slate-900/50">
          <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8">
            <button
              onClick={() => router.back()}
              className="absolute top-4 left-4 text-white flex items-center space-x-2 hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>

            <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
              <div className="w-48 shrink-0 rounded-lg overflow-hidden shadow-2xl hidden md:block">
                <img
                  src={anime.images?.jpg?.large_image_url}
                  alt={anime.title}
                  className="w-full h-auto"
                />
              </div>

              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {anime.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span>{anime.score || "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(anime.aired?.from)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{anime.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Play className="w-4 h-4 mr-1" />
                    <span>{anime.episodes || "Unknown"} Episodes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6">
          {/* Tabs */}
          <div className="flex space-x-4 mb-6 border-b border-slate-700 overflow-x-auto">
            {["overview", "characters", "staff", "seasons"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  if (tab === "seasons") {
                    router.push(`/anime/${params.id}/seasons`);
                  } else {
                    setActiveTab(tab);
                  }
                }}
                className={`pb-3 px-4 text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "text-indigo-400 border-b-2 border-indigo-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === "overview" && (
              <>
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Synopsis
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {anime.synopsis}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Type:</span>
                        <span className="text-white">{anime.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Status:</span>
                        <span className="text-white">{anime.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Rating:</span>
                        <span className="text-white">{anime.rating}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Aired:</span>
                        <span className="text-white">
                          {anime.aired?.string}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Episodes:</span>
                        <span className="text-white">{anime.episodes}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Duration:</span>
                        <span className="text-white">{anime.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Score:</span>
                        <span className="text-white">{anime.score}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Members:</span>
                        <span className="text-white">{anime.members}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Favorites:</span>
                        <span className="text-white">{anime.favorites}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Genres
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {anime.genres?.map((genre) => (
                        <span
                          key={genre.mal_id}
                          className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-4 mt-6">
                      Producers
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {anime.producers?.map((producer) => (
                        <span
                          key={producer.mal_id}
                          className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm"
                        >
                          {producer.name}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-4 mt-6">
                      Studios
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {anime.studios?.map((studio) => (
                        <span
                          key={studio.mal_id}
                          className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm"
                        >
                          {studio.name}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-4 mt-6">
                      Themes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {anime.themes?.map((theme) => (
                        <span
                          key={theme.mal_id}
                          className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm"
                        >
                          {theme.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <RelatedAnimeSection />
                <RecommendationsSection />
              </>
            )}

            {activeTab === "characters" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {characters.map((char) => (
                  <Card
                    key={char.character.mal_id}
                    className="bg-slate-800/50 border-slate-700/50 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <CardContent className="p-4">
                      <img
                        src={char.character.images?.jpg?.image_url}
                        alt={char.character.name}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                      <h4 className="text-white font-medium text-sm mb-1">
                        {char.character.name}
                      </h4>
                      <p className="text-slate-400 text-xs">{char.role}</p>
                      {char.voice_actors?.length > 0 && (
                        <p className="text-slate-500 text-xs mt-1">
                          VA: {char.voice_actors[0].person.name}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "staff" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {staff.map((person) => (
                  <Card
                    key={person.person.mal_id}
                    className="bg-slate-800/50 border-slate-700/50 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <CardContent className="p-4">
                      <img
                        src={person.person.images?.jpg?.image_url}
                        alt={person.person.name}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                      <h4 className="text-white font-medium text-sm mb-1">
                        {person.person.name}
                      </h4>
                      <p className="text-slate-400 text-xs">
                        {person.positions.join(", ")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailsPage;
