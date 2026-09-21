"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { CHHATH_GALLERY } from "@/lib/chhath-2026";
import { Close } from "@/components/ui/Icons";

/**
 * Chhath gallery.
 *
 * The artwork is original flat-vector illustration generated for this site —
 * no third-party photographs, so nothing here is hotlinked or licensed from
 * someone else. Tapping a tile opens a lightbox with the caption.
 */
export default function ChhathGallery() {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
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
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => ((i ?? 0) + 1) % CHHATH_GALLERY.length);
      if (e.key === "ArrowLeft")
        setOpen((i) => ((i ?? 0) - 1 + CHHATH_GALLERY.length) % CHHATH_GALLERY.length);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const item = open !== null ? CHHATH_GALLERY[open] : null;

  return (
    <section
      ref={sectionRef}
      className={`ch-gal eg-block ${shown ? "is-in" : ""}`}
      aria-labelledby="ch-gal-title"
    >
      <h2 id="ch-gal-title" className="ch-section-title">
        {t.chhath.gallery}
      </h2>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/52">
        {t.chhath.galleryLead}
      </p>

      <div className="ch-gal-grid">
        {CHHATH_GALLERY.map((g, i) => (
          <button
            key={g.src}
            type="button"
            onClick={() => setOpen(i)}
            className="ch-gal-tile stagger-in"
            style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}
            aria-label={g.title[locale]}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.src} alt={g.caption[locale]} loading="lazy" decoding="async" />
            <span className="ch-gal-shade" aria-hidden />
            <span className="ch-gal-cap">{g.title[locale]}</span>
          </button>
        ))}
      </div>

      {item ? (
        <div
          className="ch-light fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={item.title[locale]}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(null);
          }}
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="ch-light-x"
            aria-label={t.common.close}
          >
            <Close size={18} />
          </button>
          <figure className="ch-light-fig sheet-up">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.src} alt={item.caption[locale]} />
            <figcaption>
              <strong>{item.title[locale]}</strong>
              <span>{item.caption[locale]}</span>
            </figcaption>
          </figure>
        </div>
      ) : null}
    </section>
  );
}
