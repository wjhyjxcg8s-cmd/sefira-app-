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
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
