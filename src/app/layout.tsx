import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import Script from "next/script";

import { GoogleAnalytics } from "@/components/google-analytics";
import { ExitSubscribe } from "@/components/exit-subscribe";
import { LocaleDocument } from "@/components/locale-document";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const heading = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const baseUrl = getSiteUrl();
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
const defaultOgParams = new URLSearchParams({
  title: "AI Signals",
  subtitle: "AI news, agents, tutorials. Builder-focused.",
  locale: "en",
  kind: "page",
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "AI Signals",
    template: "%s | AI Signals",
  },
  description: "Automated AI blog covering models, agents, tools, and ecosystem changes.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
      "fr-FR": "/fr",
    },
    types: {
      "application/rss+xml": [
        { title: "AI Signals RSS", url: "/rss.xml" },
        { title: "AI Signals RSS FR", url: "/fr/rss.xml" },
      ],
    },
  },
  openGraph: {
    type: "website",
    title: "AI Signals",
    description: "Automated AI blog covering models, agents, tools, and ecosystem changes.",
    url: "/",
    siteName: "AI Signals",
    images: [{ url: `/api/og?${defaultOgParams.toString()}`, width: 1200, height: 630, alt: "AI Signals" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Signals",
    description: "Automated AI blog covering models, agents, tools, and ecosystem changes.",
    images: [`/api/og?${defaultOgParams.toString()}`],
  },
};

const themeBootScript = `
(function() {
  try {
    var saved = localStorage.getItem('theme');
    var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    var theme = saved || (prefersLight ? 'light' : 'dark');
    var root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark');
  } catch (e) {
    var fallbackRoot = document.documentElement;
    fallbackRoot.setAttribute('data-theme', 'dark');
    fallbackRoot.classList.remove('theme-light');
    fallbackRoot.classList.add('theme-dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true, send_page_view: false });
`.trim(),
              }}
            />
          </>
        ) : null}
      </head>
      <body className={`${heading.variable} ${body.variable} antialiased`}>
        <LocaleDocument />
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID || undefined} />
        <div className="min-h-screen">
          <SiteHeader />
          {children}
          <ExitSubscribe />
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
