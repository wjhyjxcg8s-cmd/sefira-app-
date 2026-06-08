"use client";

import { AuthProvider } from "@/app/lib/AuthContext";
import { LangProvider } from "@/app/lib/LangContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LangProvider>{children}</LangProvider>
    </AuthProvider>
  );
}
