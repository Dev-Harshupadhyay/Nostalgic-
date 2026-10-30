import type { Metadata } from "next";
import EvergreenSection from "@/components/evergreen/EvergreenSection";
import SupportCard from "@/components/support/SupportCard";
import EvergreenHero from "@/components/evergreen/EvergreenHero";
import { songsByCategory, getGroup } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Evergreen — Timeless Hindi Classics & Sada-bahar Songs",
  description:
    "Evergreen by Nostalgic: timeless Hindi melodies, romantic classics, retro gold and golden oldies—curated by lasting appeal, not only release year.",
  alternates: { canonical: "/evergreen" },
  keywords: [
    "evergreen songs",
    "2000s hindi songs",
    "2000s solid hits",
    "sadabahar gaane",
    "evergreen bollywood",
  ],
  openGraph: {
    title: "Evergreen — Timeless Hindi Classics & Sada-bahar Songs",
    description:
      "Timeless Hindi melodies, romantic classics, retro gold and golden oldies—curated by lasting appeal.",
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
        <EvergreenSection buckets={buckets} />
      </div>

      <div className="pb-4">
        <SupportCard compact />
      </div>
    </div>
  );
}
