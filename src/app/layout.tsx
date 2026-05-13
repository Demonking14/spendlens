import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import "./globals.css";

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
  title: "SpendLens",
  description: "AI spend audit setup for startups.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow"
          href="#main-content"
        >
          Skip to main content
        </a>
        <header className="border-b border-border bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link className="text-base font-semibold text-foreground" href="/">
              SpendLens
            </Link>
            <Link className="text-sm font-medium text-foreground hover:text-indigo-600" href="/audit">
              Free audit &rarr;
            </Link>
          </nav>
        </header>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
