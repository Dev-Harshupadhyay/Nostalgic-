"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, Close, ExternalLink } from "@/components/ui/Icons";
import { DEV } from "@/lib/site";
import LanguageSwitch from "@/components/i18n/LanguageSwitch";
import { useI18n } from "@/components/i18n/LocaleProvider";

export const TABS = [
  { href: "/", label: "Home", emoji: "🏠", hint: "Overview & featured" },
  { href: "/evergreen", label: "Evergreen", emoji: "✨", hint: "2000s solid hits" },
  { href: "/favourites", label: "Favourites", emoji: "❤️", hint: "Your saved playlist" },
  { href: "/old-songs", label: "Old Songs", emoji: "🎵", hint: "Memories" },
  { href: "/singles", label: "Singles", emoji: "💿", hint: "One song, one mood" },
  { href: "/trending", label: "New & Trending", emoji: "🔥", hint: "What's new" },
  { href: "/chhath", label: "Chhath Puja", emoji: "🪔", hint: "Traditional vibes" },
  { href: "/bhojpuri", label: "Bhojpuri", emoji: "🎤", hint: "Desi vibes" },
  { href: "/live", label: "Live Song", emoji: "📡", hint: "Play live from YouTube" },
  { href: "/search", label: "Search", emoji: "🔎", hint: "Find any song" },
] as const;

function Hamburger({ open }: { open: boolean }) {
  return (
    <>
      <span className="burger-halo" aria-hidden />
      <span className={`burger ${open ? "is-open" : ""}`} aria-hidden>
        <span className="burger-bars">
          <span />
          <span />
          <span />
        </span>
      </span>
    </>
  );
}

