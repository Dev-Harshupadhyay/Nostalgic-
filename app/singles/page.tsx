import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import CategorySection from "@/components/music/CategorySection";
import SupportCard from "@/components/support/SupportCard";
import { songsByCategory, getGroup } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Singles — One Song, One Mood",
  description: "A clean collection of individual Hindi songs, picked one at a time for every mood.",
  alternates: { canonical: "/singles" },
  openGraph: {
    title: "Singles — One Song, One Mood",
    description: "A clean collection of individual Hindi songs, picked one at a time for every mood.",
    url: "/singles",
  },
};

export default function Page() {
  const buckets = songsByCategory("singleSongs");
  const total = getGroup("singleSongs").length;

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
      <PageHeader
        eyebrow="One song, one mood"
        title="Singles"
        emoji="💿"
        description="Individual songs, hand-picked. No playlists, no filler — just one song at a time."
        count={total}
      />
      <div className="pb-6">
        <CategorySection group="singleSongs" buckets={buckets} live={false} />
      </div>
      <div className="pb-4">
        <SupportCard compact />
      </div>
    </div>
  );
}
