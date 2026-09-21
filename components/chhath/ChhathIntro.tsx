"use client";

import { useEffect, useRef, useState } from "react";
import DayModal from "./DayModal";
import GlowButton from "@/components/ui/GlowButton";
import { usePlayer } from "@/components/player/PlayerProvider";
import { getGroup } from "@/lib/catalog";
import { CHHATH_INTRO, CHHATH_FACTS, CHHATH_QUOTE, CHHATH_QUOTE_BY } from "@/lib/chhath-notes";
import { Play } from "@/components/ui/Icons";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { CHHATH_2026 } from "@/lib/chhath-2026";

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e.some((x) => x.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

const READ_MORE = {
  en: "Read the full day",
  hi: "पूरा दिन पढ़ें",
  bho: "पूरा दिन पढ़ीं",
};

const LEAD2 = {
  en: "From Kartik Shukla Chaturthi to Saptami — each day has its own rule, its own prasad, its own discipline.",
  hi: "कार्तिक शुक्ल चतुर्थी से सप्तमी तक — हर दिन का अपना नियम, अपना प्रसाद, अपनी मर्यादा।",
  bho: "कातिक सुकुल चउथ से सतमी तक — हर दिन के आपन नियम, आपन परसाद, आपन मरजाद।",
};

export default function ChhathIntro({ count }: { count: number }) {
  const { locale, t } = useI18n();
  const { playQueue } = usePlayer();
  const songs = getGroup("chhathPuja");
  const ritual = useReveal<HTMLDivElement>();
  const [openDay, setOpenDay] = useState<number | null>(null);

  return (
    <>
      {/* ------------------------------ Hero ------------------------------ */}
      <header className="ch-hero fade-up">
        <div aria-hidden className="ch-sun" />
        <div aria-hidden className="ch-water" />

        <p className="eyebrow relative">{t.chhath.eyebrow}</p>

        <h1 className="ch-title relative mt-2 text-[2rem] font-extrabold tracking-tight sm:text-[3.2rem]">
          <span aria-hidden className="mr-2">🪔</span>
          {t.chhath.title}
        </h1>

        <p className="relative mt-3 max-w-2xl text-[0.95rem] font-semibold leading-relaxed text-white/80">
          {CHHATH_INTRO.lead[locale]}
        </p>

        <p className="relative mt-3 max-w-3xl text-sm leading-[1.85] text-white/58">
          {CHHATH_INTRO.body[locale]}
        </p>

        <div className="ch-facts relative">
          {CHHATH_FACTS.map((f) => (
            <div key={f.k} className="ch-fact">
              <span className="ch-fact-k">{f.k}</span>
              <span className="ch-fact-v">{f.v[locale]}</span>
            </div>
          ))}
        </div>

        <div className="relative mt-6 flex flex-wrap items-center gap-3">
          <GlowButton size="lg" aura onClick={() => playQueue(songs, 0)} aria-label="Play all Chhath songs">
            <Play size={16} /> {t.common.playAll}
          </GlowButton>
          <span className="eg-chip">{count} {t.common.songs}</span>
        </div>
      </header>

      {/* ---------------------------- Four days ---------------------------- */}
      <section
        ref={ritual.ref}
        className={`ch-days eg-block ${ritual.shown ? "is-in" : ""}`}
        aria-labelledby="ch-days-title"
      >
        <h2 id="ch-days-title" className="ch-section-title">
          {t.chhath.fourDays}
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/52">
          {LEAD2[locale]}
        </p>

        <ol className="ch-day-list">
          {CHHATH_2026.map((d, i) => (
            <li
              key={d.key}
              className="stagger-in"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <button
                type="button"
                onClick={() => setOpenDay(i)}
                className="ch-day is-clickable"
                aria-label={`${d.name[locale]} — full detail`}
              >
              <span className="ch-day-n" aria-hidden>
                {d.n}
              </span>
              <div className="min-w-0 text-left">
                <p className="ch-day-label">
                  {new Date(`${d.date}T00:00:00+05:30`).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    timeZone: "Asia/Kolkata",
                  })}{" "}
                  · 2026
                </p>
                <h3 className="ch-day-name">{d.name[locale]}</h3>
                {d.time ? <p className="ch-day-time">🕉 {d.time}</p> : null}
                <p className="ch-day-text">{d.what[locale]}</p>
                <p className="ch-day-tithi">{d.tithi}</p>
                <span className="ch-day-more" aria-hidden>
                  {READ_MORE[locale]} →
                </span>
              </div>
              </button>
            </li>
          ))}
        </ol>

        <blockquote className="ch-quote">
          <p>{CHHATH_QUOTE[locale]}</p>
          <footer>{CHHATH_QUOTE_BY[locale]}</footer>
        </blockquote>
      </section>

      <DayModal index={openDay} onClose={() => setOpenDay(null)} onNavigate={setOpenDay} />
    </>
  );
}
