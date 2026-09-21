"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "./LocaleProvider";
import { LOCALES, LOCALE_META } from "@/lib/i18n/dictionaries";
import { Check } from "@/components/ui/Icons";

/**
 * Globe button in the header that swaps the interface language.
 * Opens a small menu; closes on outside click, Escape or selection.
 */
export default function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t.nav.language}: ${LOCALE_META[locale].native}`}
        data-tooltip={t.nav.language}
        className="lang-btn tap-target"
      >
        <span aria-hidden className="lang-globe">
          🌍
        </span>
        <span className="lang-code" aria-hidden>
          {locale === "en" ? "EN" : locale === "hi" ? "हि" : "भो"}
        </span>
      </button>

      {open ? (
        <div role="menu" aria-label={t.nav.language} className="lang-menu">
          <p className="lang-menu-head">{t.nav.language}</p>
          {LOCALES.map((l) => {
            const m = LOCALE_META[l];
            const active = l === locale;
            return (
              <button
                key={l}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={`lang-item ${active ? "is-on" : ""}`}
              >
                <span aria-hidden className="lang-item-flag">
                  {m.flag}
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="lang-item-native">{m.native}</span>
                  <span className="lang-item-label">{m.label}</span>
                </span>
                {active ? <Check size={14} /> : null}
              </button>
            );
          })}
          <p className="lang-soon">Tamil · Telugu — coming soon</p>
        </div>
      ) : null}
    </div>
  );
}
