import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/app/components/Providers";
import UserPwaTags from "@/app/components/UserPwaTags";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sefira — Find Your Perfect Roommate & Home",
  description: "AI-powered roommate matching and premium sharing discovery. Built for expats, students, and modern professionals across 52+ cities.",
};

// Previously undeclared, so Next emitted only its default
// `width=device-width, initial-scale=1`. `interactiveWidget: "resizes-content"`
// makes the on-screen keyboard shrink the *layout* viewport on Chromium, which
// means 100dvh containers (e.g. the /messages chat column) resize natively with
// no JS at all. iOS Safari ignores it — that path is handled by
// useVisualViewportHeight().
//
// `viewportFit: "cover"` is what makes the layout viewport reach the physical
// bottom edge of the screen on notch/home-indicator iPhones. Under the default
// `auto`, iOS lays the page out *inside* the safe area: `position: fixed;
// bottom: 0` lands ~34px above the real bottom, that strip is painted by the
// page behind it, and it becomes visible the moment Safari's toolbar collapses
// on scroll — the floating bottom nav with a gap under it. `auto` also forces
// every `env(safe-area-inset-*)` in the app to 0px, so all the
// `calc(... + env(safe-area-inset-bottom))` spacing already written across the
// codebase was silently dead. Both are fixed by this one declaration.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preload" as="image" href="/video-poster.webp" />
        <UserPwaTags />
        <meta name="theme-color" content="#F97316" />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
