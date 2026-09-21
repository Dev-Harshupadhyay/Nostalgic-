import type { Metadata } from "next";
import FavouritesClient from "@/components/favourites/FavouritesClient";
import SupportCard from "@/components/support/SupportCard";

export const metadata: Metadata = {
  title: "Favourites — Your Own Playlist",
  description:
    "Your favourite songs on Nostalgic, saved right on your device. Play the whole playlist one after another, shuffle it, or queue it up.",
  alternates: { canonical: "/favourites" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <div className="eg-scope mx-auto max-w-[1400px] px-4 pt-6 sm:px-6">
      <FavouritesClient />
      <div className="py-8">
        <SupportCard compact />
      </div>
    </div>
  );
}
