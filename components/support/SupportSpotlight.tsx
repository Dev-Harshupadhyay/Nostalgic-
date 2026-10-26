"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import GlowButton from "@/components/ui/GlowButton";
import { SUPPORT, DEV, buildUpiLink } from "@/lib/site";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useUser } from "@/components/user/UserProvider";
import {
  UpiMark,
  GPayMark,
  PhonePeMark,
  PaytmMark,
  RazorpayMark,
} from "@/components/support/UpiMarks";
import QrModal from "@/components/support/QrModal";
import { startRazorpayCheckout } from "@/lib/razorpay-client";
import { ExternalLink } from "@/components/ui/Icons";

const HEADLINE = "Support Dev Harsh";
const SUBLINE = ["Ek", "chai", "ke", "paise,", "bahut", "saara", "code."];

type PaymentFeedback = {
  type: "success" | "error" | "info";
  message: string;
  paymentId?: string;
  orderId?: string;
} | null;

/**
 * Home-page support spotlight.
 *
 * Supports Razorpay Standard Web Checkout (Order creation + Modal + HMAC-SHA256
 * verification), direct UPI deep-links / QR code, and the universal Razorpay
 * payment link (https://razorpay.me/@pmharsh).
 */
export default function SupportSpotlight() {
  const { notify } = usePlayer();
  const { name: userName } = useUser();
  const [amount, setAmount] = useState<number>(SUPPORT.defaultAmount);
  const [custom, setCustom] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<PaymentFeedback>(null);
  /** null until measured, so we never render the wrong CTA during hydration. */
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  /* Decide which payment path to offer. `upi://` only resolves on a device that
     has a UPI app installed, so desktop gets a scannable QR instead. */
  useEffect(() => {
    const check = () =>
      setIsMobile(
        window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 820
      );
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Run the word animation only once the section is actually on screen. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const effective = useMemo(() => {
    if (!customMode) return amount;
    const n = Number(custom);
    return Number.isFinite(n) && n >= 1 ? Math.min(Math.round(n), 100000) : 0;
  }, [amount, custom, customMode]);

  const valid = effective >= 1;

  const payWithRazorpay = async () => {
    if (!valid) {
      const msg = "Minimum amount is ₹1 (100 paise). Pehle ek valid amount daaliye.";
      setFeedback({ type: "error", message: msg });
      notify(msg);
      return;
    }

    setProcessing(true);
    setFeedback(null);

    try {
      await startRazorpayCheckout({
        amountRupees: effective,
        customerName: userName || undefined,
        onSuccess: ({ paymentId, orderId, amountRupees }) => {
          const msg = `Payment of ₹${amountRupees} verified! Thank you for supporting ${DEV.fullName} ❤️`;
          setFeedback({
            type: "success",
            message: msg,
            paymentId,
            orderId,
          });
          notify(msg);
        },
        onDismiss: (message) => {
          setFeedback({ type: "info", message });
          notify(message);
        },
        onError: (message) => {
          setFeedback({ type: "error", message });
          notify(message);
        },
      });
    } finally {
      setProcessing(false);
    }
  };

  const pay = () => {
    if (!valid) {
      notify("Pehle ek valid amount daaliye");
      return;
    }
    // Desktop has no UPI app to hand off to — show a QR their phone can scan.
    if (!isMobile) {
      setQrOpen(true);
      return;
    }
    window.location.href = buildUpiLink(effective);
    window.setTimeout(() => {
      notify("Opening your UPI app… if nothing happens, use Razorpay Checkout or copy the UPI ID.");
    }, 1400);
  };

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT.upiId);
      setCopied(true);
      notify("UPI ID copied ❤️");
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      notify("Could not copy — UPI ID: " + SUPPORT.upiId);
    }
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="support-spotlight-heading"
      className="glass relative overflow-hidden rounded-[28px] px-5 py-8 sm:px-10 sm:py-12"
    >
      <div aria-hidden className="sp-aurora" />

      <div className="relative grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        {/* ------------------------------- Copy ------------------------------- */}
        <div>
          <p className="eyebrow">Creator support</p>

          <h2
            id="support-spotlight-heading"
            className="mt-2 text-[1.75rem] font-extrabold leading-tight tracking-tight sm:text-[2.35rem]"
          >
            <span className="sp-shimmer">{HEADLINE}</span>{" "}
            <span aria-hidden className="sp-heart">
              ❤️
            </span>
          </h2>

          <p className="mt-3 text-base font-semibold text-white/80 sm:text-lg" aria-label={SUBLINE.join(" ")}>
            {SUBLINE.map((word, i) => (
              <span
                key={`${word}-${i}`}
                aria-hidden
                className={visible ? "sp-word" : undefined}
                style={{
                  animationDelay: `${i * 78}ms`,
                  opacity: visible ? undefined : 0,
                  marginRight: "0.3em",
                }}
              >
                {word}
              </span>
            ))}
          </p>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/58">
            Ye player {DEV.fullName} ne banaya hai — bina ads, bina account, bina tracking. Agar
            yahan koi purana gaana mil gaya jo dil khush kar de, toh chhota sa support bahut matlab
            rakhta hai.
          </p>

          {/* Works-with marks */}
          <div className="mt-6">
            <span className="eyebrow">Works with</span>
            <ul className="mt-2.5 flex flex-wrap items-center gap-2">
              <li className="sp-chip">
                <RazorpayMark className="h-[18px] w-auto" />
              </li>
              <li className="sp-chip">
                <UpiMark className="h-[18px] w-auto" />
              </li>
              <li className="sp-chip">
                <GPayMark className="h-[18px] w-auto" />
              </li>
              <li className="sp-chip">
                <PhonePeMark className="h-[18px] w-auto" />
              </li>
              <li className="sp-chip">
                <PaytmMark className="h-[18px] w-auto" />
              </li>
            </ul>
          </div>
        </div>

        {/* ------------------------------ Actions ----------------------------- */}
        <div className="rounded-3xl border border-white/10 bg-black/28 p-5 backdrop-blur-sm sm:p-6">
          <span className="eyebrow">Choose an amount</span>

          <div className="mt-2.5 flex flex-wrap gap-2" role="group" aria-label="Support amount">
            {SUPPORT.presets.map((p) => {
              const active = !customMode && amount === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setCustomMode(false);
                    setAmount(p);
                    setFeedback(null);
                  }}
                  aria-pressed={active}
                  className={`btn sp-pill px-5 py-2 text-sm ${active ? "btn-glow" : "btn-ghost"}`}
                >
                  ₹{p}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setCustomMode(true);
                setFeedback(null);
              }}
              aria-pressed={customMode}
              className={`btn sp-pill px-5 py-2 text-sm ${customMode ? "btn-glow" : "btn-ghost"}`}
            >
              Custom
            </button>
          </div>

          {customMode ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label htmlFor="spotlight-amount" className="sr-only">
                Custom support amount in rupees
              </label>
              <div className="flex items-center gap-1.5 rounded-full border border-white/14 bg-white/5 px-4 py-2 focus-within:border-[color:var(--color-amber)]/70">
                <span className="text-sm text-white/55">₹</span>
                <input
                  id="spotlight-amount"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={100000}
                  value={custom}
                  onChange={(e) => {
                    setCustom(e.target.value);
                    setFeedback(null);
                  }}
                  placeholder="Enter amount (min ₹1)"
                  className="w-36 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                />
              </div>
              {custom && !valid ? (
                <span className="text-xs text-[color:var(--color-rose)]" role="alert">
                  Minimum amount is ₹1 (100 paise)
                </span>
              ) : null}
            </div>
          ) : null}

          {feedback ? (
            <div
              role={feedback.type === "error" ? "alert" : "status"}
              aria-live="polite"
              className={`mt-4 rounded-2xl border px-3.5 py-2.5 text-xs leading-relaxed ${
                feedback.type === "success"
                  ? "border-[#4fb3a5]/50 bg-[#4fb3a5]/12 text-[#b8f3ea]"
                  : feedback.type === "error"
                    ? "border-[color:var(--color-rose)]/50 bg-[color:var(--color-rose)]/12 text-[#ffc2cc]"
                    : "border-white/15 bg-white/6 text-white/75"
              }`}
            >
              <p className="font-semibold">{feedback.message}</p>
              {feedback.paymentId ? (
                <p className="mt-0.5 font-mono text-[0.65rem] opacity-80">
                  Payment ID: {feedback.paymentId}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-2.5">
            <span className={valid ? "sp-pulse-ring relative inline-flex" : "relative inline-flex"}>
              <GlowButton
                size="lg"
                aura
                onClick={payWithRazorpay}
                disabled={!valid || processing}
                className="w-full justify-center"
                aria-label={`Pay ₹${effective || 0} with Razorpay Checkout`}
              >
                <RazorpayMark className="h-[18px] w-auto" />
                {processing ? "Opening Razorpay…" : `Pay ₹${effective || 0} · Razorpay`}
              </GlowButton>
            </span>

            <button
              type="button"
              onClick={pay}
              disabled={!valid}
              className="btn btn-ghost w-full justify-center px-5 py-2.5 text-sm disabled:opacity-45"
              aria-label={
                isMobile === false
                  ? `Show QR code to pay ₹${effective || 0} to ${DEV.fullName}`
                  : `Support ${DEV.fullName} with ₹${effective || 0} via UPI app`
              }
            >
              <UpiMark className="h-[15px] w-auto" />
              {isMobile === false ? `Show UPI QR · ₹${effective || 0}` : `Pay ₹${effective || 0} via UPI App`}
            </button>

            {isMobile ? (
              <button
                type="button"
                onClick={() => valid && setQrOpen(true)}
                disabled={!valid}
                className="btn btn-ghost w-full justify-center px-5 py-2.5 text-sm disabled:opacity-45"
                aria-label={`Show QR code to pay ₹${effective || 0} to ${DEV.fullName}`}
              >
                <span aria-hidden>📱</span> QR se pay karo
              </button>
            ) : null}

            <button
              type="button"
              onClick={copyUpi}
              className={`btn btn-ghost sp-copy w-full justify-center px-5 py-2.5 text-sm ${
                copied ? "is-copied" : ""
              }`}
              aria-label={`Copy UPI ID ${SUPPORT.upiId}`}
            >
              {copied ? (
                <span className="sp-copy-label" key="done">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    aria-hidden
                    className="shrink-0"
                  >
                    <path
                      d="M4 12.5l5 5L20 6.5"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="sp-check-draw"
                    />
                  </svg>
                  UPI ID copied!
                </span>
              ) : (
                <span className="sp-copy-label" key="idle">
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    aria-hidden
                    className="shrink-0 opacity-70"
                  >
                    <rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
                    <path d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H15" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                  </svg>
                  Copy UPI · {SUPPORT.upiId}
                </span>
              )}
            </button>
          </div>

          {/* Universal Razorpay link right below the UPI buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#3395FF]/25 bg-[#3395FF]/[0.07] px-3.5 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <RazorpayMark className="h-[16px] w-auto shrink-0 text-white" />
              <div className="min-w-0">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-[#7ab8ff]">
                  Universal Link
                </p>
                <a
                  href={SUPPORT.razorpayLink}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className="line-1 inline-flex items-center gap-1 text-xs font-semibold text-white/90 underline decoration-[#3395FF]/50 underline-offset-4 hover:text-[color:var(--color-amber)]"
                >
                  {SUPPORT.razorpayLink}
                  <ExternalLink size={11} className="shrink-0 opacity-75" />
                </a>
              </div>
            </div>
            <a
              href={SUPPORT.razorpayLink}
              target="_blank"
              rel="noopener noreferrer external"
              className="btn btn-ghost px-3 py-1 text-[0.72rem] font-semibold text-white/90 hover:border-[#3395FF]/50"
            >
              Pay @pmharsh
              <ExternalLink size={11} />
            </a>
          </div>

          {isMobile === false ? (
            <p className="mt-3 text-center text-[0.72rem] text-white/45">
              Desktop par ho — Razorpay se turant pay karein ya QR scan kariye 📱
            </p>
          ) : null}

          <p className="mt-3 text-[0.7rem] leading-relaxed text-white/38">
            Razorpay Standard Checkout (UPI, Cards, NetBanking), direct UPI app, QR scan, ya{" "}
            <a
              href={SUPPORT.razorpayLink}
              target="_blank"
              rel="noopener noreferrer external"
              className="text-white/60 underline underline-offset-2 hover:text-[color:var(--color-amber)]"
            >
              {SUPPORT.razorpayLink}
            </a>{" "}
            se support kar sakte hain.
          </p>
        </div>
      </div>

      <QrModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        amount={effective}
        presets={SUPPORT.presets}
        onAmountChange={(a) => {
          setCustomMode(false);
          setAmount(a);
        }}
        notify={notify}
      />
    </section>
  );
}
