"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const SEEN_KEY = "nostalgic-support-pop-v2";

/**
 * Site-wide "support the dev" popup.
 *
 * Appears shortly after the site opens (once the welcome dialog has resolved,
 * so the two never stack) and only once per browser session. Tapping Pay opens
 * the visitor's UPI app through a standard `upi://pay` deep link. Nothing is
 * charged or confirmed here — only the UPI app can complete a payment. On
 * desktop there is no UPI app to hand off to, so we copy the UPI ID instead.
 */
export default function SupportPop() {
  const { notify } = usePlayer();
  const { name, hydrated, onboarded } = useUser();

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(SUPPORT.defaultAmount);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const armed = useRef(false);

  /* Open soon after the site loads — once per session. */
  useEffect(() => {
    if (!hydrated || !onboarded || armed.current) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    armed.current = true;
    const t = window.setTimeout(() => {
      sessionStorage.setItem(SEEN_KEY, "1");
      lastFocus.current = document.activeElement as HTMLElement;
      setOpen(true);
    }, 3500);
    return () => window.clearTimeout(t);
  }, [hydrated, onboarded]);

  const close = useCallback(() => {
    setOpen(false);
    lastFocus.current?.focus?.();
  }, []);

  /* Escape to dismiss + simple focus trap. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
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

  /**
   * Hand off to a UPI app.
   *
   * On Android an `intent://` URL targeting the app's package is the most
   * reliable way to land in one specific app; everywhere else we use the app's
   * own scheme (tez:// , phonepe:// , paytmmp://). "any" uses the plain
   * upi:// intent so the OS shows every installed UPI app.
   */
  const pay = (app: "any" | "gpay" | "phonepe" | "paytm" = "any") => {
    const isMobile =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 820;

    if (!isMobile) {
      copyUpi();
      notify("Desktop par UPI app nahi khulti — ID copy kar li, phone se bhej do.");
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
            ? "Koi UPI app nahi mili? UPI ID copy karke manually bhejo."
            : "Ye app nahi mili — 'Koi bhi UPI app' try karo."
        );
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
        aria-labelledby="support-pop-title"
        aria-describedby="support-pop-desc"
        tabIndex={-1}
        className="eg-pop sheet-up"
      >
        <button type="button" onClick={close} aria-label="Close" className="eg-pop-x">
          <Close size={16} />
        </button>

        <div aria-hidden className="eg-pop-coin">☕</div>

        <p className="eyebrow">Support the developer</p>

        <h2 id="support-pop-title" className="eg-title mt-1 text-xl font-extrabold sm:text-[1.6rem]">
          {name ? `${name}, ek chhoti si baat 💛` : "Ek chhoti si baat 💛"}
        </h2>

        <p id="support-pop-desc" className="mt-2.5 text-[0.88rem] leading-relaxed text-white/68">
          Ye poori website <b className="text-white/90">{DEV.fullName}</b> ne akele banayi hai — raat
          raat bhar coding, har gaane ka collection haath se chuna hua, aur sab kuch{" "}
          <b className="text-white/90">bilkul free</b>, bina kisi ad ke.
        </p>

        <p className="mt-2 text-[0.88rem] leading-relaxed text-white/58">
          Server aur domain ka kharcha apni jeb se jaata hai. Agar aapko yahan apni purani yaadein
          mili hon, to is mehnat ke liye ek <b className="text-white/85">chai ka jugaad</b> kar do —
          ₹{amount} bhi bahut hai. Aapka chhota sa support hi agla update banata hai. 🙏
        </p>

        <div className="eg-amt" role="group" aria-label="Support amount">
          {SUPPORT.presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(p)}
              aria-pressed={amount === p}
              className={`eg-amt-btn ${amount === p ? "is-on" : ""}`}
            >
              ₹{p}
              {p === 25 ? <span className="eg-amt-tag">chai ☕</span> : null}
            </button>
          ))}
        </div>

        <dl className="eg-pop-card">
          <div>
            <dt>UPI ID</dt>
            <dd>{SUPPORT.upiId}</dd>
          </div>
          <div>
            <dt>Payee</dt>
            <dd>{SUPPORT.payeeName}</dd>
          </div>
        </dl>

        <div className="upi-apps" role="group" aria-label="Pay with a UPI app">
          {UPI_APPS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => pay(a.id)}
              className="upi-app"
              style={{ ["--hue" as string]: a.hue }}
              aria-label={`Pay ₹${amount} with ${a.label}`}
            >
              <span className="upi-app-mark" aria-hidden>
                {a.id === "gpay" ? <GPayMark /> : null}
                {a.id === "phonepe" ? <PhonePeMark /> : null}
                {a.id === "paytm" ? <PaytmMark /> : null}
              </span>
              <span className="upi-app-name">{a.label}</span>
            </button>
          ))}
        </div>

        <button type="button" onClick={() => pay("any")} className="eg-pop-pay">
          <span aria-hidden className="inline-flex items-center gap-2">
            <UpiMark className="h-4 w-9" />
          </span>
          ₹{amount} · koi bhi UPI app
        </button>

        <div className="eg-pop-row">
          <button type="button" onClick={copyUpi} className="btn btn-ghost px-4 py-2 text-xs">
            {copied ? "✓ Copied" : "Copy UPI ID"}
          </button>
          <button type="button" onClick={close} className="eg-pop-later">
            Abhi nahi, music sunne do
          </button>
        </div>

        <p className="mt-3 text-[0.68rem] leading-relaxed text-white/38">
          Button dabate hi aapki UPI app (GPay / PhonePe / Paytm) amount ke saath khul jaayegi. Ye
          site koi payment process ya store nahi karti — sirf aapki UPI app hi transaction confirm
          kar sakti hai.
        </p>
      </div>
    </div>
  );
}
