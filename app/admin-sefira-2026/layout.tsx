import type { Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/admin-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "S-Admin",
  },
  icons: {
    apple: "/icons/admin-192.png",
  },
  // Next's appleWebApp resolver only emits the newer standardized
  // `mobile-web-app-capable`, not the legacy `apple-mobile-web-app-capable`
  // that iOS Safari has historically keyed on (the root layout hand-writes
  // both). Add it explicitly so admin installs get the same signal.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
