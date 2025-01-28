import React, { useState, useRef } from "react";
import {
  Download,
  Star,
  Heart,
  Grid,
  List,
  Film,
  Tv,
  Sparkles,
} from "lucide-react";
import html2canvas from "html2canvas";
import FavoriteCard from "./favouritecARD";
import { random } from "lodash";

// Animated Background Component
const AnimatedBackground = ({ type }) => {
  const backgrounds = {
    all: "bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900",
    series: "bg-gradient-to-br from-teal-900 via-emerald-900 to-cyan-900",
    movies: "bg-gradient-to-br from-red-900 via-rose-900 to-pink-900",
  };

  return (
    <div
      className={`absolute inset-0 opacity-20 ${backgrounds[type]} animate-background bg-gradient-to-r from-transparent to-transparent animate-pulse`}
    />
  );
};

// Floating Element Component
const FloatingElement = ({ icon, size = 40, animationDuration = "6s" }) => {
  const randomPosition = {
    top: `${random(5, 90)}%`,
    left: `${random(5, 90)}%`,
    animationDelay: `${random(0, 5)}s`,
  };

  return (
    <div
      className="absolute z-0 animate-float opacity-30 text-slate-500"
      style={{
        top: randomPosition.top,
        left: randomPosition.left,
        animationDuration: animationDuration,
        animationDelay: randomPosition.animationDelay,
      }}
    >
      {React.cloneElement(icon, { size })}
    </div>
  );
};

// FavoriteDisplay Component
const FavoriteDisplay = ({
  filteredFavorites,
  activeTab,
  onTabChange,
  toggleFavorite,
}) => {
  const [viewMode, setViewMode] = useState("grid");
  const [isSaving, setIsSaving] = useState(false);
  const favoriteContainerRef = useRef(null);

  // Save the current screen using html2canvas
  const handleSaveAsPicture = async () => {
    if (favoriteContainerRef.current) {
      setIsSaving(true);
      try {
        const canvas = await html2canvas(favoriteContainerRef.current, {
          scale: 3,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: null,
          imageTimeout: 0,
        });

        const link = document.createElement("a");
        link.download = `favorites_${
          new Date().toISOString().split("T")[0]
        }.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error("Error capturing screen:", error);
        alert("Failed to save image. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div
      ref={favoriteContainerRef}
      className="relative min-h-screen bg-slate-900 rounded-2xl p-6 overflow-hidden shadow-2xl"
    >
      {/* Animated Background */}
      <AnimatedBackground type={activeTab} />

      {/* Header with Save Button */}
      <div className="relative z-10 flex justify-between items-center mb-8">
        <h1 className="text-white text-4xl font-bold tracking-wide flex items-center space-x-3">
          <Sparkles className="text-indigo-400 animate-pulse" size={36} />
          <span>
            Your
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text ml-2">
              Favorites
            </span>
          </span>
        </h1>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="bg-slate-800/70 backdrop-blur-md rounded-full p-1 flex items-center space-x-1 ring-2 ring-slate-700/50">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-full transition-all duration-300 ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white scale-110"
                  : "text-slate-400 hover:bg-slate-700"
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-full transition-all duration-300 ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white scale-110"
                  : "text-slate-400 hover:bg-slate-700"
              }`}
            >
              <List size={20} />
            </button>
          </div>

          {/* Save Button */}
          {/* <button
            onClick={handleSaveAsPicture}
            disabled={isSaving}
            className={`bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full transition-all duration-300 flex items-center space-x-2 
              ${isSaving ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
            `}
          >
            {isSaving ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <Download size={20} />
                <span className="hidden md:inline">Save</span>
              </>
            )}
          </button> */}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="relative z-10 flex items-center justify-center mb-8">
        <div className="inline-flex bg-slate-800/70 backdrop-blur-md rounded-full p-1 space-x-1 ring-2 ring-slate-700/50">
          {[
            { name: "all", icon: Star },
            { name: "series", icon: Tv },
            { name: "movies", icon: Film },
          ].map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => onTabChange(name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 
                ${
                  activeTab === name
                    ? "bg-indigo-600 text-white shadow-lg scale-105"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
            >
              <Icon size={16} />
              <span>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Favorites Grid/List */}
      <div className="relative z-10">
        {filteredFavorites.length > 0 ? (
          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                : "space-y-4"
            } animate-fade-in`}
          >
            {filteredFavorites.map((favorite) => (
              <FavoriteCard
                key={favorite.id}
                favoriteItem={favorite}
                viewMode={viewMode}
                toggleFavorite={() => toggleFavorite(favorite)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-12 animate-pulse">
            No favorites found. Start adding some!
          </div>
        )}
      </div>

      {/* Floating Elements */}
      {["Heart", "Star", "Film", "Tv"].map((IconName, index) => (
        <FloatingElement
          key={index}
          icon={React.createElement({ Heart, Star, Film, Tv }[IconName])}
          size={random(30, 50)}
          animationDuration={`${random(5, 15)}s`}
        />
      ))}
    </div>
  );
};

export default FavoriteDisplay;
