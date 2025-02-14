/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["image.tmdb.org", "imgur.com", "arc.io", "i.imgur.com"],
  },
  publicRuntimeConfig: {
    API_KEY: process.env.API_KEY, // Exposed to both server and client
  },
  serverRuntimeConfig: {
    SERVER_API_KEY: process.env.SERVER_API_KEY, // Accessible only on the server
  },
  experimental: {
    runtime: "edge", // Enables Edge runtime support
  },
};

module.exports = nextConfig;
