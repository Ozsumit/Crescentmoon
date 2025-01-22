import { Inter } from "next/font/google"
import { getServerSession } from "next-auth/next"
import SessionProvider from "@/app/components/SessionProvider"
import Header from "@/components/navbar/Header"
import Footer from "@/components/footer/Footer"
import AdBlocker from "@/components/filters"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import LoginIndicator from "@/app/components/LoginIndicator"
import { PeriodicSyncProvider } from "@/app/components/PeriodicSyncProvider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Crescent moon",
  description: "When you are wannin more entertainment",
}

export default async function RootLayout({ children }) {
  const session = await getServerSession()

  return (
    (<html lang="en">
      <head>
        <meta name="msvalidate.01" content="C94A436E9262EFD0C59B769DBCBF17F7" />
      </head>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <PeriodicSyncProvider>
            <Header />
            <LoginIndicator />
            <Analytics />
            <SpeedInsights />
            <div className="mt-0">{children}</div>
            <AdBlocker />
            <Footer />
          </PeriodicSyncProvider>
        </SessionProvider>
      </body>
    </html>)
  );
}

