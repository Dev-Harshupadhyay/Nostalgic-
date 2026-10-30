"use client";

import SongShelf from "./SongShelf";
import type { GroupKey, Song } from "@/lib/types";

type Props = {
  group: GroupKey;
  buckets: { category: string; songs: Song[] }[];
  /** When true each category refreshes itself from live YouTube search. */
  live?: boolean;
};

export default function CategorySection({ group, buckets, live = false }: Props) {
  return (
    <div className="space-y-10">
      {buckets.map(({ category, songs }, i) => (
        <div key={category} className="fade-up" style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
          <SongShelf
            title={category}
            songs={songs}
            discover={live ? { group, category } : undefined}
            subtitle={
              live ? "Live results from YouTube search" : `${songs.length} songs in this collection`
            }
          />
        </div>
      ))}
    </div>
  );
}
