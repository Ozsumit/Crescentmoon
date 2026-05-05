import Header from "@/components/navbar/Header";
import "./globals.css";
import { Inter } from "next/font/google";
import Footer from "@/components/footer/Footer";
import AdBlocker from "@/components/filters";
import AppInstallPopup from "@/components/app-installpopup";
import SnowButton from "@/components/snowbutton"; // 1. Import the new component
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PopupDeveloperFeedback } from "@/components/feedback";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Crescent moon",
  description: "When you are wanting more entertainment",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="Cmoon" />
        <meta name="msvalidate.01" content="C94A436E9262EFD0C59B769DBCBF17F7" />
        {/* Umami */}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="ef34f090-3fa5-4f40-a41e-eb05a3710d1b"
          strategy="afterInteractive"
        />

        {/* GoatCounter */}
        <Script
          src="https://gc.zgo.at/count.js"
          data-goatcounter="https://sumit.goatcounter.com/count"
          strategy="afterInteractive"
        />

        {/* Cloudflare Insights */}
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "de022bcad822493286b101c58245c2b9"}'
          strategy="afterInteractive"
        />

        {/* Plausible */}
        <Script
          src="https://plausible.io/js/script.tagged-events.js"
          data-domain="cmoon.sumit.info.np"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <Header />
        <Analytics />
        <SpeedInsights />
        <div className="mt-0">{children} </div>
        <PopupDeveloperFeedback />

        <AdBlocker />
        <Footer />
        {/* <AppInstallPopup /> */}
      </body>
    </html>
  );
}
