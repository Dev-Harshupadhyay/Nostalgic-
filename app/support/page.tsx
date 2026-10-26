import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import SupportCard from "@/components/support/SupportCard";
import DeveloperDashboard from "@/components/dev/DeveloperDashboard";
import { SUPPORT } from "@/lib/site";
import { RazorpayMark } from "@/components/support/UpiMarks";
import { ExternalLink } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Support Dev Harsh ❤️",
  description:
    "Support Harsh Dev, the creator of Nostalgic Music Player. Contribute any amount via Razorpay Checkout, UPI, or https://razorpay.me/@pmharsh.",
  alternates: { canonical: "/support" },
  openGraph: {
    title: "Support Dev Harsh ❤️",
    description:
      "Enjoying the music player? Your support helps Harsh keep building and improving it.",
    url: "/support",
  },
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 pb-8 sm:px-6">
      <PageHeader
        eyebrow="Creator support"
        title="Support Dev Harsh"
        emoji="❤️"
        description="Enjoying the music player? Your support helps me keep building and improving it."
      />

      <SupportCard hideHeading />

      <section className="glass rounded-3xl p-6 sm:p-7">
        <h2 className="text-base font-bold">How it works</h2>
        <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-white/60">
          <li>
            <span className="font-semibold text-white/85">1.</span> Pick an amount — ₹25 is the
            default, or enter your own (minimum ₹1 / 100 paise).
          </li>
          <li>
            <span className="font-semibold text-white/85">2.</span> Tap{" "}
            <span className="font-semibold text-white/85">Pay with Razorpay</span> to open the
            Razorpay Standard Checkout modal (supports UPI, Cards, NetBanking &amp; Wallets) with
            server-side HMAC-SHA256 payment verification.
          </li>
          <li>
            <span className="font-semibold text-white/85">3.</span> Or pay directly over UPI using{" "}
            <code className="rounded bg-white/8 px-1.5 py-0.5 text-[color:var(--color-amber)]">
              {SUPPORT.upiId}
            </code>{" "}
            or the Razorpay Universal Link{" "}
            <a
              href={SUPPORT.razorpayLink}
              target="_blank"
              rel="noopener noreferrer external"
              className="inline-flex items-center gap-1 font-semibold text-[#7ab8ff] underline decoration-[#3395FF]/50 underline-offset-4 hover:text-[color:var(--color-amber)]"
            >
              {SUPPORT.razorpayLink}
              <ExternalLink size={12} />
            </a>
            .
          </li>
        </ol>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#3395FF]/25 bg-[#3395FF]/[0.07] px-4 py-3.5">
          <div className="flex items-center gap-3">
            <RazorpayMark className="h-[20px] w-auto shrink-0 text-white" />
            <div>
              <p className="text-xs font-bold text-white/90">
                Direct Razorpay.me Universal Payment Link
              </p>
              <p className="text-xs text-white/55">
                Prefer paying directly in your browser? Open{" "}
                <span className="font-mono text-[#7ab8ff]">{SUPPORT.razorpayLink}</span>
              </p>
            </div>
          </div>
          <a
            href={SUPPORT.razorpayLink}
            target="_blank"
            rel="noopener noreferrer external"
            className="btn btn-glow px-4 py-2 text-xs font-bold"
          >
            Open {SUPPORT.razorpayLink}
            <ExternalLink size={13} />
          </a>
        </div>
      </section>

      <DeveloperDashboard />
    </div>
  );
}
