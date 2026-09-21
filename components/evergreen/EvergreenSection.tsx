"use client";

import { useEffect, useRef, useState } from "react";
import SongShelf from "@/components/music/SongShelf";
import { EVERGREEN_NOTES } from "@/lib/evergreen-notes";
import type { Song } from "@/lib/types";

type Bucket = { category: string; songs: Song[] };

/**
 * Evergreen shelves with a written note per category.
 * Each block reveals itself on scroll (IntersectionObserver, one-shot) and
 * degrades to "always visible" when reduced motion is preferred.
 */
function Block({ bucket, index }: { bucket: Bucket; index: number }) {
  const note = EVERGREEN_NOTES[bucket.category];
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className={`eg-block ${shown ? "is-in" : ""}`}>
      {note ? (
        <div className="eg-note">
          <div className="eg-note-head">
            <span className="eg-note-era">{note.era}</span>
            <span className="eg-note-line" aria-hidden />
            <span className="eg-note-count">{bucket.songs.length} songs</span>
          </div>
          <h3 className="eg-note-tag">{note.tagline}</h3>
          <p className="eg-note-story">{note.story}</p>
        </div>
      ) : null}

      <div className="eg-shelf">
        <SongShelf
          title={bucket.category}
          songs={bucket.songs}
          showPlayAll
          subtitle={note ? undefined : `${bucket.songs.length} songs in this collection`}
        />
      </div>
    </section>
  );
}

export default function EvergreenSection({ buckets }: { buckets: Bucket[] }) {
  return (
    <div className="space-y-14">
      {buckets.map((b, i) => (
        <Block key={b.category} bucket={b} index={i} />
      ))}
    </div>
  );
}
