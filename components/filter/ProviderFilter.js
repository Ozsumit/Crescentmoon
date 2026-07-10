"use client";
import React from "react";
import Image from "next/image";
import useGenreStore from "@/components/zustand";

const TMDB_LOGO_BASE = "https://image.tmdb.org/t/p/w92";

const PROVIDERS = [
  {
    id: 8,
    name: "Netflix",
    logo: `${TMDB_LOGO_BASE}/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg`,
  },
  {
    id: 119,
    name: "Amazon Prime Video",
    logo: `${TMDB_LOGO_BASE}/emthp39XA2YScoYL1p0sdbAH2WA.jpg`,
  },
  {
    id: 337,
    name: "Disney+",
    logo: `${TMDB_LOGO_BASE}/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg`,
  },
  {
    id: 15,
    name: "Hulu",
    logo: `${TMDB_LOGO_BASE}/giwM8XX4V2AQb9vsoN7yti82tKK.jpg`,
  },
  {
    id: 350,
    name: "Apple TV+",
    logo: `${TMDB_LOGO_BASE}/2E03IAZsX4ZaUqM7tXlctEPMGWS.jpg`,
  },
];

const ProviderFilter = () => {
  const { activeProviders, toggleProvider, clearProviders } = useGenreStore();

  return (
    <div className="mb-10 w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Streaming Services
        </h4>
        {activeProviders?.length > 0 && (
          <button
            onClick={clearProviders}
            className="text-[10px] font-bold text-primary hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {PROVIDERS.map((provider) => {
          const isActive = activeProviders?.includes(provider.id);
          return (
            <button
              key={provider.id}
              onClick={() => toggleProvider(provider.id)}
              className={`relative flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl overflow-hidden transition-all duration-300 ring-2 ${
                isActive
                  ? "ring-primary scale-110 shadow-lg"
                  : "ring-transparent grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
              }`}
            >
              <Image
                src={provider.logo}
                alt={provider.name}
                fill
                className="object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProviderFilter;
