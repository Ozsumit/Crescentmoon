import TvInfo from "@/components/info/TvInfo";
import { cache } from "react";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cmoon.sumit.info.np";

export const getData = cache(async (id) => {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!apiKey) {
    throw new Error("TMDB API Key is not configured.");
  }

  const url = `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&append_to_response=credits,videos,recommendations,reviews`;

  try {
    const res = await fetch(url, {
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to Fetch data: HTTP ${res.status}`);
    }

    const data = await res.json();
    const genreArr = data.genres?.map((element) => element.name) || [];

    return { data, genreArr, id };
  } catch (error) {
    console.error("Network Fetch Exception:", error.message);
    throw error;
  }
});

/**
 * ✅ Dynamic SEO Metadata
 */
export async function generateMetadata({ params }) {
  // Await params for Next.js 15 compatibility
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const { data, genreArr } = await getData(id);

    const title = `${data.name} (${data.first_air_date?.slice(
      0,
      4,
    )}) - Watch Online | Cmoon`;

    const description =
      data.overview?.slice(0, 155) ||
      `Watch ${data.name} online in HD quality on Cmoon.`;

    const poster = data.poster_path
      ? `https://image.tmdb.org/t/p/w780${data.poster_path}`
      : `${BASE_URL}/og-banner.jpg`;

    const keywords = [
      data.name,
      ...genreArr,
      "watch tv shows online",
      "stream series",
      "HD series",
      "anime streaming",
      "Cmoon",
    ];

    return {
      title,
      description,
      keywords,

      alternates: {
        canonical: `${BASE_URL}/series/${id}`,
      },

      openGraph: {
        title,
        description,
        url: `${BASE_URL}/series/${id}`,
        siteName: "Cmoon",
        images: [
          {
            url: poster,
            width: 1280,
            height: 720,
            alt: data.name,
          },
        ],
        locale: "en_US",
        type: "video.tv_show",
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
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },

      metadataBase: new URL(BASE_URL),

      category: "entertainment",
    };
  } catch (error) {
    console.error("Error generating TV metadata:", error);
    return {
      title: "Series Not Found | Cmoon",
      description: "The requested TV series could not be found.",
    };
  }
}

/**
 * ✅ JSON-LD Structured Data
 */
function generateTvSchema(data, id) {
  return {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: data.name,
    image: `https://image.tmdb.org/t/p/w780${data.poster_path}`,
    description: data.overview,
    datePublished: data.first_air_date,

    aggregateRating: data.vote_average
      ? {
          "@type": "AggregateRating",
          ratingValue: data.vote_average,
          ratingCount: data.vote_count,
        }
      : undefined,

    numberOfEpisodes: data.number_of_episodes,
    numberOfSeasons: data.number_of_seasons,

    url: `${BASE_URL}/series/${id}`,
  };
}

const TvDetail = async ({ params }) => {
  // Await params for Next.js 15 compatibility
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const { data, genreArr } = await getData(id);

  const jsonLd = generateTvSchema(data, id);

  return (
    <>
      {/* ✅ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <TvInfo
        TvDetail={data}
        genreArr={genreArr}
        id={id}
        castInfo={data.credits?.cast?.slice(0, 10) || []}
        recommendations={data.recommendations?.results?.slice(0, 6) || []}
        reviews={data.reviews?.results?.slice(0, 5) || []}
      />
    </>
  );
};

export default TvDetail;