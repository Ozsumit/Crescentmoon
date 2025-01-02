import SeasonInfo from "@/components/info/SeasonDetails";
import React from "react";
import { Suspense } from "react";

// Moved the fetch function outside the component
async function getData(id, seasonid) {
  if (!id || !seasonid) {
    throw new Error("Missing required parameters");
  }

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  try {
    const resp = await fetch(
      `https://api.themoviedb.org/3/tv/${id}/season/${seasonid}?api_key=${apiKey}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!resp.ok) {
      throw new Error(`Failed to fetch data: ${resp.status}`);
    }

    const data = await resp.json();
    return { data, id };
  } catch (error) {
    console.error("Error fetching season data:", error);
    throw error;
  }
}

// Loading component
const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
    <div className="text-white text-center">Loading season details...</div>
  </div>
);

// Error component
const ErrorState = ({ error }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
    <div className="text-red-400 text-center">
      Error loading season details: {error.message}
    </div>
  </div>
);

const SeasonsDetailsPage = async ({ params }) => {
  try {
    // Validate params
    if (!params?.id || !params?.seasonid) {
      throw new Error("Missing required URL parameters");
    }

    const { data, id } = await getData(params.id, params.seasonid);

    return (
      <Suspense fallback={<LoadingState />}>
        <SeasonInfo SeasonInfos={data} seriesId={id} />
      </Suspense>
    );
  } catch (error) {
    return <ErrorState error={error} />;
  }
};

export default SeasonsDetailsPage;

// Generate metadata for the page
export async function generateMetadata({ params }) {
  try {
    const { data } = await getData(params.id, params.seasonid);
    return {
      title: `${data.name || "Season Details"} | Your App Name`,
      description: data.overview || "Season details page",
    };
  } catch (error) {
    return {
      title: "Season Details | Your App Name",
      description: "Season details page",
    };
  }
}
