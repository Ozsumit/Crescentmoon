import React from "react";
import TvPagination from "../pagination/TvPagination";
import TvCards from "./TvCards";
import { Tv } from "lucide-react";

const TvDisplay = ({ series, pageid }) => {
  return (
    <div className="min-h-screen w-full bg-background text-foreground selection:bg-primary/30">
      {/* --- Ambient Background Glow (Blue/Purple for TV) --- */}
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/10 via-secondary/5 to-transparent blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 md:px-10 lg:px-16 py-16">
        {/* --- Header Section --- */}
        <div className="mb-16 flex flex-col items-start gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary backdrop-blur-md">
            <Tv size={12} />
            <span>On Air</span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight md:text-7xl text-foreground">
            TV Series
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground">
            Binge-worthy collections, trending seasons, and the best of
            television.
          </p>
        </div>

        {/* --- Card Grid --- */}
        <div
          id="tv-shows"
          className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 xl:gap-8"
        >
          {series.map((serie) => (
            <div key={serie.id} className="w-full h-full">
              <TvCards TvCard={serie} />
            </div>
          ))}
        </div>

        {/* --- Pagination Section --- */}
        <div className="mt-24 flex justify-center">
          <div className="rounded-2xl border border-border bg-card/50 p-4 backdrop-blur-xl shadow-2xl">
            <TvPagination pageid={pageid} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TvDisplay;
