/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Prevents Cloudflare Worker resource errors when loading images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "imgur.com",
      },
      {
        protocol: "https",
        hostname: "arc.io",
      },
      {
        protocol: "https",
        hostname: "cdn.mos.cms.futurecdn.net",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
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

module.exports = nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());