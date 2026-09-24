"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { SOCIAL } from "@/lib/site";
import { Close, ExternalLink } from "@/components/ui/Icons";
import { useUser } from "@/components/user/UserProvider";

const SEEN_KEY = "nostalgic-telegram-pop-v1";
const OPEN_AFTER_MS = 2600;
const AUTO_CLOSE_MS = 5000;

/**
 * A light, once-per-session Telegram notice. It intentionally closes itself in
 * five seconds and does not lock the page, so it never behaves like a payment
 * interruption. The QR and button always use the same public channel URL.
 */
export default function TelegramPop() {
  const { hydrated, onboarded } = useUser();
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const opener = useRef<number | null>(null);

  const close = () => setOpen(false);

  useEffect(() => {
    if (!hydrated || !onboarded || typeof window === "undefined") return;
    if (sessionStorage.getItem(SEEN_KEY)) return;

    opener.current = window.setTimeout(() => {
      sessionStorage.setItem(SEEN_KEY, "1");
      setOpen(true);
    }, OPEN_AFTER_MS);

    return () => {
      if (opener.current) window.clearTimeout(opener.current);
    };
  }, [hydrated, onboarded]);

  useEffect(() => {
    if (!open) return;
    const closeTimer = window.setTimeout(close, AUTO_CLOSE_MS);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(closeTimer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    QRCode.toDataURL(SOCIAL.telegramChannel, {
      width: 500,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#07090f", light: "#ffffff" },
    })
      .then((dataUrl) => {
        if (!cancelled) setQr(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQr(null);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="tg-pop-back tg-pop-in" role="presentation" onClick={(event) => event.target === event.currentTarget && close()}>
      <section className="tg-pop" role="dialog" aria-modal="false" aria-labelledby="telegram-pop-title">
        <div className="tg-pop-glow" aria-hidden />
        <button type="button" onClick={close} className="tg-pop-close" aria-label="Close Telegram notice">
          <Close size={18} />
        </button>

        <div className="relative text-center">
          <p className="tg-pop-kicker"><span aria-hidden>✦</span> TIMEPASS PREMIUM NOTICE</p>
          <h2 id="telegram-pop-title" className="tg-pop-title">Join Our Official<br />Telegram Channel</h2>

          <a
            href={SOCIAL.telegramChannel}
            target="_blank"
            rel="noopener noreferrer external"
            className="tg-pop-join"
            onClick={close}
          >
            <span className="text-left">
              <strong>OFFICIAL CHANNEL</strong>
              <small>JOIN TELEGRAM CHANNEL</small>
            </span>
            <span className="tg-pop-arrow" aria-hidden>→</span>
            <span className="sr-only">Open official Telegram channel</span>
          </a>

          <p className="tg-pop-qr-label">OFFICIAL QR CODE</p>
          <a
            href={SOCIAL.telegramChannel}
            target="_blank"
            rel="noopener noreferrer external"
            className="tg-pop-qr"
            onClick={close}
            aria-label="Open official Telegram channel"
          >
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt={`QR code for ${SOCIAL.telegramHandle}`} width={208} height={208} />
            ) : (
              <span className="text-xs font-semibold text-black/45">Generating QR…</span>
            )}
          </a>

          <p className="mt-4 text-sm leading-relaxed text-white/58">
            Scan ya button dabakar seedha official channel join karo.
          </p>
          <div className="tg-pop-bottom">
            <span className="tg-pop-count" aria-live="polite">Auto closes in 5 seconds</span>
            <a href={SOCIAL.telegramChannel} target="_blank" rel="noopener noreferrer external" onClick={close} className="tg-pop-text-link">
              Open Telegram <ExternalLink size={13} />
            </a>
          </div>
        </div>
        <span className="tg-pop-progress" aria-hidden />
      </section>
    </div>
  );
}
