import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import CategorySection from "@/components/music/CategorySection";
import SupportCard from "@/components/support/SupportCard";
import { songsByCategory, getGroup } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Chhath Puja Songs — Chhath Geet, Bhajan & Traditional Music",
  description: "Chhath Puja music: Chhath geet, traditional Chhath songs, bhajan and the latest Chhath releases, streamed from YouTube.",
  alternates: { canonical: "/chhath" },
  openGraph: {
    title: "Chhath Puja Songs — Chhath Geet, Bhajan & Traditional Music",
    description: "Chhath Puja music: Chhath geet, traditional Chhath songs, bhajan and the latest Chhath releases, streamed from YouTube.",
    url: "/chhath",
  },
};

export default function Page() {
  const buckets = songsByCategory("chhathPuja");
  const total = getGroup("chhathPuja").length;

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
      <PageHeader
        eyebrow="Traditional vibes"
        title="Chhath Puja"
        emoji="🪔"
        description="Chhath geet, traditional songs and bhajan for Chhath Puja — the devotion, the folk melodies and the memories of home."
        count={total}
      />
      <div className="pb-6">
        <CategorySection group="chhathPuja" buckets={buckets} live={false} />
      </div>
      <div className="pb-4">
        <SupportCard compact />
      </div>
    </div>
  );
}
