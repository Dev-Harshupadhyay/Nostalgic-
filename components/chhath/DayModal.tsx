"use client";

import { useCallback, useEffect, useRef } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { CHHATH_2026 } from "@/lib/chhath-2026";
import { DAY_DETAIL } from "@/lib/chhath-days-detail";
import GhatScene from "./GhatScene";
import { Close, ChevronRight } from "@/components/ui/Icons";

const T = {
  prasad: { en: "Prasad", hi: "प्रसाद", bho: "परसाद" },
  geet: { en: "Song of this day", hi: "इस दिन का गीत", bho: "एह दिन के गीत" },
  prev: { en: "Previous day", hi: "पिछला दिन", bho: "पिछला दिन" },
  next: { en: "Next day", hi: "अगला दिन", bho: "अगिला दिन" },
  dayOf: { en: "Day {n} of 4", hi: "चार में से {n}वाँ दिन", bho: "चार में से {n}वाँ दिन" },
};

/**
 * Full-screen reader for a single day of Chhath.
 *
 * Opened by tapping a day card. Scroll-locks the page, traps focus, closes on
 * Escape, and lets the reader move between the four days with the arrow keys.
 * The two arghya days show the matching animated ghat scene instead of a flat
 * illustration, so the sun is actually setting or rising as you read.
 */
export default function DayModal({
  index,
  onClose,
  onNavigate,
}: {
  index: number | null;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const { locale } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const open = index !== null;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onNavigate((index + dir + CHHATH_2026.length) % CHHATH_2026.length);
    },
    [index, onNavigate]
  );

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        go(1);
      } else if (e.key === "ArrowLeft") {
        go(-1);
      } else if (e.key === "Tab") {
        const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href]"
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
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [open, onClose, go]);

  /* Jump back to the top when switching days. */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [index]);

  if (index === null) return null;

  const day = CHHATH_2026[index];
  const detail = DAY_DETAIL[day.key];
  const scene =
    day.key === "sandhya-argh" ? "sunset" : day.key === "usha-argh" ? "sunrise" : null;

  const dateLabel = new Date(`${day.date}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return (
    <div
      className="day-back fade-in"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-title"
        tabIndex={-1}
        className="day-panel sheet-up"
      >
        <button type="button" onClick={onClose} className="day-x" aria-label="Close">
          <Close size={18} />
        </button>

        <div ref={scrollRef} className="day-scroll scroll-y">
          {/* ---------------------------- Cover ---------------------------- */}
          <div className="day-cover">
            {scene ? (
              <GhatScene variant={scene} />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={day.image} alt="" loading="lazy" />
            )}
            <div className="day-cover-shade" aria-hidden />
            <div className="day-cover-text">
              <span className="day-pill">
                {day.emoji} {T.dayOf[locale].replace("{n}", String(day.n))}
              </span>
              <h2 id="day-title" className="day-title">
                {day.name[locale]}
              </h2>
              <p className="day-date">
                {dateLabel} · {day.tithi}
              </p>
            </div>
          </div>

          <div className="day-body">
            <p className="day-summary">{detail.summary[locale]}</p>

            {day.time ? <p className="day-time">🕉 {day.time}</p> : null}

            {/* --------------------------- Story --------------------------- */}
            <div className="day-prose">
              {detail.paras.map((p, i) => (
                <p key={i}>{p[locale]}</p>
              ))}
            </div>

            {/* --------------------------- Points -------------------------- */}
            <dl className="day-points">
              {detail.points.map((pt) => (
                <div key={pt.label.en}>
                  <dt>{pt.label[locale]}</dt>
                  <dd>{pt.text[locale]}</dd>
                </div>
              ))}
            </dl>

            {/* --------------------------- Prasad -------------------------- */}
            <section className="day-prasad">
              <h3>{T.prasad[locale]}</h3>
              <ul>
                {detail.prasad.map((p, i) => (
                  <li key={i}>{p[locale]}</li>
                ))}
              </ul>
            </section>

            {/* ---------------------------- Geet --------------------------- */}
            <blockquote className="day-geet">
              <span className="day-geet-label">{T.geet[locale]}</span>
              <p>{detail.geet.line[locale]}</p>
              <footer>{detail.geet.note[locale]}</footer>
            </blockquote>

            {/* ----------------------------- Nav --------------------------- */}
            <div className="day-nav">
              <button type="button" onClick={() => go(-1)} className="day-nav-btn">
                <ChevronRight size={15} className="rotate-180" />
                <span>
                  <small>{T.prev[locale]}</small>
                  {CHHATH_2026[(index - 1 + 4) % 4].name[locale]}
                </span>
              </button>
              <button type="button" onClick={() => go(1)} className="day-nav-btn is-next">
                <span>
                  <small>{T.next[locale]}</small>
                  {CHHATH_2026[(index + 1) % 4].name[locale]}
                </span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
