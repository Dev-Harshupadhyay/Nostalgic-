"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  SUPPORT,
  DEV,
  UPI_APPS,
  buildUpiLink,
  buildAppUpiLink,
  buildAndroidIntent,
} from "@/lib/site";
import { GPayMark, PhonePeMark, PaytmMark, UpiMark } from "@/components/support/UpiMarks";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useUser } from "@/components/user/UserProvider";
import { Close } from "@/components/ui/Icons";

const SEEN_KEY = "nostalgic-support-pop-v3";
const AUTO_CLOSE_MS = 5000;

/**
 * Site-wide UPI support popup.
 *
 * The content is deliberately payment-first: an amount-aware UPI QR, a normal
 * "any UPI app" button and direct GPay / PhonePe / Paytm options. Its visual
 * treatment is the blue/purple card style requested for the Telegram reference,
 * but every action remains a real payment hand-off, not a Telegram promotion.
 */
export default function SupportPop() {
  const { notify } = usePlayer();
  const { name, hydrated, onboarded } = useUser();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(SUPPORT.defaultAmount);
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const armed = useRef(false);

  /* Show once per browser session, after onboarding has had a chance to close. */
  useEffect(() => {
    if (!hydrated || !onboarded || armed.current || typeof window === "undefined") return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    armed.current = true;
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(SEEN_KEY, "1");
      lastFocus.current = document.activeElement as HTMLElement;
      setOpen(true);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [hydrated, onboarded]);

  const close = useCallback(() => {
    setOpen(false);
    lastFocus.current?.focus?.();
  }, []);

  /* The small notice disappears by itself so it never blocks listening. */
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(close, AUTO_CLOSE_MS);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  /* The QR is the exact same UPI payload as the payment buttons. */
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    QRCode.toDataURL(buildUpiLink(amount), {
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
  }, [open, amount]);

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT.upiId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
      notify("UPI ID copied ❤️");
    } catch {
      notify(`UPI ID: ${SUPPORT.upiId}`);
    }
  };

  /** Sends the visitor to their installed UPI app; the app itself confirms payment. */
  const pay = (app: "any" | "gpay" | "phonepe" | "paytm" = "any") => {
    const isMobile =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 820;

    if (!isMobile) {
      copyUpi();
      notify("Desktop par UPI app nahi khulti — QR scan karein ya UPI ID copy kar lein.");
      return;
    }

    const isAndroid = /android/i.test(navigator.userAgent);
    const url =
      app !== "any" && isAndroid
        ? buildAndroidIntent(app, amount)
        : app !== "any"
          ? buildAppUpiLink(app, amount)
          : buildUpiLink(amount);

    window.location.href = url;
    window.setTimeout(() => {
      if (!document.hidden) {
        notify(
          app === "any"
            ? "Koi UPI app nahi mili? QR scan karein ya UPI ID copy karke pay karein."
            : "Ye app nahi mili — 'Koi bhi UPI app' try karein."
        );
      }
    }, 1800);
  };

  if (!open) return null;

  return (
    <div
      className="pay-pop-back pay-pop-in"
      role="presentation"
      onClick={(event) => event.target === event.currentTarget && close()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-pop-title"
        aria-describedby="support-pop-desc"
        tabIndex={-1}
        className="pay-pop"
      >
        <div className="pay-pop-glow" aria-hidden />
        <button type="button" onClick={close} aria-label="Close payment notice" className="pay-pop-close">
          <Close size={18} />
        </button>

        <div className="relative text-center">
          <p className="pay-pop-kicker"><span aria-hidden>✦</span> CREATOR SUPPORT NOTICE</p>
          <h2 id="support-pop-title" className="pay-pop-title">
            {name ? `${name}, support Dev Harsh` : "Support Dev Harsh"}
          </h2>
          <p id="support-pop-desc" className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/58">
            Agar music experience pasand aaya ho, ek chai jitna support kaafi hai. Payment sirf aapki UPI app confirm karegi.
          </p>

          <div className="pay-pop-amounts" role="group" aria-label="Support amount">
            {SUPPORT.presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                aria-pressed={amount === preset}
                className={amount === preset ? "is-on" : ""}
              >
                ₹{preset}{preset === SUPPORT.defaultAmount ? <small> chai</small> : null}
              </button>
            ))}
          </div>

          <p className="pay-pop-qr-label">SCAN TO PAY · ₹{amount}</p>
          <div className="pay-pop-qr">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt={`UPI QR code to pay ₹${amount} to ${SUPPORT.payeeName}`} width={208} height={208} />
            ) : (
              <span className="text-xs font-semibold text-black/45">Generating QR…</span>
            )}
          </div>
          <p className="mt-2 text-xs font-semibold text-white/70">{SUPPORT.payeeName} · {SUPPORT.upiId}</p>

          <button type="button" onClick={() => pay("any")} className="pay-pop-primary">
            <UpiMark className="h-4 w-9" />
            PAY ₹{amount} · KOI BHI UPI APP <span aria-hidden>→</span>
          </button>

          <div className="pay-pop-apps" role="group" aria-label="Pay with a UPI app">
            {UPI_APPS.map((app) => (
              <button key={app.id} type="button" onClick={() => pay(app.id)} className="pay-pop-app" aria-label={`Pay ₹${amount} with ${app.label}`}>
                <span aria-hidden className="pay-pop-app-mark">
                  {app.id === "gpay" ? <GPayMark /> : null}
                  {app.id === "phonepe" ? <PhonePeMark /> : null}
                  {app.id === "paytm" ? <PaytmMark /> : null}
                </span>
                {app.label}
              </button>
            ))}
          </div>

          <div className="pay-pop-bottom">
            <button type="button" onClick={copyUpi} className="pay-pop-copy">
              {copied ? "✓ UPI ID copied" : "Copy UPI ID"}
            </button>
            <button type="button" onClick={close} className="pay-pop-later">Abhi nahi</button>
            <span className="pay-pop-count">Auto closes in 5 seconds</span>
          </div>
        </div>
        <span className="pay-pop-progress" aria-hidden />
      </div>
    </div>
  );
}
