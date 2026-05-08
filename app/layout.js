import Header from "@/components/navbar/Header";
import "./globals.css";
import { Inter } from "next/font/google";
import Footer from "@/components/footer/Footer";
import AdBlocker from "@/components/filters";
import AppInstallPopup from "@/components/app-installpopup";
import SnowButton from "@/components/snowbutton"; // 1. Import the new component
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import DeveloperFeedback from "@/components/feedback";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Crescent moon",
  description: "When you are wanting more entertainment",
  icons: {
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon256x256.png", sizes: "256x256", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="Cmoon" />
        <meta name="msvalidate.01" content="C94A436E9262EFD0C59B769DBCBF17F7" />
        <link
          rel="icon"
          type="image/png"
          sizes="256x256"
          href="/favicon256x256.png"
        />

        {/* Umami */}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="ef34f090-3fa5-4f40-a41e-eb05a3710d1b"
        ></Script>
        <script
          data-goatcounter="https://sumit.goatcounter.com/count"
          async
          src="//gc.zgo.at/count.js"
        ></script>
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "de022bcad822493286b101c58245c2b9"}'
        ></script>
        <script
          defer
          data-domain="cmoon.sumit.info.np"
          src="https://plausible.io/js/script.tagged-events.js"
        ></script>
      </head>
      <body className={inter.className}>
        <Header />
        <Analytics />
        <SpeedInsights />
        <div className="mt-0">{children} </div>
        <AdBlocker />
        <Footer />
        {/* <AppInstallPopup /> */}
      </body>
    </html>
  );
}
