"use client";

import { useEffect } from "react";

// Marks this device as "the S-Admin install" so the homepage guard
// (app/page.tsx) knows to bounce standalone launches that iOS opens at "/"
// back to the admin panel. Set whenever we're already running standalone
// (already installed) or the launch carries the manifest's start_url query
// tag (?source=pwa-admin, i.e. this very launch is what triggered install).
export default function AdminPwaFlag() {
  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const fromInstallLaunch = new URLSearchParams(window.location.search).get("source") === "pwa-admin";

    if (isStandalone || fromInstallLaunch) {
      localStorage.setItem("sefira_pwa_admin", "1");
    }
  }, []);

  return null;
}
