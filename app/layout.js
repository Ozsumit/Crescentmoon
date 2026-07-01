import Header from "@/components/navbar/Header";
import "./globals.css";
import Script from "next/script"; // <--- Make sure this line is here!
import dynamic from "next/dynamic";
import ThemeWrapper from "@/components/themewrappr";
import Footer from "@/components/footer/Footer";
import CookieConsent from "@/components/cookies";
// import LiteModeBanner from "@/components/litemodebanner";

const PopupDeveloperFeedback = dynamic(() =>
  import("@/components/feedback").then((mod) => mod.PopupDeveloperFeedback),
);

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

        <meta
          name="google-adsense-account"
          content="ca-pub-1069983810172301"
        ></meta>

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
        {/* <!-- Cloudflare Web Analytics --> */}
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="ef34f090-3fa5-4f40-a41e-eb05a3710d1b"
        ></Script>
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "x8f0e4qaxu");
          `}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9B1XNB1F0D"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-9B1XNB1F0D');
          `}
        </Script>
        <Script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "de022bcad822493286b101c58245c2b9"}'
        ></Script>
        {/* <!-- End Cloudflare Web Analytics --> */}
        <Script
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

      <body className="bg-slate-950 text-white antialiased">
        <ThemeWrapper>
          <Header />
          {/* <LiteModeBanner /> */}

          <main>{children}</main>
          {/* <CookieConsent />
          <PopupDeveloperFeedback />
          <main>{children}</main> */}
          <CookieConsent />
          <PopupDeveloperFeedback />

          <Footer />
          {/* </ThemeWrapper> */}
          {/* <Footer /> */}
        </ThemeWrapper>
      </body>
    </html>
  );
}
