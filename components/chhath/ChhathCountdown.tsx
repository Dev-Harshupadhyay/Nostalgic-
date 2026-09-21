"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { CHHATH_2026, chhathStatus, type ChhathStatus } from "@/lib/chhath-2026";

const pad = (n: number) => `${n}`.padStart(2, "0");

/**
 * Live countdown to Chhath Puja 2026 (13–16 November).
 *
 * The clock ticks client-side only: it renders nothing on the server so the
 * markup can never be stale or mismatched. Once the festival starts, the card
 * switches into a celebration state that highlights the day currently running.
 */
export default function ChhathCountdown() {
  const { locale, t } = useI18n();
  const [status, setStatus] = useState<ChhathStatus | null>(null);

  useEffect(() => {
    const tick = () => setStatus(chhathStatus(Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!status) {
    return <div className="ch-count is-skeleton" aria-hidden />;
  }

  /* ------------------------- Festival is running ------------------------- */
  if (status.phase === "during") {
    const day = CHHATH_2026[status.dayIndex];
    return (
      <div className="ch-count is-live" role="status">
        <div aria-hidden className="ch-count-rays" />
        <div aria-hidden className="ch-count-spark">
          <span>🪔</span>
          <span>✨</span>
          <span>🌅</span>
          <span>🪔</span>
        </div>

        <p className="ch-count-eyebrow is-live">● {t.chhath.liveNow}</p>
        <h2 className="ch-count-live-day">
          {t.chhath.today} · {day.name[locale]}
        </h2>
        <p className="ch-count-live-sub">
          {t.chhath.countdownTitle} · Day {day.n} of 4 · {day.tithi}
        </p>
        {day.time ? <p className="ch-count-time">🕉 {day.time}</p> : null}
        <p className="ch-count-live-text">{day.what[locale]}</p>
      </div>
    );
  }

  /* ------------------------------- Over -------------------------------- */
  if (status.phase === "after") {
    return (
      <div className="ch-count">
        <p className="ch-count-eyebrow">{t.chhath.countdownTitle}</p>
        <h2 className="ch-count-done">Chhath 2026 sampann 🙏</h2>
        <p className="ch-count-live-text">Agle saal phir, usi ghat par.</p>
      </div>
    );
  }

  /* ----------------------------- Counting ------------------------------ */
  const units = [
    { v: status.days, l: { en: "days", hi: "दिन", bho: "दिन" } },
    { v: status.hours, l: { en: "hours", hi: "घंटे", bho: "घंटा" } },
    { v: status.minutes, l: { en: "min", hi: "मिनट", bho: "मिनट" } },
    { v: status.seconds, l: { en: "sec", hi: "सेकंड", bho: "सेकंड" } },
  ];

  return (
    <div className="ch-count">
      <div aria-hidden className="ch-count-rays" />

      <p className="ch-count-eyebrow">🪔 {t.chhath.countdownTitle}</p>
      <p className="ch-count-dates">13 – 16 November 2026 · Sandhya Arghya 15 Nov</p>

      <div className="ch-count-grid" role="timer" aria-live="off">
        {units.map((u, i) => (
          <div key={u.l.en} className="ch-unit" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="ch-unit-v tabular-nums">{i === 0 ? u.v : pad(u.v)}</span>
            <span className="ch-unit-l">{u.l[locale]}</span>
          </div>
        ))}
      </div>

      <p className="ch-count-foot">{t.chhath.daysLeft} · Nahay Khay se shuruaat</p>
    </div>
  );
}
