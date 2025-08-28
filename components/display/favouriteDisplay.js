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

const FavoriteDisplay = ({
  filteredFavorites,
  activeTab,
  onTabChange,
  toggleFavorite,
}) => {
  const [viewMode, setViewMode] = useState("grid");
  const [isSaving, setIsSaving] = useState(false);
  const favoriteContainerRef = useRef(null);

  const handleSaveAsPicture = async () => {
    if (favoriteContainerRef.current) {
      setIsSaving(true);
      try {
        const canvas = await html2canvas(favoriteContainerRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#0f172a",
        });

        const link = document.createElement("a");
        link.download = `my-favorites-${
          new Date().toISOString().split("T")[0]
        }.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error("Error saving image:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="w-full">
      <div
        ref={favoriteContainerRef}
        // Ensure the main container is a flex column and has a minimum height.
        // This keeps the header at the top and allows the content area to grow.
        className="bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-700/50 flex flex-col min-h-[300px]"
      >
        {/* Header - This section is always rendered (contains view toggle and tab filter) */}
        {/* It is outside the conditional rendering of favorites/empty state */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Your commented-out H2 */}
          {/* <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="text-indigo-400" size={28} />
            My Favorites
          </h2> */}

          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <List size={18} />
              </button>
            </div>

            {/* Tab Filter */}
            <div className="flex justify-center ">
              <div className="flex bg-slate-800 rounded-lg p-1">
                {[
                  { name: "all", icon: Star, label: "All" },
                  { name: "movies", icon: Film, label: "Movies" },
                  { name: "series", icon: Tv, label: "Series" },
                ].map(({ name, icon: Icon, label }) => (
                  <button
                    key={name}
                    onClick={() => onTabChange(name)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors 
                         flex items-center gap-2 ${
                           activeTab === name
                             ? "bg-indigo-600 text-white"
                             : "text-slate-300 hover:text-white"
                         }`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button (kept commented out as in original) */}
            {/* <button
              onClick={handleSaveAsPicture}
              disabled={isSaving || filteredFavorites.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 
                       text-white px-4 py-2 rounded-lg transition-colors 
                       flex items-center gap-2 text-sm"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Download size={16} />
              )}
              <span className="hidden sm:inline">
                {isSaving ? "Saving..." : "Save"}
              </span>
            </button> */}
          </div>
        </div>

        {/* Content Area - Conditionally renders either favorites or the empty message below the fixed header */}
        {filteredFavorites.length > 0 ? (
          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                : "space-y-4"
            }`}
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
          // This is the "No favorites yet" message within FavoriteDisplay.
          // It fills the remaining space below the header and centers its content.
          <div className="text-center py-16 flex-grow flex flex-col items-center justify-center">
            <Heart className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No favorites yet
            </h3>
            <p className="text-slate-400">
              Start adding movies and shows to your favorites!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoriteDisplay;
