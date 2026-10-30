import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import CategorySection from "@/components/music/CategorySection";
import SupportCard from "@/components/support/SupportCard";
import { songsByCategory, getGroup } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Old Songs — 90s, 2000s & Evergreen Bollywood Classics",
  description: "Listen to nostalgic old Hindi songs: 90s hits, 2000s hits, evergreen Bollywood, romantic classics, sad classics and retro hits.",
  alternates: { canonical: "/old-songs" },
  openGraph: {
    title: "Old Songs — 90s, 2000s & Evergreen Bollywood Classics",
    description: "Listen to nostalgic old Hindi songs: 90s hits, 2000s hits, evergreen Bollywood, romantic classics, sad classics and retro hits.",
    url: "/old-songs",
  },
};

export default function Page() {
  const buckets = songsByCategory("oldSongs");
  const total = getGroup("oldSongs").length;

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
      <PageHeader
        eyebrow="Memories"
        title="Old Songs"
        emoji="🎵"
        description="Nostalgic classics from the 90s, 2000s and the golden era of Bollywood — evergreen melodies, romantic classics and retro hits."
        count={total}
      />
      <div className="pb-6">
        <CategorySection group="oldSongs" buckets={buckets} live={false} />
      </div>
      <div className="pb-4">
        <SupportCard compact />
      </div>
    </div>
  );
}
