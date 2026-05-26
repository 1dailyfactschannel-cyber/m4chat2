import type { ReactNode } from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { getDictionary, loadDictionary } from "./registry";
import type { Locale } from "./registry";
// Import locale dictionaries explicitly to avoid tree-shaking
import ruDict from "./locales/ru";
import enDict from "./locales/en";

loadDictionary("ru", ruDict);
loadDictionary("en", enDict);

export type { Locale } from "./registry";

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  defaultLocale = "ru",
}: {
  children: ReactNode;
  defaultLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem("m4chat-locale") as Locale | null;
    return saved && (saved === "ru" || saved === "en") ? saved : defaultLocale;
  });

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem("m4chat-locale", next);
    setLocaleState(next);
    document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      const dict = getDictionary(locale);
      return dict[key] ?? fallback ?? key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
}

export function useTranslation() {
  const { t, locale, setLocale } = useI18n();
  return { t, locale, setLocale };
}
