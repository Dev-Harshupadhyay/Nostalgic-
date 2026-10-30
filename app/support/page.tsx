import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import SupportCard from "@/components/support/SupportCard";
import DeveloperDashboard from "@/components/dev/DeveloperDashboard";
import { SUPPORT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support Dev Harsh ❤️",
  description:
    "Support Harsh Dev, the creator of Nostalgic Music Player. Contribute any amount over UPI and help keep the project growing.",
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
            default, or enter your own.
          </li>
          <li>
            <span className="font-semibold text-white/85">2.</span> Tap the Support button. On a
            phone, your UPI app opens with everything pre-filled.
          </li>
          <li>
            <span className="font-semibold text-white/85">3.</span> On a laptop, copy the UPI ID{" "}
            <code className="rounded bg-white/8 px-1.5 py-0.5 text-[color:var(--color-amber)]">
              {SUPPORT.upiId}
            </code>{" "}
            and pay from your phone.
          </li>
        </ol>
        <p className="mt-4 text-xs leading-relaxed text-white/38">
          This website never sees, processes or stores your payment details. Confirmation comes
          only from your own UPI app or bank — nothing here can mark a payment as successful.
        </p>
      </section>

      <DeveloperDashboard />
    </div>
  );
}
