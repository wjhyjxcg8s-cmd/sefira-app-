"use client";

import { usePathname } from "next/navigation";

// The user-facing PWA identity (manifest + apple install tags) must never
// render on admin routes — iOS Safari picks whichever <link rel="manifest">
// is FIRST in the document, not the last, so these two identities cannot
// coexist in <head> at the same time. The admin layout supplies its own
// manifest/apple tags via the Metadata API for /admin-sefira-2026/**; this
// component supplies the user app's for everywhere else.
export default function UserPwaTags() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin-sefira-2026")) return null;

  return (
    <>
      <link rel="manifest" href="/manifest.json" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Sefira" />
      <link rel="apple-touch-icon" href="/images/sefira-logo.png" />
    </>
  );
}
