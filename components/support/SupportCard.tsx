"use client";

import { useEffect, useMemo, useState } from "react";
import GlowButton from "@/components/ui/GlowButton";
import {
  SUPPORT,
  DEV,
  UPI_APPS,
  buildUpiLink,
  buildAppUpiLink,
  buildAndroidIntent,
} from "@/lib/site";
import {
  GPayMark,
  PhonePeMark,
  PaytmMark,
  RazorpayMark,
  UpiMark,
} from "@/components/support/UpiMarks";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useUser } from "@/components/user/UserProvider";
import QrModal from "@/components/support/QrModal";
import { startRazorpayCheckout } from "@/lib/razorpay-client";
import { ExternalLink } from "@/components/ui/Icons";

type Props = { compact?: boolean; hideHeading?: boolean };

type PaymentFeedback = {
  type: "success" | "error" | "info";
  message: string;
  paymentId?: string;
  orderId?: string;
} | null;

/**
 * Support card with:
 * 1. Razorpay Standard Web Checkout (Order creation + Modal + HMAC-SHA256 verification)
 * 2. Direct UPI deep links (GPay, PhonePe, Paytm, QR code, Copy UPI ID)
 * 3. Razorpay Universal Payment Link below the UPI section (https://razorpay.me/@pmharsh)
 */
