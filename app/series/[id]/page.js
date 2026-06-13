export const runtime = "edge";
import TvInfo from "@/components/info/TvInfo";


const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cmoon.sumit.info.np";

export async function getData(id) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // 1. Diagnostic logs to check parameters (visible in your terminal console)
  console.log("--- TMDB DIAGNOSTIC LOG ---");
  console.log("Parsed ID:", id);
  console.log("Type of ID:", typeof id);
  console.log("API Key Configured:", !!apiKey);
  
  if (apiKey) {
    console.log("API Key Preview:", apiKey.substring(0, 5) + "...");
  } else {
    console.warn("WARNING: NEXT_PUBLIC_TMDB_API_KEY is undefined.");
  }

  const url = `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&append_to_response=credits,videos`;

  try {
    const res = await fetch(url, {
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    });

    // 2. If the response fails, check the actual HTTP status
    if (!res.ok) {
      console.error(`TMDB Error Status: ${res.status} (${res.statusText})`);
      try {
        const errorBody = await res.json();
        console.error("TMDB API Error Details:", JSON.stringify(errorBody, null, 2));
      } catch {
        console.error("Could not parse TMDB error body.");
      }
      throw new Error(`Failed to Fetch data: HTTP ${res.status}`);
    }

    const data = await res.json();
    const genreArr = data.genres?.map((element) => element.name) || [];

    console.log("--- TMDB FETCH SUCCESSFUL ---");
    return { data, genreArr, id };

  } catch (error) {
    console.error("Network Fetch Exception:", error.message);
    throw error;
  }
}

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

      <TvInfo TvDetail={data} genreArr={genreArr} id={id} />
    </>
  );
};

export default TvDetail;