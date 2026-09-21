import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PlayerProvider } from "@/components/player/PlayerProvider";
import { UserProvider } from "@/components/user/UserProvider";
import WelcomeGate from "@/components/user/WelcomeGate";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MiniPlayer from "@/components/player/MiniPlayer";
import FullPlayer from "@/components/player/FullPlayer";
import QueuePanel from "@/components/player/QueuePanel";
import WelcomeToast from "@/components/layout/WelcomeToast";
import SupportPop from "@/components/support/SupportPop";
import { SITE, DEV } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: DEV.fullName, url: DEV.portfolio }],
  creator: DEV.fullName,
  publisher: DEV.fullName,
  keywords: [
    "nostalgic music player",
    "old hindi songs",
    "90s hindi songs",
    "chhath puja geet",
    "bhojpuri songs",
    "trending hindi songs",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    creator: "@harsh",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  category: "music",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0708",
  colorScheme: "dark",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}#website`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.description,
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE.url}#person` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE.url}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Person",
      "@id": `${SITE.url}#person`,
      name: DEV.fullName,
      alternateName: DEV.name,
      jobTitle: DEV.role,
      url: DEV.portfolio,
      sameAs: [DEV.portfolio, DEV.timepass],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          // Static, trusted, build-time JSON — safe to inline.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <div className="app-bg" aria-hidden />
        <div className="grain" aria-hidden />
        <div className="scanlines" aria-hidden />

        <PlayerProvider>
          <UserProvider>
          <div className="flex min-h-dvh flex-col">
            <Header />
            <main id="main" className="player-gap flex-1">
              {children}
            </main>
            <Footer />
          </div>

          <MiniPlayer />
          <FullPlayer />
          <QueuePanel />
          <WelcomeToast />
          <WelcomeGate />
          <SupportPop />
          </UserProvider>
        </PlayerProvider>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
