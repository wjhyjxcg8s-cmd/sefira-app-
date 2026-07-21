"use client";

import { AuthProvider } from "@/app/lib/AuthContext";
import { LangProvider } from "@/app/lib/LangContext";
import { ProfileDrawerProvider } from "@/app/lib/ProfileDrawerContext";
import { ChatViewProvider } from "@/app/lib/ChatViewContext";
import { UnreadMessagesProvider } from "@/app/lib/useUnreadMessages";
import ProfileDrawer from "@/app/components/ProfileDrawer";
import BottomNavBar from "@/app/components/BottomNavBar";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LangProvider>
        <ProfileDrawerProvider>
          <ChatViewProvider>
            <UnreadMessagesProvider>
              {children}
              <ProfileDrawer />
              <BottomNavBar />
            </UnreadMessagesProvider>
          </ChatViewProvider>
        </ProfileDrawerProvider>
      </LangProvider>
    </AuthProvider>
  );
}
