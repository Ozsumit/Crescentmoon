import Header from "@/components/navbar/Header";
import "./globals.css";
import { Inter } from "next/font/google";
import Footer from "@/components/footer/Footer";
import AppInstallPopup from "@/components/app-installpopup";
import SnowButton from "@/components/snowbutton";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PopupDeveloperFeedback } from "@/components/feedback";
import Script from "next/script";
import CookieConsent from "@/components/cookies";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Better CLS + SEO
  preload: true,
});

const BASE_URL = "https://cmoon.sumit.info.np";

export const metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "Cmoon - Watch Movies & TV Shows Online",
    template: "%s | Cmoon",
  },

  description:
    "Stream movies and TV shows online in HD quality on Cmoon. Fast, responsive and entertainment-focused streaming platform.",

  keywords: [
    "Cmoon",
    "Crescent Moon",
    "watch movies online",
    "stream tv shows",
    "HD streaming",
    "movies online",
    "anime streaming",
    "tv series",
  ],

  authors: [{ name: "Sumit Pokhrel" }],
  creator: "Sumit Pokhrel",
  publisher: "Cmoon",

  applicationName: "Cmoon",

  alternates: {
    canonical: BASE_URL,
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  category: "entertainment",

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon0.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png" }],
  },

  manifest: "/manifest.json",

  openGraph: {
    title: "Cmoon - Watch Movies & TV Shows Online",
    description:
      "Watch movies, TV shows and anime online in HD quality on Cmoon.",
    url: BASE_URL,
    siteName: "Cmoon",
    locale: "en_US",
    type: "website",

    images: [
      {
        url: `${BASE_URL}/og-banner.jpg`,
        width: 1200,
        height: 630,
        alt: "Cmoon",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Cmoon - Watch Movies & TV Shows Online",
    description:
      "Watch movies, TV shows and anime online in HD quality on Cmoon.",
    images: [`${BASE_URL}/og-banner.jpg`],
  },

  appleWebApp: {
    capable: true,
    title: "Cmoon",
    statusBarStyle: "black-translucent",
  },

  verification: {
    other: {
      "msvalidate.01": "C94A436E9262EFD0C59B769DBCBF17F7",
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme Color */}
        <meta name="theme-color" content="#000000" />

        {/* Apple */}
        <meta name="apple-mobile-web-app-title" content="Cmoon" />
        <meta name="apple-mobile-web-app-capable" content="yes" />

        {/* Mobile Optimization */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />

        {/* Preconnects */}
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />

        {/* Umami */}

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Cmoon",
              alternateName: "Crescent Moon",
              url: BASE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: `${BASE_URL}/search/{search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>

      <body
        className={`${inter.className} bg-neutral-950 text-white antialiased`}
      >
        <Header />

        <Analytics />
        <SpeedInsights />

        <main>{children}</main>
        <CookieConsent />
        <PopupDeveloperFeedback />

        {/* <AdBlocker /> */}
        {/* <AppInstallPopup /> */}

        <Footer />

        {/* <SnowButton /> */}
      </body>
    </html>
  );
}
