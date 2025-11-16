import type { Metadata } from "next";
import localFont from "next/font/local";


import "./globals.css";
import PlausibleProvider from "next-plausible";
import { Toaster } from "@/components/ui/toaster";
import WebVitals from "@/components/web-vitals";

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
  title: "Simple fast editor",
  description: "No frills, just a simple online editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body
        className='font-sans antialiased'
      ><PlausibleProvider domain="edit0r.vercel.app">
        <WebVitals />
        {children}
        <Toaster />
        <footer className="footer p-4
    bg-transparent text-secondary text-xs
    flex items-center justify-between">
	    <div className="w-full flex flex-col md:flex-row text-gray-400 items-center justify-center">
		2025 | <b><a href="https://www.berlinersoftwareschmiede.de">Berliner Softwareschmiede</a> UG</b> (haftungsb.), In der Gasse 6, 14550 Gross Kreutz, HRB 37643, UstID DE331327207
	  </div>
	
</footer>
</PlausibleProvider>
      </body>
      
    </html>
  );
}
