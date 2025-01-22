import Header from "@/components/navbar/Header";
import "./globals.css";
import { Inter } from "next/font/google";
import Footer from "@/components/footer/Footer";
import AdBlocker from "@/components/filters";
import WelcomeModal, { WelcomeModalTrigger } from "@/components/welcome";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
// import { getServerSession } from "next-auth";
import SessionProvider from "@/app/components/SessionProvider";
import LoginIndicator from "@/app/components/LoginIndicator";
import { getServerSession } from "next-auth";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({ children }) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <Header />
          <Analytics />
          <SpeedInsights />
          <div className="mt-0">{children}</div>
          <AdBlocker />
          <LoginIndicator />
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
