"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import GlowButton from "@/components/ui/GlowButton";
import { SUPPORT, DEV, buildUpiLink } from "@/lib/site";
import { usePlayer } from "@/components/player/PlayerProvider";
import { UpiMark, GPayMark, PhonePeMark, PaytmMark } from "@/components/support/UpiMarks";
import QrModal from "@/components/support/QrModal";

const HEADLINE = "Support Dev Harsh";
const SUBLINE = ["Ek", "chai", "ke", "paise,", "bahut", "saara", "code."];

/**
 * Home-page support spotlight.
 *
 * Same honest UPI behaviour as SupportCard — we only ever open the user's UPI
 * app via a standard deep link and never claim a payment succeeded. This is the
 * louder, more visual presentation used on the landing page.
 */
export default function SupportSpotlight() {
  const { notify } = usePlayer();
  const [amount, setAmount] = useState<number>(SUPPORT.defaultAmount);
  const [custom, setCustom] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  /** null until measured, so we never render the wrong CTA during hydration. */
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  /* Decide which payment path to offer. `upi://` only resolves on a device that
     has a UPI app installed, so desktop gets a scannable QR instead. Coarse
     pointer + narrow viewport is a better signal here than user-agent sniffing. */
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
    return Number.isFinite(n) && n > 0 ? Math.min(Math.round(n), 100000) : 0;
  }, [amount, custom, customMode]);

  const valid = effective > 0;

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
              onClick={() => setCustomMode(true)}
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

          <div className="mt-5 flex flex-col gap-2.5">
            <span className={valid ? "sp-pulse-ring relative inline-flex" : "relative inline-flex"}>
              <GlowButton
                size="lg"
                aura
                onClick={pay}
                disabled={!valid}
                className="w-full justify-center"
                aria-label={
                  isMobile === false
                    ? `Show QR code to pay ₹${effective || 0} to ${DEV.fullName}`
                    : `Support ${DEV.fullName} with ₹${effective || 0} via UPI`
                }
              >
                <span aria-hidden>{isMobile === false ? "📱" : "❤️"}</span>
                {isMobile === false ? `Show QR · ₹${effective || 0}` : `Pay ₹${effective || 0} via UPI`}
              </GlowButton>
            </span>

            <GlowButton
              size="lg"
              variant="ghost"
              onClick={copyUpi}
              className="w-full justify-center"
              aria-label={`Copy UPI ID ${SUPPORT.upiId}`}
            >
              {copied ? "Copied ✓" : `Copy UPI · ${SUPPORT.upiId}`}
            </GlowButton>
          </div>

          {isMobile === false ? (
            <p className="mt-3 text-center text-[0.72rem] text-white/45">
              Desktop par ho — QR scan kariye apne phone ke UPI app se 📱
            </p>
          ) : null}

          <p className="mt-4 text-[0.7rem] leading-relaxed text-white/38">
            “Pay” aapka UPI app kholta hai (GPay, PhonePe, Paytm…) amount pehle se bhara hua. Ye site
            koi payment process ya store nahi karti — transaction sirf aapka UPI app confirm kar
            sakta hai. Desktop par UPI ID copy karke phone se pay kar lijiye.
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
