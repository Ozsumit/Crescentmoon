import SeasonInfo from "@/components/info/SeasonDetails";
import React, { Suspense } from "react";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cmoon.sumit.info.np";

/**
 * ✅ Fetch Season Data
 */
async function getData(id, seasonid) {
  if (!id || !seasonid) {
    throw new Error("Missing required parameters");
  }

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  const resp = await fetch(
    `https://api.themoviedb.org/3/tv/${id}/season/${seasonid}?api_key=${apiKey}&append_to_response=credits,videos`,
    {
      next: {
        revalidate: 3600,
      },
    },
  );

  if (!resp.ok) {
    throw new Error(`Failed to fetch data: ${resp.status}`);
  }

  const data = await resp.json();

  return { data };
}

/**
 * ✅ Loading State
 */
const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
    <div className="text-white text-center">Loading season details...</div>
  </div>
);

/**
 * ✅ Error State
 */
const ErrorState = ({ error }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
    <div className="text-red-400 text-center">
      Error loading season details: {error.message}
    </div>
  </div>
);

/**
 * ✅ Dynamic SEO Metadata
 */
export async function generateMetadata({ params }) {
  const { id, seasonid } = params;

  try {
    const { data } = await getData(id, seasonid);

    const title = `${data.name} - Watch Online | Cmoon`;

    const description =
      data.overview?.slice(0, 155) ||
      `Watch ${data.name} online in HD quality on Cmoon.`;

    const poster = data.poster_path
      ? `https://image.tmdb.org/t/p/w780${data.poster_path}`
      : `${BASE_URL}/og-banner.jpg`;

    return {
      title,
      description,

      keywords: [
        data.name,
        "season streaming",
        "watch tv season online",
        "HD streaming",
        "Cmoon",
      ],

      alternates: {
        canonical: `${BASE_URL}/series/${id}/season/${seasonid}`,
      },

      openGraph: {
        title,
        description,
        url: `${BASE_URL}/series/${id}/season/${seasonid}`,
        siteName: "Cmoon",
        type: "video.tv_show",

        images: [
          {
            url: poster,
            width: 1280,
            height: 720,
            alt: data.name,
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [poster],
      },

      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: "Season Details | Cmoon",
      description: "Watch TV season episodes online on Cmoon.",
    };
  }
}

/**
 * ✅ JSON-LD Structured Data
 */
function generateSeasonSchema(data, id, seasonid) {
  return {
    "@context": "https://schema.org",
    "@type": "TVSeason",

    name: data.name,
    description: data.overview,

    seasonNumber: data.season_number,

    numberOfEpisodes: data.episodes?.length,

    image: `https://image.tmdb.org/t/p/w780${data.poster_path}`,

    url: `${BASE_URL}/series/${id}/season/${seasonid}`,
  };
}

/**
 * ✅ Page Component
 */
const SeasonsDetailsPage = async ({ params }) => {
  const { id, seasonid } = params;

  try {
    if (!id || !seasonid) {
      throw new Error("Missing required URL parameters");
    }

    const { data } = await getData(id, seasonid);

    const jsonLd = generateSeasonSchema(data, id, seasonid);

    return (
      <>
        {/* ✅ Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />

        <Suspense fallback={<LoadingState />}>
          <SeasonInfo SeasonInfos={data} seriesId={id} />
        </Suspense>
      </>
    );
  } catch (error) {
    return <ErrorState error={error} />;
  }
};

export default SeasonsDetailsPage;
