import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/layout/PageHeader";
import SearchClient from "@/components/search/SearchClient";

export const metadata: Metadata = {
  title: "Search Music",
  description:
    "Search old Hindi songs, singers, Bhojpuri tracks, Chhath geet and trending music — results come live from YouTube.",
  alternates: { canonical: "/search" },
  robots: { index: true, follow: true },
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-8 sm:px-6">
      <PageHeader
        eyebrow="Global search"
        title="Search"
        emoji="🔎"
        description="Find any song by title, singer or category. Results are fetched live from YouTube."
      />
      <Suspense fallback={<div className="skeleton h-14 w-full rounded-2xl" />}>
        <SearchClient />
      </Suspense>
    </div>
  );
}
