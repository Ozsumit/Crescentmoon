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
      <meta name="msvalidate.01" content="C94A436E9262EFD0C59B769DBCBF17F7" />{" "}
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
