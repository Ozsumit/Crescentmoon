import Header from "@/components/navbar/Header";
import "./globals.css";
import { Inter } from "next/font/google";
import Footer from "@/components/footer/Footer";
import AdBlocker from "@/components/filters";
import WelcomeModal, { WelcomeModalTrigger } from "@/components/welcome";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Crescent moon",
  description: "When you are wannin more entertainment",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <div className="mt-0">{children}</div>
        {/* <WelcomeModal onClose={() => {}} /> */}
        {/* <WelcomeModalTrigger>Open Welcome Guide</WelcomeModalTrigger>// Auto-show on first visit or version update

// Or use the trigger button
<WelcomeModalTrigger>Open Welcome Guide</WelcomeModalTrigger> */}
        <AdBlocker />
        <Footer />
      </body>
    </html>
  );
}
