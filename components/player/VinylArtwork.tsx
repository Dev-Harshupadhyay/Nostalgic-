"use client";

import { memo, useEffect, useState } from "react";
import type { Song } from "@/lib/types";
import { Spinner } from "@/components/ui/Icons";

type Props = {
  song: Song;
  playing: boolean;
  loading?: boolean;
  size?: "mini" | "full";
};

/**
 * Audio-only artwork: the YouTube video surface is never rendered. Instead the
 * thumbnail sits on a vinyl record that rotates while audio plays — the record
 * IS the playback indicator.
 *
 * The rotation uses a CSS animation that is paused (not removed) when playback
 * stops, so the record resumes from the same angle instead of snapping to 0deg.
 */
function VinylArtworkBase({ song, playing, loading = false, size = "full" }: Props) {
  const [src, setSrc] = useState(`https://i.ytimg.com/vi/${song.youtubeId}/maxresdefault.jpg`);
  const [loaded, setLoaded] = useState(false);

  // Crossfade: reset to the new artwork whenever the track changes.
  useEffect(() => {
    setSrc(`https://i.ytimg.com/vi/${song.youtubeId}/maxresdefault.jpg`);
    setLoaded(false);
  }, [song.youtubeId]);

  const isFull = size === "full";

  return (
    <div className={`vinyl-wrap ${isFull ? "vinyl-full" : "vinyl-mini"}`}>
      {isFull ? (
        <div
          aria-hidden
          className={`vinyl-halo ${playing ? "is-playing" : ""}`}
        />
      ) : null}

      <div
        className={`vinyl ${playing ? "is-spinning" : ""}`}
        data-loading={loading || undefined}
      >
        <div className="vinyl-disc" aria-hidden />

        <div className="vinyl-label">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={song.youtubeId}
            src={src}
            alt={isFull ? `Album artwork for ${song.title}` : ""}
            className={`vinyl-art ${loaded ? "is-loaded" : ""}`}
            loading={isFull ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => {
              // maxres doesn't exist for every video — fall back to hqdefault.
              if (!src.includes("hqdefault")) {
                setSrc(`https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg`);
              } else {
                setLoaded(true);
              }
            }}
          />
          {!loaded ? <span className="vinyl-art-skeleton skeleton" aria-hidden /> : null}
          <span className="vinyl-spindle" aria-hidden />
        </div>

        <div className="vinyl-sheen" aria-hidden />
      </div>

      {loading && isFull ? (
        <div className="vinyl-loading" role="status">
          <Spinner size={15} />
          <span>Loading next song… 🎧</span>
        </div>
      ) : null}
    </div>
  );
}

export default memo(VinylArtworkBase);
