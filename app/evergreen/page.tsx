import type { Metadata } from "next";
import CategorySection from "@/components/music/CategorySection";
import SupportCard from "@/components/support/SupportCard";
import EvergreenHero from "@/components/evergreen/EvergreenHero";
import { songsByCategory, getGroup } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Evergreen — 2000s Solid Hits & Timeless Bollywood",
  description:
    "Evergreen collection by Nostalgic — 2000s solid hits, timeless melodies, romantic evergreen, retro gold and golden oldies. Sadabahar gaane jo kabhi purane nahi hote.",
  alternates: { canonical: "/evergreen" },
  keywords: [
    "evergreen songs",
    "2000s hindi songs",
    "2000s solid hits",
    "sadabahar gaane",
    "evergreen bollywood",
  ],
  openGraph: {
    title: "Evergreen — 2000s Solid Hits & Timeless Bollywood",
    description:
      "2000s solid hits, evergreen melodies, romantic classics and retro gold — all in one glowing collection.",
    url: "/evergreen",
  },
};

export default function Page() {
  const buckets = songsByCategory("evergreen");
  const total = getGroup("evergreen").length;

  return (
    <div className="eg-scope mx-auto max-w-[1400px] px-4 sm:px-6">
      <EvergreenHero count={total} />

      <div className="pb-6">
        <CategorySection group="evergreen" buckets={buckets} live={false} />
      </div>

      <div className="pb-4">
        <SupportCard compact />
      </div>
    </div>
  );
}