export default function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const labelFor = (href: string) =>
    ({
      "/": t.nav.home,
      "/evergreen": t.nav.evergreen,
      "/favourites": t.nav.favourites,
      "/old-songs": t.nav.oldSongs,
      "/singles": t.nav.singles,
      "/trending": t.nav.trending,
      "/chhath": t.nav.chhath,
      "/bhojpuri": t.nav.bhojpuri,
      "/live": t.nav.live,
      "/search": t.nav.search,
    })[href];
  const navRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  /* Keep the active tab centred in the mobile rail. */
  useEffect(() => {
    const nav = navRef.current;
    const el = nav?.querySelector<HTMLElement>('[data-active="true"]');
    if (!nav || !el) return;
    nav.scrollTo({
      left: Math.max(el.offsetLeft - nav.clientWidth / 2 + el.clientWidth / 2, 0),
      behavior: "smooth",
    });
  }, [pathname]);

  /* Close the drawer on navigation. */
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  /* Drawer: scroll lock, focus trap, Escape, focus restore. */
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const firstLink = drawerRef.current?.querySelector<HTMLElement>("a, button");
    firstLink?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      triggerRef.current?.focus();
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50">
      <a href="#main" className="sr-only-focusable btn btn-glow absolute left-4 top-3 z-[90] px-4 py-2 text-sm">
        Skip to content
      </a>

      <div className="border-b border-white/8 bg-[#0b0708]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-5">
          {/* Hamburger — primary nav on mobile, "More" on desktop */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : t.nav.menu}
            aria-expanded={menuOpen}
            aria-controls="main-drawer"
            data-tooltip={t.nav.menu}
            className="burger-btn tap-target shrink-0"
          >
            <Hamburger open={menuOpen} />
          </button>

          <LanguageSwitch />

          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label="Nostalgic Music Player — home"
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ffd390] via-[#e8a33d] to-[#c9662b] text-[#150c05] shadow-[0_8px_24px_-10px_rgba(232,163,61,0.9)]">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
                <path d="M9 18.2V6.8l10-2v10.1a3 3 0 1 1-1.6-2.66V7.1l-6.8 1.36v9.74A3 3 0 1 1 9 15.54v2.66z" />
              </svg>
            </span>
            <span className="hidden flex-col leading-tight xs:flex sm:flex">
              <span className="text-[0.95rem] font-extrabold tracking-tight">
                <span className="warm-text">Nostalgic</span>
              </span>
              <span className="text-[0.58rem] uppercase tracking-[0.2em] text-white/40">
                Music Player
              </span>
            </span>
          </Link>

          {/* Desktop tab rail */}
          <nav
            ref={navRef}
            className="scroll-x hidden flex-1 items-center gap-1 px-1 lg:flex"
            aria-label="Main navigation"
          >
            {TABS.map((tab) => {
              const active = isActive(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  data-active={active}
                  aria-current={active ? "page" : undefined}
                  className="tab-link"
                >
                  <span aria-hidden className="text-[0.95em]">
                    {tab.emoji}
                  </span>
                  <span>{labelFor(tab.href) ?? tab.label}</span>
                  {active ? <span className="tab-underline" aria-hidden /> : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1 lg:hidden" />

          <Link
            href="/search"
            aria-label="Search music"
            data-tooltip="Search"
            className="icon-btn tap-target h-10 w-10 shrink-0 border border-white/12 text-white/70 hover:text-white lg:hidden"
          >
            <Search size={17} />
          </Link>

          <Link
            href="/support"
            className="btn btn-glow hidden shrink-0 px-4 py-2 text-[0.78rem] sm:inline-flex"
          >
            Support Dev Harsh ❤️
          </Link>
        </div>

        {/* Mobile tab rail (secondary, scrollable) */}
        <nav
          className="scroll-x flex items-center gap-1 border-t border-white/6 px-3 py-1.5 lg:hidden"
          aria-label="Section navigation"
        >
          {TABS.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                data-active={active}
                aria-current={active ? "page" : undefined}
                className="tab-link !text-[0.8rem]"
              >
                <span aria-hidden>{tab.emoji}</span>
                <span>{labelFor(tab.href) ?? tab.label}</span>
                {active ? <span className="tab-underline" aria-hidden /> : null}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Drawer */}
      {menuOpen ? (
        <div className="fixed inset-0 z-[85]" role="presentation">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="fade-in absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
          />
          <div
            id="main-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="glass drawer-in absolute inset-y-0 left-0 flex w-[min(86vw,340px)] flex-col"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3.5">
              <div>
                <p className="text-sm font-extrabold">
                  <span className="warm-text">Nostalgic</span> Music Player
                </p>
                <p className="text-[0.66rem] text-white/42">Your memories, one song at a time.</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="icon-btn tap-target h-9 w-9 text-white/70 hover:text-white"
              >
                <Close size={18} />
              </button>
            </div>

            <nav className="scroll-y flex-1 px-2 py-3" aria-label="Menu navigation">
              <ul className="space-y-1">
                {TABS.map((tab) => {
                  const active = isActive(tab.href);
                  return (
                    <li key={tab.href}>
                      <Link
                        href={tab.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                          active
                            ? "bg-[color:var(--color-amber)]/14 text-white"
                            : "text-white/72 hover:bg-white/6 hover:text-white"
                        }`}
                      >
                        <span aria-hidden className="text-lg">
                          {tab.emoji}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">{labelFor(tab.href) ?? tab.label}</span>
                          <span className="block text-[0.68rem] text-white/40">{tab.hint}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <hr className="my-3 border-white/8" />

              <ul className="space-y-1">
                <li>
                  <Link
                    href="/support"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/72 transition hover:bg-white/6 hover:text-white"
                  >
                    <span aria-hidden className="text-lg">
                      ❤️
                    </span>
                    <span className="text-sm font-semibold">{t.nav.support}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/developer"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/72 transition hover:bg-white/6 hover:text-white"
                  >
                    <span aria-hidden className="text-lg">
                      🛠️
                    </span>
                    <span className="text-sm font-semibold">{t.nav.developer}</span>
                  </Link>
                </li>
                <li>
                  <a
                    href={DEV.portfolio}
                    target="_blank"
                    rel="noopener noreferrer external"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/72 transition hover:bg-white/6 hover:text-white"
                  >
                    <span aria-hidden className="text-lg">
                      🌐
                    </span>
                    <span className="flex-1 text-sm font-semibold">Portfolio</span>
                    <ExternalLink size={14} className="text-white/35" />
                  </a>
                </li>
                <li>
                  <a
                    href={DEV.timepass}
                    target="_blank"
                    rel="noopener noreferrer external"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/72 transition hover:bg-white/6 hover:text-white"
                  >
                    <span aria-hidden className="text-lg">
                      🎬
                    </span>
                    <span className="flex-1 text-sm font-semibold">Timepass Premium</span>
                    <ExternalLink size={14} className="text-white/35" />
                  </a>
                </li>
              </ul>
            </nav>

            <div className="border-t border-white/8 px-4 py-3">
              <p className="text-[0.68rem] text-white/38">
                Made with <span className="text-[color:var(--color-rose)]">❤️</span> by{" "}
                <a
                  href={DEV.portfolio}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className="warm-text font-semibold"
                >
                  Harsh
                </a>
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
