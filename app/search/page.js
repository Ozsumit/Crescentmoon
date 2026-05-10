import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SearchClient from "./SearchClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cmoon.sumit.info.np";

export async function generateMetadata({ searchParams }) {
  const query = searchParams.q;
  const title = query ? `Search results for "${query}" | Cmoon` : "Search Movies & TV Shows | Cmoon";
  const description = query
    ? `Find results for "${query}" on Cmoon. Stream movies and TV shows online.`
    : "Search for your favorite movies, TV shows, and anime on Cmoon.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/search${query ? `?q=${encodeURIComponent(query)}` : ""}`,
      siteName: "Cmoon",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const Search = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen bg-slate-900/90 backdrop-blur-sm fixed inset-0 z-50">
          <Loader2 className="animate-spin text-indigo-400" size={64} />
          <p className="ml-4 text-indigo-300 text-lg">Loading search page...</p>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
};

export default Search;
