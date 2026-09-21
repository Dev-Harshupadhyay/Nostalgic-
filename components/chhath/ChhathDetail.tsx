"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import GhatScene from "./GhatScene";
import {
  CHHATH_ABOUT,
  CHHATH_SAMAGRI,
  CHHATH_KATHA,
  CHHATH_NIYAM,
} from "@/lib/chhath-detail";

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
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

const T = {
  samagri: { en: "Prasad & samagri", hi: "प्रसाद और सामग्री", bho: "परसाद आ समान" },
  samagriLead: {
    en: "Everything humble, everything grown nearby — that is the rule.",
    hi: "सब कुछ सादा, सब कुछ आस-पास का उगा हुआ — यही नियम है।",
    bho: "सब कुछ सादा, सब कुछ आस-पास के उगल — इहे नियम ह।",
  },
  katha: { en: "The stories behind the vrat", hi: "व्रत के पीछे की कथाएँ", bho: "बरत के पाछे के कथा" },
  kathaLead: {
    en: "Chhath has no single origin — it has four, and Bihar keeps all of them.",
    hi: "छठ की कोई एक शुरुआत नहीं — चार हैं, और बिहार चारों को सँभाले हुए है।",
    bho: "छठ के कवनो एक सुरुआत ना — चार बा, आ बिहार चारो के सँभालले बा।",
  },
  niyam: { en: "Niyam — what is kept, what is avoided", hi: "नियम — क्या करें, क्या न करें", bho: "नियम — का करीं, का ना करीं" },
  doTitle: { en: "Kept", hi: "करें", bho: "करीं" },
  dontTitle: { en: "Avoided", hi: "न करें", bho: "ना करीं" },
  sandhya: { en: "Sandhya Arghya · the setting sun", hi: "संध्या अर्घ्य · डूबता सूर्य", bho: "सांझ के अरघ · डूबत सुरुज" },
  usha: { en: "Usha Arghya · the rising sun", hi: "उषा अर्घ्य · उगता सूर्य", bho: "भोरे के अरघ · उगत सुरुज" },
};

export default function ChhathDetail() {
  const { locale } = useI18n();
  const about = useReveal<HTMLElement>();
  const scenes = useReveal<HTMLElement>();
  const sam = useReveal<HTMLElement>();
  const kat = useReveal<HTMLElement>();
  const niy = useReveal<HTMLElement>();

  return (
    <>
      {/* ---------------------------- About ---------------------------- */}
      <section ref={about.ref} className={`ch-about eg-block ${about.shown ? "is-in" : ""}`}>
        <h2 className="ch-section-title">{CHHATH_ABOUT.heading[locale]}</h2>
        <div className="ch-prose">
          {CHHATH_ABOUT.paras.map((p, i) => (
            <p key={i} className={i === 0 ? "is-lead" : undefined}>
              {p[locale]}
            </p>
          ))}
        </div>
      </section>

      {/* ------------------------ Animated scenes ------------------------ */}
      <section ref={scenes.ref} className={`ch-scenes eg-block ${scenes.shown ? "is-in" : ""}`}>
        <figure className="ch-scene">
          <GhatScene variant="sunset" />
          <figcaption>{T.sandhya[locale]}</figcaption>
        </figure>
        <figure className="ch-scene">
          <GhatScene variant="sunrise" />
          <figcaption>{T.usha[locale]}</figcaption>
        </figure>
      </section>

      {/* ---------------------------- Samagri ---------------------------- */}
      <section ref={sam.ref} className={`ch-sam eg-block ${sam.shown ? "is-in" : ""}`}>
        <h2 className="ch-section-title">{T.samagri[locale]}</h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/52">
          {T.samagriLead[locale]}
        </p>
        <div className="ch-sam-grid">
          {CHHATH_SAMAGRI.map((s, i) => (
            <article
              key={s.name.en}
              className="ch-sam-card stagger-in"
              style={{ animationDelay: `${Math.min(i, 6) * 70}ms` }}
            >
              <h3>{s.name[locale]}</h3>
              <p>{s.note[locale]}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ----------------------------- Katha ----------------------------- */}
      <section ref={kat.ref} className={`ch-katha eg-block ${kat.shown ? "is-in" : ""}`}>
        <h2 className="ch-section-title">{T.katha[locale]}</h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/52">
          {T.kathaLead[locale]}
        </p>
        <div className="ch-katha-grid">
          {CHHATH_KATHA.map((k, i) => (
            <article
              key={k.title.en}
              className="ch-katha-card stagger-in"
              style={{ animationDelay: `${Math.min(i, 4) * 80}ms` }}
            >
              <span className="ch-katha-n" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{k.title[locale]}</h3>
              <p>{k.text[locale]}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ----------------------------- Niyam ----------------------------- */}
      <section ref={niy.ref} className={`ch-niyam eg-block ${niy.shown ? "is-in" : ""}`}>
        <h2 className="ch-section-title">{T.niyam[locale]}</h2>
        <div className="ch-niyam-grid">
          <div className="ch-niyam-col is-do">
            <h3>✓ {T.doTitle[locale]}</h3>
            <ul>
              {CHHATH_NIYAM.do.map((d, i) => (
                <li key={i}>{d[locale]}</li>
              ))}
            </ul>
          </div>
          <div className="ch-niyam-col is-dont">
            <h3>✕ {T.dontTitle[locale]}</h3>
            <ul>
              {CHHATH_NIYAM.dont.map((d, i) => (
                <li key={i}>{d[locale]}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
