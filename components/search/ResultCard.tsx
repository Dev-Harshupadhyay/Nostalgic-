"use client";

import { memo, useCallback, useState } from "react";
import { usePlayer } from "@/components/player/PlayerProvider";
import { shortTitle } from "@/lib/format";
import type { Song } from "@/lib/types";
import { Play, Pause, Plus, Check, Heart } from "@/components/ui/Icons";

type Props = {
  song: Song;
  /** Full result list, so playing one song queues the rest behind it. */
  contextQueue?: Song[];
};

/**
 * A single YouTube search result.
 *
 * Thumbnail / title / channel all come straight from YouTube — nothing here is
 * invented. The card is a plain <li> with real <button>s so keyboard and screen
 * reader users get the same affordances as pointer users.
 */
function ResultCardBase({ song, contextQueue }: Props) {
  const { playSong, addToQueue, toggleFavourite, isFavourite, current, isPlaying, togglePlay } =
    usePlayer();
  const [queued, setQueued] = useState(false);

  const active = current?.youtubeId === song.youtubeId;
  const playingThis = active && isPlaying;
  const fav = isFavourite(song);

  const onPlay = useCallback(() => {
    if (active) togglePlay();
    else playSong(song, contextQueue);
  }, [active, togglePlay, playSong, song, contextQueue]);

  const onQueue = useCallback(() => {
    addToQueue(song);
    setQueued(true);
    window.setTimeout(() => setQueued(false), 1600);
  }, [addToQueue, song]);

  return (
    <li
      className={`group relative overflow-hidden rounded-2xl border transition duration-300 ${
        active
          ? "border-[color:var(--color-amber)]/40 bg-[color:var(--color-amber)]/10"
          : "border-white/8 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.06]"
      }`}
    >
      <div className="flex items-center gap-3 p-2.5 sm:gap-4 sm:p-3">
        {/* ---------------------------- Thumbnail ---------------------------- */}
        <button
          type="button"
          onClick={onPlay}
          aria-label={playingThis ? `Pause ${song.title}` : `Play ${song.title}`}
          className="relative aspect-video w-[104px] shrink-0 overflow-hidden rounded-xl bg-black/40 sm:w-[136px]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={song.thumbnail}
            alt=""
            loading="lazy"
            decoding="async"
            width={320}
            height={180}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span
            className={`absolute inset-0 grid place-items-center bg-black/55 transition ${
              playingThis ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
            }`}
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--color-amber)] text-black shadow-lg">
              {playingThis ? <Pause size={16} /> : <Play size={16} />}
            </span>
          </span>
          {song.duration ? (
            <span className="absolute bottom-1 right-1 rounded-md bg-black/80 px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums text-white/90">
              {song.duration}
            </span>
          ) : null}
        </button>

        {/* ------------------------------ Meta ------------------------------- */}
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onPlay} className="block w-full text-left">
            <p
              className={`line-2 text-sm font-semibold leading-snug ${
                active ? "text-[color:var(--color-amber)]" : "text-white/92"
              }`}
              title={song.title}
            >
              {shortTitle(song.title, 90)}
            </p>
            <p className="line-1 mt-1 text-xs text-white/48">{song.artist}</p>
          </button>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={onPlay}
              className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-amber)]/16 px-3 py-1.5 text-[0.72rem] font-semibold text-[color:var(--color-amber)] transition hover:bg-[color:var(--color-amber)]/26"
            >
              {playingThis ? <Pause size={12} /> : <Play size={12} />}
              {playingThis ? "Pause" : "Play"}
            </button>

            <button
              type="button"
              onClick={onQueue}
              aria-label={`Add ${song.title} to queue`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-[0.72rem] font-semibold text-white/68 transition hover:border-white/28 hover:text-white"
            >
              {queued ? <Check size={12} /> : <Plus size={12} />}
              {queued ? "Added" : "Queue"}
            </button>

            <button
              type="button"
              onClick={() => toggleFavourite(song)}
              aria-label={fav ? `Remove ${song.title} from favourites` : `Add ${song.title} to favourites`}
              aria-pressed={fav}
              className={`tap-target grid h-8 w-8 place-items-center rounded-full transition ${
                fav
                  ? "text-[color:var(--color-rose)]"
                  : "text-white/38 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Heart size={14} filled={fav} />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export default memo(ResultCardBase);
