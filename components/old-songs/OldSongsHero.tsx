"use client";

import Image from "next/image";
import GlowButton from "@/components/ui/GlowButton";
import { Play, Shuffle } from "@/components/ui/Icons";
import { usePlayer } from "@/components/player/PlayerProvider";
import { slugify } from "@/lib/format";
import type { Song } from "@/lib/types";
import { useI18n } from "@/components/i18n/LocaleProvider";

type Bucket = { category: string; songs: Song[] };

export default function OldSongsHero({ buckets, count }: { buckets: Bucket[]; count: number }) {
  const { playQueue } = usePlayer();
  const { t } = useI18n();
  const songs = buckets.flatMap((bucket) => bucket.songs);

  const shuffle = () => {
    if (!songs.length) return;
    const shuffled = [...songs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    playQueue(shuffled, 0);
  };

  return (
    <header className="old-songs-hero fade-up">
      <div className="old-songs-hero-glow" aria-hidden />
      <div className="old-songs-hero-copy">
        <p className="eyebrow">Memories · era-led collection</p>
        <h1>Old Songs<span>.</span><br /><em>Purane gaane, nayi si feeling.</em></h1>
        <p className="old-songs-lead">
          Radio-warm classics sorted by the eras and moods you came for. Evergreen has its own home—this page is for the old-song journey.
        </p>
        <div className="old-songs-actions">
          <GlowButton size="lg" aura onClick={() => playQueue(songs, 0)} disabled={!songs.length}>
            <Play size={16} /> {t.common.playAll}
          </GlowButton>
          <button type="button" className="btn btn-ghost px-5 py-2.5 text-sm" onClick={shuffle} disabled={!songs.length}>
            <Shuffle size={16} /> {t.common.shuffle}
          </button>
          <span className="old-songs-count">{count} {t.common.songs}</span>
        </div>
        <nav className="old-songs-filters" aria-label="Jump to an old-song collection">
          {buckets.map((bucket) => (
            <a key={bucket.category} href={`#oldSongs-${slugify(bucket.category)}`}>
              {bucket.category}<span>{bucket.songs.length}</span>
            </a>
          ))}
        </nav>
      </div>
      <div className="old-songs-art" aria-hidden="true">
        <Image
          src="/images/old-songs.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 60vw, 32vw"
          className="old-songs-art-image"
        />
        <div className="old-songs-art-caption"><span>THE GOLDEN SIDE</span><b>MEMORIES<br />ON REPEAT</b></div>
      </div>
    </header>
  );
}
