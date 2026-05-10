const BASE_URL = "https://cmoon.sumit.info.np";

export default async function sitemap() {
  const routes = ["", "/movie", "/series", "/anime", "/about", "/contact", "/search"].map(
    (route) => ({
      url: `${BASE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: route === "" ? 1 : 0.8,
    }),
  );

  return [...routes];
}
