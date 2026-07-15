"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ChatViewContextType {
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

const ChatViewContext = createContext<ChatViewContextType | undefined>(undefined);

export function ChatViewProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  return (
    <ChatViewContext.Provider value={{ isChatOpen, setIsChatOpen }}>
      {children}
    </ChatViewContext.Provider>
  );
}

export function useChatView() {
  const context = useContext(ChatViewContext);
  if (!context) throw new Error("useChatView must be used within ChatViewProvider");
  return context;
}
