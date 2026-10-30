"use client";

import { useMemo, useState } from "react";
import GlowButton from "@/components/ui/GlowButton";
import { SUPPORT, buildUpiLink } from "@/lib/site";
import { usePlayer } from "@/components/player/PlayerProvider";

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

  const effective = useMemo(() => {
    if (!customMode) return amount;
    const n = Number(custom);
    return Number.isFinite(n) && n > 0 ? Math.min(Math.round(n), 100000) : 0;
  }, [amount, custom, customMode]);

  const valid = effective > 0;

  const pay = () => {
    if (!valid) {
      notify("Enter a valid amount first");
      return;
    }
    // Deep-links into GPay / PhonePe / Paytm / any UPI app on the device.
    window.location.href = buildUpiLink(effective);
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

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <GlowButton size="lg" aura onClick={pay} disabled={!valid} aria-label={`Support ₹${effective || 0} via UPI`}>
          <span aria-hidden>❤️</span>
          Support ₹{effective || 0}
        </GlowButton>

        <GlowButton size="lg" variant="ghost" onClick={copyUpi}>
          {copied ? "Copied ✓" : `Copy UPI · ${SUPPORT.upiId}`}
        </GlowButton>
      </div>

      <p className="mt-4 text-[0.7rem] leading-relaxed text-white/38">
        Tapping “Support” opens your UPI app (GPay, PhonePe, Paytm…) with the amount pre-filled.
        This site does not process or store any payment — only your UPI app can confirm a
        transaction. On desktop, copy the UPI ID and pay from your phone.
      </p>
    </section>
  );
}
