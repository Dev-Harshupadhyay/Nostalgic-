"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DICTIONARIES, LOCALES, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

const KEY = "nostalgic:locale";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dictionary;
  hydrated: boolean;
};

const LocaleContext = createContext<Ctx | null>(null);

function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

/**
 * Language state for the whole app.
 *
 * The choice is remembered in localStorage; on a first visit we take a hint
 * from the browser's own language list so a Hindi phone starts in Hindi. The
 * first render is always the server default ("en") to avoid a hydration
 * mismatch — the stored locale is applied immediately after mount.
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let next: Locale | null = null;
    try {
      const stored = window.localStorage.getItem(KEY);
      if (isLocale(stored)) next = stored;
    } catch {
      /* storage blocked — stay on the default */
    }

    if (!next) {
      const langs = navigator.languages ?? [navigator.language];
      for (const l of langs) {
        const tag = l.toLowerCase();
        if (tag.startsWith("bho")) {
          next = "bho";
          break;
        }
        if (tag.startsWith("hi")) {
          next = "hi";
          break;
        }
      }
    }

    if (next) setLocaleState(next);
    setHydrated(true);
  }, []);

  /* Keep <html lang> honest for screen readers and search engines. */
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = locale === "en" ? "en-IN" : locale === "hi" ? "hi-IN" : "bho";
  }, [locale, hydrated]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ locale, setLocale, t: DICTIONARIES[locale], hydrated }),
    [locale, setLocale, hydrated]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n must be used inside <LocaleProvider>");
  return ctx;
}
