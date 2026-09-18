"use client";

import { useEffect, useRef, useState } from "react";
import SongCard from "./SongCard";
import GlowButton from "@/components/ui/GlowButton";
import { usePlayer } from "@/components/player/PlayerProvider";
import type { Song } from "@/lib/types";
import { Play, ChevronRight, Spinner } from "@/components/ui/Icons";

type Props = {
  title: string;
  subtitle?: string;
  songs: Song[];
  /** When provided, the shelf tries to refresh itself with live YouTube data. */
  discover?: { group: string; category: string };
  showPlayAll?: boolean;
  compact?: boolean;
  emptyLabel?: string;
};

function Skeletons({ compact }: { compact?: boolean }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`card shrink-0 overflow-hidden ${compact ? "w-[150px]" : "w-[164px] sm:w-[188px]"}`}
        >
          <div className="skeleton aspect-square w-full" />
          <div className="space-y-2 p-3">
            <div className="skeleton h-3 w-4/5 rounded-full" />
            <div className="skeleton h-3 w-2/5 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}

export default function SongShelf({
  title,
  subtitle,
  songs,
  discover,
  showPlayAll = true,
  compact = false,
  emptyLabel = "Nothing here yet.",
}: Props) {
  const { playQueue } = usePlayer();
  const [items, setItems] = useState<Song[]>(songs);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const requested = useRef(false);

  useEffect(() => setItems(songs), [songs]);

  /* Lazily refresh with live YouTube data once the shelf scrolls into view. */
  useEffect(() => {
    if (!discover || requested.current) return;
    const el = shelfRef.current;
    if (!el) return;
    const controller = new AbortController();

    const run = async () => {
      requested.current = true;
      setRefreshing(true);
      try {
        const res = await fetch(
          `/api/youtube/discover?group=${encodeURIComponent(
            discover.group
          )}&category=${encodeURIComponent(discover.category)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("discover failed");
        const data = (await res.json()) as { results?: Song[]; error?: string };
        if (data.results?.length) setItems(data.results);
        if (data.error) setNotice(data.error);
      } catch {
        // Keep the bundled results; nothing breaks for the user.
      } finally {
        setRefreshing(false);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { rootMargin: "240px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      controller.abort();
    };
  }, [discover]);

  const scrollBy = (dir: 1 | -1) => {
    const el = shelfRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.82, 720), behavior: "smooth" });
  };

  return (
    <section className="relative" aria-labelledby={`shelf-${title.replace(/\s+/g, "-").toLowerCase()}`}>
      <header className="mb-3 flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <h2
            id={`shelf-${title.replace(/\s+/g, "-").toLowerCase()}`}
            className="flex items-center gap-2 text-[1.05rem] font-bold tracking-tight text-white sm:text-lg"
          >
            {title}
            {refreshing ? <Spinner size={14} className="text-[color:var(--color-amber)]" /> : null}
          </h2>
          {subtitle ? <p className="mt-0.5 text-xs text-white/45">{subtitle}</p> : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showPlayAll && items.length > 0 ? (
            <GlowButton
              size="sm"
              variant="ghost"
              onClick={() => playQueue(items, 0)}
              aria-label={`Play all songs in ${title}`}
            >
              <Play size={14} />
              <span className="hidden sm:inline">Play all</span>
            </GlowButton>
          ) : null}
          <div className="hidden items-center gap-1 lg:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label={`Scroll ${title} left`}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/12 text-white/60 transition hover:border-white/30 hover:text-white"
            >
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label={`Scroll ${title} right`}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/12 text-white/60 transition hover:border-white/30 hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {notice ? (
        <p className="mb-2 px-1 text-xs text-white/40" role="status">
          {notice}
        </p>
      ) : null}

      <div ref={shelfRef} className="scroll-x flex gap-3 px-1 pb-2 sm:gap-4">
        {items.length === 0 && refreshing ? <Skeletons compact={compact} /> : null}
        {items.length === 0 && !refreshing ? (
          <p className="py-8 text-sm text-white/40">{emptyLabel}</p>
        ) : null}
        {items.map((song, i) => (
          <SongCard
            key={song.id ?? song.youtubeId}
            song={song}
            contextQueue={items}
            priority={i < 4}
            compact={compact}
          />
        ))}
      </div>
    </section>
  );
}
