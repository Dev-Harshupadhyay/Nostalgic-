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
import { GPayMark, PhonePeMark, PaytmMark } from "@/components/support/UpiMarks";
import { usePlayer } from "@/components/player/PlayerProvider";
import QrModal from "@/components/support/QrModal";

type Props = { compact?: boolean; hideHeading?: boolean };

/**
 * Support card with a real UPI deep link.
 *
 * Honest by design: we open the user's UPI app and we never claim a payment
 * succeeded — only their bank/UPI app can confirm that. No payment backend is
 * faked here; the structure is ready for a gateway if one is added later.
 */
export default function SupportCard({ compact = false, hideHeading = false }: Props) {
  const { notify } = usePlayer();
  const [amount, setAmount] = useState<number>(SUPPORT.defaultAmount);
  const [custom, setCustom] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

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
    return Number.isFinite(n) && n > 0 ? Math.min(Math.round(n), 100000) : 0;
  }, [amount, custom, customMode]);

  const valid = effective > 0;

  /**
   * Deep-link into a UPI app. "any" uses the generic upi:// intent so the OS
   * lists every installed app; a specific id goes straight to that app via an
   * Android package intent (most reliable) or its own custom scheme.
   */
  const pay = (app: "any" | "gpay" | "phonepe" | "paytm" = "any") => {
    if (!valid) {
      notify("Enter a valid amount first");
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
      notify("Opening your UPI app… if nothing happens, copy the UPI ID.");
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
                }}
                aria-pressed={active}
                className={`btn px-5 py-2 text-sm ${
                  active
                    ? "btn-glow"
                    : "btn-ghost"
                }`}
              >
                ₹{p}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setCustomMode(true)}
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
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Enter amount"
                className="w-28 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
            </div>
            {custom && !valid ? (
              <span className="text-xs text-[color:var(--color-rose)]" role="alert">
                Enter a valid amount
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

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

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <GlowButton
          size="lg"
          aura
          onClick={() => pay("any")}
          disabled={!valid}
          aria-label={
            isMobile === false
              ? `Show QR code to pay ₹${effective || 0} to ${DEV.fullName}`
              : `Support ₹${effective || 0} via UPI`
          }
        >
          <span aria-hidden>{isMobile === false ? "📱" : "❤️"}</span>
          {isMobile === false ? `Show QR · ₹${effective || 0}` : `Support ₹${effective || 0}`}
        </GlowButton>

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

      <p className="mt-4 text-[0.7rem] leading-relaxed text-white/38">
        Tapping “Support” opens your UPI app (GPay, PhonePe, Paytm…) with the amount pre-filled.
        This site does not process or store any payment — only your UPI app can confirm a
        transaction. On desktop, scan the QR with your phone or copy the UPI ID.
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
