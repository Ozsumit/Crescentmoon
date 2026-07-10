"use client";
import React from "react";
import Image from "next/image";
import useGenreStore from "@/components/zustand";

const PROVIDERS = [
  { id: 8, name: "Netflix", logo: "https://www.themoviedb.org/t/p/original/pTpxMq1Sdi96pS6S6nOtkLsOEih.jpg" },
  { id: 119, name: "Amazon Prime", logo: "https://www.themoviedb.org/t/p/original/dg9u3Sfs6X6pY7Y3YmDAnf6I49I.jpg" },
  { id: 337, name: "Disney+", logo: "https://www.themoviedb.org/t/p/original/7rwE0vEbs9IixU5JbVTz95S2S7X.jpg" },
  { id: 15, name: "Hulu", logo: "https://www.themoviedb.org/t/p/original/zI3Ykqc7GvNcS00FTa0umAa9YvI.jpg" },
  { id: 350, name: "Apple TV+", logo: "https://www.themoviedb.org/t/p/original/69Sns8WoetA6u6dzRhtwi7Mvth4.jpg" },
  { id: 232, name: "HBO Max", logo: "https://www.themoviedb.org/t/p/original/8v99Y8T76S2S6D7v1V8k3VlY9S8.jpg" },
  { id: 384, name: "HBO", logo: "https://www.themoviedb.org/t/p/original/9rM8i6Wq5Y2V6S2n0Y8v99Y8T76.jpg" },
];

const ProviderFilter = () => {
  const { activeProviders, toggleProvider, clearProviders } = useGenreStore();

  return (
    <div className="mb-10 w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
         <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Streaming Services</h4>
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
                isActive ? "ring-primary scale-110 shadow-lg" : "ring-transparent grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
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
