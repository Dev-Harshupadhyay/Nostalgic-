"use client";

import { memo, useCallback } from "react";
import { usePlayer } from "@/components/player/PlayerProvider";
import { shortTitle } from "@/lib/format";
import type { Song } from "@/lib/types";
import { Play, Pause, Plus, Heart } from "@/components/ui/Icons";

type Props = {
  song: Song;
  index?: number;
  contextQueue?: Song[];
  showActions?: boolean;
};

function SongRowBase({ song, index, contextQueue, showActions = true }: Props) {
  const { playSong, addToQueue, toggleFavourite, isFavourite, current, isPlaying, togglePlay } =
    usePlayer();
  const active = current?.youtubeId === song.youtubeId;
  const playingThis = active && isPlaying;
  const fav = isFavourite(song);

  const onPlay = useCallback(() => {
    if (active) togglePlay();
    else playSong(song, contextQueue);
  }, [active, togglePlay, playSong, song, contextQueue]);

  return (
    <li
      className={`group flex items-center gap-3 rounded-2xl border px-2.5 py-2 transition ${
        active
          ? "border-[color:var(--color-amber)]/35 bg-[color:var(--color-amber)]/10"
          : "border-transparent hover:border-white/10 hover:bg-white/5"
      }`}
    >
      {typeof index === "number" ? (
        <span className="hidden w-6 shrink-0 text-center text-xs tabular-nums text-white/35 sm:block">
          {playingThis ? (
            <span className="eq mx-auto" aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </span>
          ) : (
            index + 1
          )}
        </span>
      ) : null}

      <button
        type="button"
        onClick={onPlay}
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl"
        aria-label={playingThis ? `Pause ${song.title}` : `Play ${song.title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={song.thumbnail}
          alt=""
          loading="lazy"
          decoding="async"
          width={120}
          height={120}
          className="h-full w-full object-cover"
        />
        <span className="absolute inset-0 grid place-items-center bg-black/55 text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          {playingThis ? <Pause size={16} /> : <Play size={16} />}
        </span>
      </button>

      <button type="button" onClick={onPlay} className="min-w-0 flex-1 text-left">
        <p
          className={`line-1 text-sm font-semibold ${
            active ? "text-[color:var(--color-amber)]" : "text-white/90"
          }`}
          title={song.title}
        >
          {shortTitle(song.title, 70)}
        </p>
        <p className="line-1 text-xs text-white/45">
          {song.artist}
          {song.duration ? <span className="text-white/30"> · {song.duration}</span> : null}
        </p>
      </button>

      {showActions ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => toggleFavourite(song)}
            aria-label={fav ? "Remove from favourites" : "Add to favourites"}
            aria-pressed={fav}
            className={`grid h-8 w-8 place-items-center rounded-full transition ${
              fav ? "text-[color:var(--color-rose)]" : "text-white/45 hover:text-white"
            }`}
          >
            <Heart size={16} filled={fav} />
          </button>
          <button
            type="button"
            onClick={() => addToQueue(song)}
            aria-label="Add to queue"
            className="grid h-8 w-8 place-items-center rounded-full text-white/45 transition hover:text-[color:var(--color-amber)]"
          >
            <Plus size={16} />
          </button>
        </div>
      ) : null}
    </li>
  );
}

export default memo(SongRowBase);
