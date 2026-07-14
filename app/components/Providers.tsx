"use client";

import { AuthProvider } from "@/app/lib/AuthContext";
import { LangProvider } from "@/app/lib/LangContext";
import { ProfileDrawerProvider } from "@/app/lib/ProfileDrawerContext";
import ProfileDrawer from "@/app/components/ProfileDrawer";
import BottomNavBar from "@/app/components/BottomNavBar";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LangProvider>
        <ProfileDrawerProvider>
          {children}
          <ProfileDrawer />
          <BottomNavBar />
        </ProfileDrawerProvider>
      </LangProvider>
    </AuthProvider>
  );
}
