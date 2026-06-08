"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "tr" | "en" | "fa" | "ar" | "de" | "ru";

const VALID: readonly Lang[] = ["tr", "en", "fa", "ar", "de", "ru"];

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangContextType>({ lang: "tr", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("tr");

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("sefira-lang", l);
  };

  useEffect(() => {
    const saved = localStorage.getItem("sefira-lang") as Lang | null;
    if (saved && VALID.includes(saved)) setLangState(saved);

    const id = setInterval(() => {
      const current = localStorage.getItem("sefira-lang") as Lang | null;
      if (current && VALID.includes(current)) {
        setLangState(prev => (prev !== current ? current : prev));
      }
    }, 500);

    return () => clearInterval(id);
  }, []);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
