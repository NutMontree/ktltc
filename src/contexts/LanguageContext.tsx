"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LocaleId, LOCALES, DICTIONARIES } from "@/locales/dictionaries";

interface LanguageContextType {
  locale: LocaleId;
  setLocale: (locale: LocaleId) => void;
  t: (key: string, fallback?: string) => string;
  currentLocaleName: string;
  currentLocaleIcon: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleId>("th-std");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("ktl-locale") as LocaleId;
    if (saved && LOCALES.some(l => l.id === saved)) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: LocaleId) => {
    setLocaleState(newLocale);
    localStorage.setItem("ktl-locale", newLocale);
  };

  // The translation function
  const t = (key: string, fallback?: string): string => {
    if (!mounted) return fallback || key;
    
    const dict = DICTIONARIES[locale];
    if (dict && dict[key]) {
      return dict[key];
    }
    
    // Fallback to standard Thai if key not found in current persona
    if (locale !== "th-std" && DICTIONARIES["th-std"][key]) {
      return DICTIONARIES["th-std"][key];
    }

    return fallback || key;
  };

  const currentLocaleObj = LOCALES.find(l => l.id === locale) || LOCALES[0];

  return (
    <LanguageContext.Provider 
      value={{ 
        locale, 
        setLocale, 
        t, 
        currentLocaleName: currentLocaleObj.name,
        currentLocaleIcon: currentLocaleObj.icon
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
