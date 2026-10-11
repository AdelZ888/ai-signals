import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";

import { GoogleAnalytics } from "@/components/google-analytics";
import { SiteFooter } from "@/components/site-footer";
import { TerminalNav } from "@/components/terminal-nav";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "600", "700"] });

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
const TITLE = "AI Signals: AI Model API Pricing & Specs, Updated Daily";
const DESCRIPTION =
  "Track the price, context window and capabilities of every major AI model API. Compare models and estimate your monthly cost. Updated daily.";
const CONSENT_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT", "LV", "LI",
  "LT", "LU", "MT", "NL", "NO", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB", "CH",
];

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: TITLE, template: "%s | AI Signals" },
  description: DESCRIPTION,
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  alternates: { canonical: "/", types: { "application/rss+xml": [{ title: "AI Signals", url: "/rss.xml" }] } },
  openGraph: {
    type: "website",
    siteName: "AI Signals",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    images: [{ url: "/api/og?title=AI%20Signals&subtitle=Every%20AI%20model%27s%20price%2C%20tracked%20daily", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

const gaBootstrap = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', region: ${JSON.stringify(CONSENT_REGIONS)}, wait_for_update: 500 });
gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
`.trim();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {GA_MEASUREMENT_ID ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
            <Script id="ga-bootstrap" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: gaBootstrap }} />
          </>
        ) : null}
        {ADSENSE_CLIENT ? (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body className={mono.variable}>
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID || undefined} />
        <TerminalNav />
        <main className="shell">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