export default function SupportCard({ compact = false, hideHeading = false }: Props) {
  const { notify } = usePlayer();
  const { name: userName } = useUser();
  const [amount, setAmount] = useState<number>(SUPPORT.defaultAmount);
  const [custom, setCustom] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<PaymentFeedback>(null);

  /* Desktop cannot hand off to a `upi://` app — offer a scannable QR instead. */
  useEffect(() => {
    const check = () =>
      setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 820);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const effective = useMemo(() => {
    if (!customMode) return amount;
    const n = Number(custom);
    return Number.isFinite(n) && n >= 1 ? Math.min(Math.round(n), 100000) : 0;
  }, [amount, custom, customMode]);

  const valid = effective >= 1;

  /**
   * Opens Razorpay Standard Web Checkout modal (`POST /api/create-order` ->
   * `window.Razorpay` -> `POST /api/verify-payment`).
   */
  const payWithRazorpay = async () => {
    if (!valid) {
      const msg = "Minimum amount is ₹1 (100 paise). Please enter a valid amount.";
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

  /**
   * Deep-link into a UPI app. "any" uses the generic upi:// intent so the OS
   * lists every installed app; a specific id goes straight to that app via an
   * Android package intent (most reliable) or its own custom scheme.
   */
  const pay = (app: "any" | "gpay" | "phonepe" | "paytm" = "any") => {
    if (!valid) {
      notify("Enter a valid amount first (minimum ₹1)");
      return;
    }
    if (!isMobile) {
      setQrOpen(true);
      return;
    }
    const isAndroid = /android/i.test(navigator.userAgent);
    const url =
      app !== "any" && isAndroid
        ? buildAndroidIntent(app, effective)
        : app !== "any"
          ? buildAppUpiLink(app, effective)
          : buildUpiLink(effective);

    window.location.href = url;
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

  const copyUniversalLink = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT.razorpayLink);
      setCopiedLink(true);
      notify("Razorpay link copied ❤️");
      window.setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      notify("Razorpay link: " + SUPPORT.razorpayLink);
    }
  };

  return (
    <section
      aria-labelledby="support-heading"
      className={`glass relative overflow-hidden rounded-3xl ${compact ? "p-5" : "p-6 sm:p-8"}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(232,163,61,0.35),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(212,84,106,0.26),transparent_70%)] blur-2xl"
      />

      {hideHeading ? (
        <h2 id="support-heading" className="sr-only">
          Support Dev Harsh
        </h2>
      ) : (
        <>
          <p className="eyebrow">Creator support</p>
          <h2 id="support-heading" className="mt-1.5 text-xl font-extrabold sm:text-2xl">
            Support Dev Harsh <span aria-hidden>❤️</span>
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
            Enjoying the music player? Your support helps me keep building and improving it.
          </p>
        </>
      )}

      <div className="mt-5">
        <span className="eyebrow">Choose an amount</span>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Support amount">
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
                className={`btn px-5 py-2 text-sm ${
                  active ? "btn-glow" : "btn-ghost"
                }`}
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
            className={`btn px-5 py-2 text-sm ${customMode ? "btn-glow" : "btn-ghost"}`}
          >
            Custom
          </button>
        </div>

        {customMode ? (
          <div className="mt-3 flex items-center gap-2">
            <label htmlFor="custom-amount" className="sr-only">
              Custom support amount in rupees
            </label>
            <div className="flex items-center gap-1.5 rounded-full border border-white/14 bg-white/5 px-4 py-2 focus-within:border-[color:var(--color-amber)]/70">
              <span className="text-sm text-white/55">₹</span>
              <input
                id="custom-amount"
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
      </div>

      {/* Payment status / verification feedback */}
      {feedback ? (
        <div
          role={feedback.type === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`mt-4 rounded-2xl border px-4 py-3 text-xs leading-relaxed ${
            feedback.type === "success"
              ? "border-[#4fb3a5]/50 bg-[#4fb3a5]/12 text-[#b8f3ea]"
              : feedback.type === "error"
                ? "border-[color:var(--color-rose)]/50 bg-[color:var(--color-rose)]/12 text-[#ffc2cc]"
                : "border-white/15 bg-white/6 text-white/75"
          }`}
        >
          <p className="font-semibold">{feedback.message}</p>
          {feedback.paymentId ? (
            <p className="mt-1 font-mono text-[0.68rem] opacity-80">
              Payment ID: {feedback.paymentId} · Order ID: {feedback.orderId}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Mobile direct UPI app buttons */}
      {isMobile ? (
        <div className="upi-apps mt-5" role="group" aria-label="Pay with a UPI app">
          {UPI_APPS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => pay(a.id)}
              disabled={!valid}
              className="upi-app"
              style={{ ["--hue" as string]: a.hue }}
              aria-label={`Pay ₹${effective || 0} with ${a.label}`}
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
      ) : null}

      {/* Primary checkout + UPI actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <GlowButton
          size="lg"
          aura
          onClick={payWithRazorpay}
          disabled={!valid || processing}
          aria-label={`Pay ₹${effective || 0} with Razorpay Checkout`}
        >
          <RazorpayMark className="h-[18px] w-auto" />
          {processing
            ? "Opening Razorpay…"
            : `Pay ₹${effective || 0} · Razorpay`}
        </GlowButton>

        <button
          type="button"
          onClick={() => pay("any")}
          disabled={!valid}
          className="btn btn-ghost px-5 py-2.5 text-sm disabled:opacity-45"
          aria-label={
            isMobile === false
              ? `Show QR code to pay ₹${effective || 0} to ${DEV.fullName}`
              : `Support ₹${effective || 0} via UPI app`
          }
        >
          <UpiMark className="h-[15px] w-auto" />
          {isMobile === false ? `Show UPI QR · ₹${effective || 0}` : `UPI App · ₹${effective || 0}`}
        </button>

        {isMobile ? (
          <button
            type="button"
            onClick={() => valid && setQrOpen(true)}
            disabled={!valid}
            className="btn btn-ghost px-5 py-2.5 text-sm disabled:opacity-45"
            aria-label={`Show QR code to pay ₹${effective || 0} to ${DEV.fullName}`}
          >
            <span aria-hidden>📱</span> QR se pay karo
          </button>
        ) : null}

        <button
          type="button"
          onClick={copyUpi}
          className={`btn btn-ghost sp-copy px-5 py-2.5 text-sm ${copied ? "is-copied" : ""}`}
          aria-label={`Copy UPI ID ${SUPPORT.upiId}`}
        >
          {copied ? (
            <span className="sp-copy-label" key="done">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden className="shrink-0">
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
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden className="shrink-0 opacity-70">
                <rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
                <path d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H15" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
              </svg>
              Copy UPI · {SUPPORT.upiId}
            </span>
          )}
        </button>
      </div>

      {/* Universal Razorpay link below the UPI section */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#3395FF]/25 bg-[#3395FF]/[0.07] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <RazorpayMark className="h-[18px] w-auto shrink-0 text-white" />
          <div className="min-w-0">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#7ab8ff]">
              Razorpay Universal Payment Link
            </p>
            <a
              href={SUPPORT.razorpayLink}
              target="_blank"
              rel="noopener noreferrer external"
              className="line-1 inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 underline decoration-[#3395FF]/50 underline-offset-4 transition hover:text-[color:var(--color-amber)]"
            >
              {SUPPORT.razorpayLink}
              <ExternalLink size={12} className="shrink-0 opacity-75" />
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={SUPPORT.razorpayLink}
            target="_blank"
            rel="noopener noreferrer external"
            className="btn btn-ghost px-3.5 py-1.5 text-xs font-semibold text-white/90 hover:border-[#3395FF]/50"
          >
            Open @pmharsh
            <ExternalLink size={12} />
          </a>
          <button
            type="button"
            onClick={copyUniversalLink}
            className="btn btn-ghost px-3.5 py-1.5 text-xs font-semibold text-white/75"
            aria-label={`Copy Razorpay universal link ${SUPPORT.razorpayLink}`}
          >
            {copiedLink ? "✓ Link copied" : "Copy link"}
          </button>
        </div>
      </div>

      <p className="mt-4 text-[0.7rem] leading-relaxed text-white/38">
        Pay securely via Razorpay Standard Checkout (UPI, Cards, NetBanking &amp; Wallets with
        server-side HMAC-SHA256 verification), open your UPI app directly, scan the QR code, or use
        the universal Razorpay link{" "}
        <a
          href={SUPPORT.razorpayLink}
          target="_blank"
          rel="noopener noreferrer external"
          className="text-white/60 underline underline-offset-2 hover:text-[color:var(--color-amber)]"
        >
          {SUPPORT.razorpayLink}
        </a>
        .
      </p>

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
