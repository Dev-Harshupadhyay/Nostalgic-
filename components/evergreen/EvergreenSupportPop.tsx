"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SUPPORT, DEV, buildUpiLink } from "@/lib/site";
import { usePlayer } from "@/components/player/PlayerProvider";
import { Close } from "@/components/ui/Icons";

const AMOUNT = SUPPORT.defaultAmount; // ₹25
const SEEN_KEY = "eg-support-pop-v1";

/**
 * "Solid message" popup for the Evergreen page.
 *
 * Shows once per session after the visitor has actually listened for a bit.
 * Tapping Pay opens the user's UPI app via a standard `upi://pay` deep link
 * (pmharsh@fam · ₹25). Nothing is charged or confirmed here — only the UPI app
 * can complete a payment. On desktop we copy the UPI ID instead, because a
 * laptop has no UPI app to hand off to.
 */
export default function EvergreenSupportPop() {
  const { notify } = usePlayer();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  /* Trigger: 45s on page, once per session. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    const t = window.setTimeout(() => {
      sessionStorage.setItem(SEEN_KEY, "1");
      lastFocus.current = document.activeElement as HTMLElement;
      setOpen(true);
    }, 45_000);
    return () => window.clearTimeout(t);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    lastFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT.upiId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
      notify("UPI ID copied ❤️");
    } catch {
      notify("UPI ID: " + SUPPORT.upiId);
    }
  };

  const pay = () => {
    const isMobile =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 820;

    if (!isMobile) {
      copyUpi();
      notify("Desktop par UPI app nahi khulti — ID copy kar li, phone se bhej do.");
      return;
    }

    window.location.href = buildUpiLink(AMOUNT);
    window.setTimeout(() => {
      if (!document.hidden) {
        notify("Koi UPI app nahi mili? UPI ID copy karke manually bhejo.");
      }
    }, 1800);
  };

  if (!open) return null;

  return (
    <div
      className="eg-pop-back fade-in"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="eg-pop-title"
        aria-describedby="eg-pop-desc"
        tabIndex={-1}
        className="eg-pop sheet-up"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close support message"
          className="eg-pop-x"
        >
          <Close size={16} />
        </button>

        <div aria-hidden className="eg-pop-coin">💛</div>

        <p className="eyebrow">Solid message</p>
        <h2 id="eg-pop-title" className="eg-title mt-1 text-xl font-extrabold sm:text-2xl">
          Gaane pasand aaye?
        </h2>
        <p id="eg-pop-desc" className="mt-2 text-sm leading-relaxed text-white/62">
          Evergreen collection free hai aur free hi rahegi. Agar maza aaya to{" "}
          <b className="text-white/85">₹{AMOUNT}</b> ka chhota support {DEV.name} ke liye bada
          motivation hai.
        </p>

        <dl className="eg-pop-card">
          <div>
            <dt>UPI ID</dt>
            <dd>{SUPPORT.upiId}</dd>
          </div>
          <div>
            <dt>Amount</dt>
            <dd>₹{AMOUNT}</dd>
          </div>
          <div>
            <dt>Payee</dt>
            <dd>{SUPPORT.payeeName}</dd>
          </div>
        </dl>

        <button type="button" onClick={pay} className="eg-pop-pay">
          <span aria-hidden>❤️</span> Pay ₹{AMOUNT} · Open UPI app
        </button>

        <div className="eg-pop-row">
          <button type="button" onClick={copyUpi} className="btn btn-ghost px-4 py-2 text-xs">
            {copied ? "✓ Copied" : "Copy UPI ID"}
          </button>
          <button type="button" onClick={close} className="eg-pop-later">
            Baad me
          </button>
        </div>

        <p className="mt-3 text-[0.68rem] leading-relaxed text-white/38">
          Ye site koi payment process ya store nahi karti — sirf aapki UPI app hi transaction
          confirm kar sakti hai.
        </p>
      </div>
    </div>
  );
}
