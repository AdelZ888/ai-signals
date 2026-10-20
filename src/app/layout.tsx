import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";

import { ConsentBanner } from "@/components/consent-banner";
import { SiteFooter } from "@/components/site-footer";
import { TerminalNav } from "@/components/terminal-nav";
import { gaBootstrap } from "@/lib/site/analytics";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "600", "700"] });

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
const TITLE = "AI Signals: AI Model API Pricing & Specs, Updated Daily";
const DESCRIPTION =
  "Track the price, context window and capabilities of every major AI model API. Compare models and estimate your monthly cost. Updated daily.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: TITLE, template: "%s | AI Signals" },
  description: DESCRIPTION,
  alternates: { types: { "application/rss+xml": [{ title: "AI Signals", url: "/rss.xml" }] } },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {GA_MEASUREMENT_ID ? (
          <>
            <Script id="ga-bootstrap" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: gaBootstrap(GA_MEASUREMENT_ID) }} />
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
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
        <TerminalNav />
        <main className="shell">{children}</main>
        <SiteFooter />
        <ConsentBanner enabled={Boolean(GA_MEASUREMENT_ID)} />
      </body>
    </html>
  );
}
