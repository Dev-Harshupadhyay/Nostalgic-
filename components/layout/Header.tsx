"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Search } from "@/components/ui/Icons";

export const TABS = [
  { href: "/", label: "Home", emoji: "🏠" },
  { href: "/old-songs", label: "Old Songs", emoji: "🎵" },
  { href: "/singles", label: "Singles", emoji: "💿" },
  { href: "/trending", label: "New & Trending", emoji: "🔥" },
  { href: "/chhath", label: "Chhath Puja", emoji: "🪔" },
  { href: "/bhojpuri", label: "Bhojpuri", emoji: "🎤" },
  { href: "/search", label: "Search", emoji: "🔎" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  /* Keep the active tab in view on mobile without scrolling the page. */
  useEffect(() => {
    const el = navRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    if (!el || !navRef.current) return;
    const nav = navRef.current;
    const left = el.offsetLeft - nav.clientWidth / 2 + el.clientWidth / 2;
    nav.scrollTo({ left: Math.max(left, 0), behavior: "smooth" });
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50">
      <a href="#main" className="sr-only-focusable btn btn-glow absolute left-4 top-3 z-[90] px-4 py-2 text-sm">
        Skip to content
      </a>

      <div className="border-b border-white/8 bg-[#0b0708]/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-2.5 sm:px-5">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5"
            aria-label="Nostalgic Music Player — home"
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ffd390] via-[#e8a33d] to-[#c9662b] text-[#150c05] shadow-[0_8px_24px_-10px_rgba(232,163,61,0.9)]">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
                <path d="M9 18.2V6.8l10-2v10.1a3 3 0 1 1-1.6-2.66V7.1l-6.8 1.36v9.74A3 3 0 1 1 9 15.54v2.66z" />
              </svg>
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="text-[0.95rem] font-extrabold tracking-tight">
                <span className="warm-text">Nostalgic</span>
              </span>
              <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
                Music Player
              </span>
            </span>
          </Link>

          <nav
            ref={navRef}
            className="scroll-x flex flex-1 items-center gap-1 px-1"
            aria-label="Main navigation"
          >
            {TABS.map((tab) => {
              const active =
                tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
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
                  <span>{tab.label}</span>
                  {active ? <span className="tab-underline" aria-hidden /> : null}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/search"
            aria-label="Search music"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/12 text-white/70 transition hover:border-[color:var(--color-amber)]/60 hover:text-white md:hidden"
          >
            <Search size={17} />
          </Link>

          <Link
            href="/support"
            className="btn btn-glow hidden shrink-0 px-4 py-2 text-[0.78rem] md:inline-flex"
          >
            Support Dev Harsh ❤️
          </Link>
        </div>
      </div>
    </header>
  );
}
