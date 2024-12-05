"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import EpisodeInfo from "@/components/info/EpisodeInfo";

// Function to fetch episode details from the TMDB API
async function fetchEpisodeData(id, seasonid, epid) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!id || !seasonid || !epid) {
    throw new Error("Missing required parameters");
  }

  try {
    const [seriesResp, seasonResp, episodeResp] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`),
      fetch(
        `https://api.themoviedb.org/3/tv/${id}/season/${seasonid}?api_key=${apiKey}`
      ),
      fetch(
        `https://api.themoviedb.org/3/tv/${id}/season/${seasonid}/episode/${epid}?api_key=${apiKey}`
      ),
    ]);

    if (!seriesResp.ok || !seasonResp.ok || !episodeResp.ok) {
      throw new Error("Failed to fetch data");
    }

    const seriesData = await seriesResp.json();
    const seasonData = await seasonResp.json();
    const episodeData = await episodeResp.json();

    return { seriesData, seasonData, episodeData };
  } catch (error) {
    console.error("Error fetching episode data:", error);
    throw error;
  }
}

export default function EpisodeDetailsPage() {
  const { id, seasonid, epid } = useParams(); // Access dynamic route parameters
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      setError(null);

      if (!id || !seasonid || !epid) {
        setError("Missing parameters in the URL.");
        setIsLoading(false);
        return;
      }

      try {
        const episodeData = await fetchEpisodeData(id, seasonid, epid);
        setData(episodeData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, [id, seasonid, epid]);

  if (isLoading) {
    return <div className="p-4">Loading episode details...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <h1>Error Loading Episode Details</h1>
        <p>{error}</p>
      </div>
    );
  }

  return data ? (
    <div className="p-4">
      <EpisodeInfo
        episodeDetails={data.episodeData}
        seriesId={id}
        seasonData={data.seasonData}
        seriesData={data.seriesData}
      />
    </div>
  ) : (
    <div>No data available</div>
  );
}
