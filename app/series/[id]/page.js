import dynamic from "next/dynamic";

const TvInfo = dynamic(() => import("@/components/info/TvInfo"));

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cmoon.sumit.info.np";

export async function getData(id) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&append_to_response=credits,videos`,
    {
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    },
  );

  // Check errors first
  if (!res.ok) {
    throw new Error("Failed to Fetch data");
  }

  const data = await res.json();

  // Safe genres mapping
  const genreArr = data.genres?.map((element) => element.name) || [];

  return { data, genreArr, id };
}

/**
 * ✅ Dynamic SEO Metadata
 */
export async function generateMetadata({ params }) {
  const { id } = params;

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
  const { id } = params;

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
