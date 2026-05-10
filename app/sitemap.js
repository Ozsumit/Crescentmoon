const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cmoon.sumit.info.np";

export default async function sitemap() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // Fetch trending movies and series to include in sitemap
  const [moviesRes, seriesRes] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`),
    fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}`),
  ]);

  const movies = await moviesRes.json();
  const series = await seriesRes.json();

  const movieUrls = (movies.results || []).map((movie) => ({
    url: `${BASE_URL}/movie/${movie.id}`,
    lastModified: new Date(),
  }));

  const seriesUrls = (series.results || []).map((show) => ({
    url: `${BASE_URL}/series/${show.id}`,
    lastModified: new Date(),
  }));

  const staticRoutes = ["", "/movie", "/series", "/anime", "/about", "/contact", "/search"].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...movieUrls, ...seriesUrls];
}
