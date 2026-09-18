"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { SUPPORT, DEV, buildUpiLink } from "@/lib/site";
import { Close } from "@/components/ui/Icons";
import { UpiMark, GPayMark, PhonePeMark, PaytmMark } from "@/components/support/UpiMarks";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Amount to encode. Changing it re-renders the QR live. */
  amount: number;
  presets: number[];
  onAmountChange: (amount: number) => void;
  notify: (message: string) => void;
};

/**
 * Desktop QR flow.
 *
 * A phone cannot be reached by `upi://` from a laptop, so instead we encode the
 * exact same UPI deep link into a QR the user scans with their phone's UPI app.
 * The QR is regenerated whenever the amount changes, so what you scan always
 * matches what is selected. As everywhere else, no payment is processed or
 * confirmed here — only the user's UPI app can do that.
 */
export default function QrModal({
  open,
  onClose,
  amount,
  presets,
  onAmountChange,
  notify,
}: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const effective = customMode
    ? (() => {
        const n = Number(custom);
        return Number.isFinite(n) && n > 0 ? Math.min(Math.round(n), 100000) : 0;
      })()
    : amount;

  const valid = effective > 0;
  const upiLink = valid ? buildUpiLink(effective) : "";

  /* Re-encode whenever the amount changes. */
  useEffect(() => {
    if (!open || !valid) {
      setDataUrl(null);
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(upiLink, {
      width: 520,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0b0b0d", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [open, upiLink, valid]);

  /* Focus trap + Escape + scroll lock, matching the other dialogs. */
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 120);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input, a[href]"
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
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      prevFocus?.focus?.();
    };
  }, [open, onClose]);

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

  const pick = (p: number) => {
    setCustomMode(false);
    onAmountChange(p);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-title"
      aria-describedby="qr-desc"
      className="fixed inset-0 z-[110] grid place-items-center px-4"
    >
      <button
        type="button"
        aria-label="Close QR dialog"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/72 backdrop-blur-md"
      />

      <div
        ref={panelRef}
        className="surface-warm fade-up relative w-full max-w-[420px] overflow-hidden rounded-[28px] px-6 py-7 text-center"
      >
        <div aria-hidden className="sp-aurora" />

        <div className="relative">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close QR dialog"
            className="icon-btn absolute -right-1 -top-1"
          >
            <Close size={18} />
          </button>

          <p className="eyebrow">Scan to pay</p>
          <h2 id="qr-title" className="mt-1.5 text-xl font-extrabold">
            <span className="sp-shimmer">Support {DEV.fullName}</span>
          </h2>
          <p id="qr-desc" className="mx-auto mt-2 max-w-[19rem] text-[0.82rem] leading-relaxed text-white/58">
            Apne phone ka UPI app kholiye aur ye QR scan kar lijiye — amount pehle se bhara hua
            aayega.
          </p>

          {/* -------------------------------- QR -------------------------------- */}
          <div className="mt-5 flex justify-center">
            <div className="rounded-3xl bg-white p-3.5 shadow-[0_18px_50px_-12px_rgba(232,163,61,0.55)]">
              {dataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={dataUrl}
                  alt={`UPI QR code to pay ₹${effective} to ${SUPPORT.upiId}`}
                  width={208}
                  height={208}
                  className="h-52 w-52 rounded-xl"
                />
              ) : (
                <div className="grid h-52 w-52 place-items-center rounded-xl bg-black/5">
                  <span className="text-[0.75rem] font-semibold text-black/45">
                    {valid ? "Generating…" : "Enter an amount"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <p className="mt-3 text-lg font-extrabold text-[color:var(--color-amber)]" aria-live="polite">
            ₹{effective || 0}
          </p>
          <p className="text-[0.72rem] text-white/45">{SUPPORT.upiId}</p>

          {/* ----------------------------- Amounts ------------------------------ */}
          <div className="mt-5">
            <span className="eyebrow">Change amount</span>
            <div
              className="mt-2 flex flex-wrap justify-center gap-2"
              role="group"
              aria-label="Support amount"
            >
              {presets.map((p) => {
                const active = !customMode && amount === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => pick(p)}
                    aria-pressed={active}
                    className={`btn sp-pill px-4 py-1.5 text-[0.82rem] ${
                      active ? "btn-glow" : "btn-ghost"
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
                className={`btn sp-pill px-4 py-1.5 text-[0.82rem] ${
                  customMode ? "btn-glow" : "btn-ghost"
                }`}
              >
                Custom
              </button>
            </div>

            {customMode ? (
              <div className="mt-3 flex justify-center">
                <label htmlFor="qr-amount" className="sr-only">
                  Custom support amount in rupees
                </label>
                <div className="flex items-center gap-1.5 rounded-full border border-white/14 bg-white/5 px-4 py-2 focus-within:border-[color:var(--color-amber)]/70">
                  <span className="text-sm text-white/55">₹</span>
                  <input
                    id="qr-amount"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={100000}
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    placeholder="Enter amount"
                    autoFocus
                    className="w-28 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={copyUpi}
            className={`btn btn-ghost sp-copy mt-4 w-full justify-center px-5 py-2.5 text-sm ${
              copied ? "is-copied" : ""
            }`}
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
                Copy UPI ID instead
              </span>
            )}
          </button>

          <ul className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            <li className="sp-chip">
              <UpiMark className="h-[15px] w-auto" />
            </li>
            <li className="sp-chip">
              <GPayMark className="h-[15px] w-auto" />
            </li>
            <li className="sp-chip">
              <PhonePeMark className="h-[15px] w-auto" />
            </li>
            <li className="sp-chip">
              <PaytmMark className="h-[15px] w-auto" />
            </li>
          </ul>

          <p className="mt-4 text-[0.68rem] leading-relaxed text-white/38">
            Ye site koi payment process ya store nahi karti — transaction sirf aapka UPI app confirm
            kar sakta hai.
          </p>
        </div>
      </div>
    </div>
  );
}
