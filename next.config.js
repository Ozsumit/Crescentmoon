/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["image.tmdb.org", "imgur.com", "arc.io", "i.imgur.com"],
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
              frame-src
              *
                
              child-src
                *
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
