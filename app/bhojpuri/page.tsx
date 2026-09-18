import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import CategorySection from "@/components/music/CategorySection";
import SupportCard from "@/components/support/SupportCard";
import { songsByCategory, getGroup } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Bhojpuri Songs — Hits, Classics, Folk & Bhakti",
  description: "Bhojpuri music collection: Bhojpuri hits, old classics, new releases, folk songs (lokgeet), bhakti geet and popular artists.",
  alternates: { canonical: "/bhojpuri" },
  openGraph: {
    title: "Bhojpuri Songs — Hits, Classics, Folk & Bhakti",
    description: "Bhojpuri music collection: Bhojpuri hits, old classics, new releases, folk songs (lokgeet), bhakti geet and popular artists.",
    url: "/bhojpuri",
  },
};

export default function Page() {
  const buckets = songsByCategory("bhojpuri");
  const total = getGroup("bhojpuri").length;

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
      <PageHeader
        eyebrow="Desi vibes"
        title="Bhojpuri"
        emoji="🎤"
        description="Bhojpuri hits, classics, folk songs, bhakti and tracks from the region's most-played artists."
        count={total}
      />
      <div className="pb-6">
        <CategorySection group="bhojpuri" buckets={buckets} live={false} />
      </div>
      <div className="pb-4">
        <SupportCard compact />
      </div>
    </div>
  );
}
