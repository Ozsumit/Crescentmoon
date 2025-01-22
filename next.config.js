/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["image.tmdb.org", "imgur.com", "arc.io", "i.imgur.com"],
  },
  env: {
    API_KEY: process.env.API_KEY,
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
