"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ProfileDrawerContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

const ProfileDrawerContext = createContext<ProfileDrawerContextType | undefined>(undefined);

export function ProfileDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ProfileDrawerContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </ProfileDrawerContext.Provider>
  );
}

export function useProfileDrawer() {
  const context = useContext(ProfileDrawerContext);
  if (!context) throw new Error("useProfileDrawer must be used within ProfileDrawerProvider");
  return context;
}