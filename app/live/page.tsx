import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import LiveClient from "@/components/live/LiveClient";

export const metadata: Metadata = {
  title: "Live Song",
  description:
    "Search any song and play it instantly — fetched live from YouTube through the official embedded player.",
  alternates: { canonical: "/live" },
  robots: { index: true, follow: true },
};

export default function LivePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-8 sm:px-6">
      <PageHeader
        eyebrow="Live from YouTube"
        title="Live Song"
        emoji="📡"
        description="Koi bhi gaana likhiye — seedha YouTube se fetch hoke turant bajega."
      />
      <LiveClient />
    </div>
  );
}
