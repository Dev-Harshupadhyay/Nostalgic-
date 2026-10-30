import type { Metadata } from "next";
import OldSongsHero from "@/components/old-songs/OldSongsHero";
import CategorySection from "@/components/music/CategorySection";
import SupportCard from "@/components/support/SupportCard";
import { songsByCategory } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Old Songs — Hindi Classics by Era & Mood",
  description:
    "Explore old Hindi songs by decade, mood and classic Bollywood collections. Evergreen has its own dedicated home on Nostalgic.",
  alternates: { canonical: "/old-songs" },
  openGraph: {
    title: "Old Songs — Hindi Classics by Era & Mood",
    description: "Radio-warm old Hindi classics, curated by era and mood.",
    url: "/old-songs",
  },
};

export default function Page() {
  // Keep the timeless Evergreen collection distinct; its own route remains the home for those picks.
  const buckets = songsByCategory("oldSongs").filter(
    (bucket) => bucket.category.trim().toLowerCase() !== "evergreen"
  );
  const total = buckets.reduce((sum, bucket) => sum + bucket.songs.length, 0);

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-6 sm:px-6">
      <OldSongsHero buckets={buckets} count={total} />
      <div className="mt-8">
        <CategorySection group="oldSongs" buckets={buckets} live={false} />
      </div>
      <div className="mt-8">
        <SupportCard compact />
      </div>
    </div>
  );
}
