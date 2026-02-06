import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";

import { LocaleDocument } from "@/components/locale-document";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

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

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
      </head>
      <body className={`${heading.variable} ${body.variable} antialiased`}>
        <LocaleDocument />
        <div className="min-h-screen">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
