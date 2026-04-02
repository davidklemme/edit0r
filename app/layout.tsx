import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import PlausibleProvider from "next-plausible";
import { Toaster } from "@/components/ui/toaster";
import WebVitals from "@/components/web-vitals";
import { SITE_URL, SITE_DESCRIPTION } from "@/lib/constants";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "edit0r - Browser-Native Privacy-First Text Editor",
    template: "%s | edit0r",
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "edit0r - Browser-Native Privacy-First Text Editor",
    description: "Paste, format, validate, and transform text, JSON, HTML, and CSV. No cookies, no tracking, no server-side processing.",
    url: SITE_URL,
    siteName: "edit0r",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "edit0r - Privacy-First Text Editor",
    description: "Browser-native clipboard workbench. No cookies, no tracking.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
  keywords: [
    "text editor",
    "online editor",
    "JSON editor",
    "CSV editor",
    "HTML editor",
    "privacy",
    "no cookies",
    "no tracking",
    "clipboard",
    "format",
    "validate",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <PlausibleProvider domain="edit0r.vercel.app">
          <WebVitals />
          {children}
          <Toaster />
          <footer className="p-4 bg-transparent text-xs flex items-center justify-center">
            <div className="w-full flex flex-col md:flex-row text-muted-foreground items-center justify-center gap-1">
              <span>{new Date().getFullYear()}</span>
              <span className="hidden md:inline">|</span>
              <span>
                <b>
                  <a
                    href="https://www.berlinersoftwareschmiede.de"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    Berliner Softwareschmiede
                  </a>{" "}
                  UG
                </b>{" "}
                (haftungsb.)
              </span>
              <span className="hidden md:inline">|</span>
              <span className="text-center">
                In der Gasse 6, 14550 Gross Kreutz, HRB 37643, UstID DE331327207
              </span>
            </div>
          </footer>
        </PlausibleProvider>
      </body>
    </html>
  );
}
