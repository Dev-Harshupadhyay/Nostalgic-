"use client";

import { memo, useCallback } from "react";
import { usePlayer } from "@/components/player/PlayerProvider";
import { shortTitle } from "@/lib/format";
import type { Song } from "@/lib/types";
import { Play, Pause, Plus } from "@/components/ui/Icons";

type Props = {
  song: Song;
  contextQueue?: Song[];
  priority?: boolean;
  compact?: boolean;
};

function SongCardBase({ song, contextQueue, priority = false, compact = false }: Props) {
  const { playSong, addToQueue, current, isPlaying, togglePlay } = usePlayer();
  const active = current?.youtubeId === song.youtubeId;
  const playingThis = active && isPlaying;

  const onPlay = useCallback(() => {
    if (active) togglePlay();
    else playSong(song, contextQueue);
  }, [active, togglePlay, playSong, song, contextQueue]);

  const onAdd = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      addToQueue(song);
    },
    [addToQueue, song]
  );

  return (
    <article
      className={`card group relative flex flex-col overflow-hidden ${
        compact ? "w-[150px] sm:w-[166px]" : "w-[164px] sm:w-[188px] lg:w-[196px]"
      } shrink-0`}
      style={{ scrollSnapAlign: "start" }}
      data-active={active}
    >
      <button
        type="button"
        onClick={onPlay}
        className="relative block w-full text-left"
        aria-label={playingThis ? `Pause ${song.title}` : `Play ${song.title}`}
      >
        <span className="art-glow relative block aspect-square w-full overflow-hidden rounded-t-[17px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={song.thumbnail}
            alt={`${song.title} — album artwork`}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            width={480}
            height={480}
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06] ${
              playingThis ? "art-pulse" : ""
            }`}
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.dataset.fallback) {
                img.dataset.fallback = "1";
                img.src = `https://i.ytimg.com/vi/${song.youtubeId}/mqdefault.jpg`;
              }
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent"
          />
          {song.duration ? (
            <span className="absolute right-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums text-white/90 backdrop-blur">
              {song.duration}
            </span>
          ) : null}

          <span
            className={`absolute bottom-2 left-2 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#ffd390] to-[#c9662b] text-[#150c05] shadow-[0_8px_24px_-8px_rgba(232,163,61,0.95)] transition-all duration-300 ${
              active
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
            }`}
          >
            {playingThis ? <Pause size={18} /> : <Play size={18} />}
          </span>

          {playingThis ? (
            <span className="eq absolute bottom-3.5 right-2.5" aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </span>
          ) : null}
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3
          className={`line-2 text-[0.82rem] font-semibold leading-snug ${
            active ? "text-[color:var(--color-amber)]" : "text-white/92"
          }`}
          title={song.title}
        >
          {shortTitle(song.title, 52)}
        </h3>
        <p className="line-1 text-[0.72rem] text-white/50" title={song.artist}>
          {song.artist || "YouTube"}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="rounded-full bg-white/6 px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-wider text-white/45">
            {song.category}
          </span>
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Add ${shortTitle(song.title, 30)} to queue`}
            className="grid h-7 w-7 place-items-center rounded-full border border-white/12 text-white/60 transition hover:border-[color:var(--color-amber)]/60 hover:text-[color:var(--color-amber)]"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(SongCardBase);
