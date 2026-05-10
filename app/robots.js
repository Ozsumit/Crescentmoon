export default function robots() {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cmoon.sumit.info.np";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/abmin/", "/admin/", "/login/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
