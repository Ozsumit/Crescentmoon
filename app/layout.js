import Header from "@/components/navbar/Header";
import "./globals.css";
import { Inter } from "next/font/google";
import Footer from "@/components/footer/Footer";
import AdBlocker from "@/components/filters";
import AppInstallPopup from "@/components/app-installpopup";
import SnowButton from "@/components/snowbutton"; // 1. Import the new component
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PostHogProvider } from "./providers";

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
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="ef34f090-3fa5-4f40-a41e-eb05a3710d1b"
        ></script>
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
              posthog.init('phc_b1sOYJSoCDWzjkxPxND3RNJoG7527n2WfVIkJHTpL9W', {
                api_host: 'https://us.i.posthog.com',
                person_profiles: 'identified_only',
              })
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <PostHogProvider>
          <Header />
          <Analytics />
          <SpeedInsights />

          <div className="mt-0">{children} </div>
          <AdBlocker />
          <Footer />
          <AppInstallPopup />
        </PostHogProvider>
      </body>
    </html>
  );
}
