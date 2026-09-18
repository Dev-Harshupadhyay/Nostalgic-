import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import CategorySection from "@/components/music/CategorySection";
import SupportCard from "@/components/support/SupportCard";
import { songsByCategory, getGroup } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "New & Trending — Latest Hindi, Regional & Bhojpuri Songs",
  description: "New and trending Indian music fetched live from YouTube search: latest Hindi songs, popular tracks, viral picks and new Bhojpuri releases.",
  alternates: { canonical: "/trending" },
  openGraph: {
    title: "New & Trending — Latest Hindi, Regional & Bhojpuri Songs",
    description: "New and trending Indian music fetched live from YouTube search: latest Hindi songs, popular tracks, viral picks and new Bhojpuri releases.",
    url: "/trending",
  },
};

export default function Page() {
  const buckets = songsByCategory("trending");
  const total = getGroup("trending").length;

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
      <PageHeader
        eyebrow="What's new"
        title="New & Trending"
        emoji="🔥"
        description="Fresh results pulled live from YouTube search — new Hindi songs, popular tracks, viral picks, regional favourites and new Bhojpuri releases."
        count={total}
      />
      <div className="pb-6">
        <CategorySection group="trending" buckets={buckets} live={true} />
      </div>
      <div className="pb-4">
        <SupportCard compact />
      </div>
    </div>
  );
}
