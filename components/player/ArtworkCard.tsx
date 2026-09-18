"use client";

import { memo, useEffect, useState } from "react";
import type { Song } from "@/lib/types";
import { Spinner } from "@/components/ui/Icons";

type Props = {
  song: Song;
  playing: boolean;
  loading?: boolean;
  /** Tailwind sizing for the wrapper, e.g. "h-12 w-12" or "w-full". */
  className?: string;
  /** Ambient amber bloom behind the art — for the large hero artwork only. */
  glow?: boolean;
  rounded?: string;
  alt?: string;
};

/**
 * Rounded album-art card used by the mini player and queue rows.
 *
 * Audio-only still holds: this renders the YouTube *thumbnail* image, never the
 * video surface. maxres does not exist for every upload, so a failed load falls
 * back to hqdefault before giving up.
 */
function ArtworkCardBase({
  song,
  playing,
  loading = false,
  className = "",
  glow = false,
  rounded,
  alt,
}: Props) {
  const [src, setSrc] = useState(`https://i.ytimg.com/vi/${song.youtubeId}/maxresdefault.jpg`);
  const [loaded, setLoaded] = useState(false);

  // Crossfade to the new artwork whenever the track changes.
  useEffect(() => {
    setSrc(`https://i.ytimg.com/vi/${song.youtubeId}/maxresdefault.jpg`);
    setLoaded(false);
  }, [song.youtubeId]);

  return (
    <div className={`pp-art ${className}`} style={rounded ? { borderRadius: rounded } : undefined}>
      {glow ? <span className={`pp-art-glow ${playing ? "is-playing" : ""}`} aria-hidden /> : null}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={song.youtubeId}
        src={src}
        alt={alt ?? ""}
        className={loaded ? "is-loaded" : ""}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!src.includes("hqdefault")) {
            setSrc(`https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg`);
          } else {
            setLoaded(true);
          }
        }}
      />

      {!loaded ? <span className="skeleton absolute inset-0" aria-hidden /> : null}

      {loading ? (
        <span className="absolute inset-0 grid place-items-center bg-black/45" aria-hidden>
          <Spinner size={18} className="text-[color:var(--color-amber)]" />
        </span>
      ) : null}
    </div>
  );
}

export default memo(ArtworkCardBase);
