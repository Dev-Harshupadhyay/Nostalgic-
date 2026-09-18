"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "./UserProvider";
import GlowButton from "@/components/ui/GlowButton";
import { Sparkle, Heart, Music, Check } from "@/components/ui/Icons";

/**
 * First-visit welcome: asks for a name and for permission to store data
 * locally. Skipping is a first-class option — the player works fully either
 * way, only the personal touches (favourites, resume, history) need storage.
 *
 * This is a real modal dialog (focus trapped, Escape = skip) rather than a
 * toast, because it asks a question. The celebratory greeting that follows is
 * the auto-dismissing toast.
 */
export default function WelcomeGate() {
  const { hydrated, onboarded, acceptConsent, declineConsent, completeOnboarding } = useUser();
  const [value, setValue] = useState("");
  const [closing, setClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const open = hydrated && !onboarded;

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 380);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish(null, false);
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input, a[href]'
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
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const finish = (name: string | null, allowStorage: boolean) => {
    if (allowStorage) acceptConsent();
    else declineConsent();
    // Pass the decision through: React state from the calls above has not
    // re-rendered yet, so completeOnboarding cannot infer it.
    completeOnboarding(name, allowStorage);
    setClosing(true);
  };

  if (!open) return null;

  const trimmed = value.trim();

  return (
    <div
      className={`fixed inset-0 z-[120] grid place-items-center px-4 ${closing ? "pointer-events-none opacity-0 transition-opacity duration-300" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      aria-describedby="welcome-desc"
    >
      <div className="absolute inset-0 bg-black/78 backdrop-blur-md" aria-hidden />

      <div
        ref={panelRef}
        className="pp-card fade-up relative w-full max-w-[440px] px-6 py-8 sm:px-8 sm:py-9"
      >
        <span className="pp-now mx-auto flex w-fit">
          <Sparkle size={12} />
          Welcome
        </span>

        <h2
          id="welcome-title"
          className="warm-text mt-4 text-center text-2xl font-extrabold leading-tight sm:text-[1.7rem]"
        >
          Aapka naam kya hai?
        </h2>
        <p id="welcome-desc" className="mt-2 text-center text-sm leading-relaxed text-white/58">
          Taaki hum aapko theek se welcome kar sakein. Naam sirf aapke device par rehta hai —
          hamare server par kabhi nahi jaata.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            finish(trimmed || null, true);
          }}
          className="mt-6"
        >
          <label htmlFor="welcome-name" className="sr-only">
            Your name
          </label>
          <input
            id="welcome-name"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={24}
            autoComplete="given-name"
            enterKeyHint="go"
            placeholder="Your name (optional)"
            className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3.5 text-center text-base text-white outline-none transition placeholder:text-white/30 focus:border-[color:var(--color-amber)]/65"
          />

          <div className="mt-4 flex flex-col gap-2.5">
            <GlowButton type="submit" size="lg" className="w-full justify-center">
              <Heart size={16} />
              {trimmed ? `Let's go, ${trimmed}` : "Continue"}
            </GlowButton>

            <button
              type="button"
              onClick={() => finish(null, true)}
              className="w-full rounded-full px-4 py-2.5 text-sm font-medium text-white/55 transition hover:bg-white/6 hover:text-white"
            >
              Skip — bas music sunna hai
            </button>
          </div>
        </form>

        {/* Storage consent, stated plainly rather than buried. */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-3.5">
          <p className="flex items-start gap-2 text-[0.72rem] leading-relaxed text-white/52">
            <Music size={13} className="mt-0.5 shrink-0 text-[color:var(--color-amber)]" />
            <span>
              Continue karne par hum aapke favourites, queue aur volume aapke browser ke local
              storage mein save karte hain. Koi tracking cookie nahi, koi account nahi.
            </span>
          </p>
          <button
            type="button"
            onClick={() => finish(null, false)}
            className="mt-2.5 inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-white/45 underline underline-offset-4 transition hover:text-white/80"
          >
            <Check size={12} />
            Kuch bhi save mat karo
          </button>
        </div>
      </div>
    </div>
  );
}
