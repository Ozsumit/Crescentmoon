/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this block to enable Server Actions
  experimental: {
    serverActions: true,
  },
  images: {
    domains: [
      "image.tmdb.org",
      "imgur.com",
      "arc.io",
      "cdn.mos.cms.futurecdn.net",
      "i.imgur.com",
      "via.placeholder.com",
    ],
  },
  env: {
    API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
              style-src 'self' 'unsafe-inline' https:;
              img-src 'self' data: https:;
              connect-src *;
              frame-src *;
              child-src *;
              media-src *;
              font-src 'self' https:;
              base-uri 'self';
              form-action 'self';
            `
              .replace(/\s+/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
