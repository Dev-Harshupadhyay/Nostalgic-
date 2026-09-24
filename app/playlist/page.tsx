import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import MyPlaylistClient from "@/components/playlist/MyPlaylistClient";

export const metadata: Metadata = {
  title: "My Playlist",
  description: "Paste a public YouTube playlist link and play it as one queue.",
  alternates: { canonical: "/playlist" },
};

export default function PlaylistPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-7 sm:px-6 sm:py-10">
      <PageHeader
        eyebrow="Your YouTube collection"
        title="My Playlist"
        description="Apni public YouTube playlist ka link paste kijiye. Gaane yahin ek queue mein fetch ho jayenge."
        emoji="🎶"
      />
      <div className="mt-7">
        <MyPlaylistClient />
      </div>
    </div>
  );
}
