import Header from "@/components/navbar/Header";
import "./globals.css";
import { Inter } from "next/font/google";
import Footer from "@/components/footer/Footer";
import AdBlocker from "@/components/filters";
import WelcomeModal, { WelcomeModalTrigger } from "@/components/welcome";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PostHogProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Crescent moon",
  description: "When you are wannin more entertainment",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="msvalidate.01" content="C94A436E9262EFD0C59B769DBCBF17F7" />
        <script defer src="https://cloud.umami.is/script.js" data-website-id="ef34f090-3fa5-4f40-a41e-eb05a3710d1b"></script>
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "de022bcad822493286b101c58245c2b9"}'></script>
    <script defer data-domain="cmoon.sumit.info.np" src="https://plausible.io/js/script.tagged-events.js"></script>
      </head>
      <body className={inter.className}>
        <PostHogProvider>
          <Header />
          <Analytics />
          <SpeedInsights />
          <div className="mt-0">{children}</div>
          {/* <WelcomeModal onClose={() => {}} /> */}
          {/* <WelcomeModalTrigger>Open Welcome Guide</WelcomeModalTrigger>// Auto-show on first visit or version update
<SpeedInsights/>
// Or use the trigger button
<WelcomeModalTrigger>Open Welcome Guide</WelcomeModalTrigger> */}
          <AdBlocker />
          <Footer />
        </PostHogProvider>
      </body>{" "}
    </html>
  );
}
