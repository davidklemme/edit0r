import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from 'next/font/google'


import "./globals.css";

// const inter = Inter({ 
//   subsets: ['latin'],
//   weight: ['400', '600', '700', '800'],
//   variable: '--font-inter',
// })

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
      >
        {children}
      </body>
    </html>
  );
}
