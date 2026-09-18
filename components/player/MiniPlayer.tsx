"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "./PlayerProvider";
import ProgressBar from "./ProgressBar";
import { shortTitle } from "@/lib/format";
import {
  Play,
  Pause,
  Prev,
  Next,
  Queue as QueueIcon,
  Heart,
  Volume,
  VolumeMute,
  Spinner,
  ChevronDown,
} from "@/components/ui/Icons";

export default function MiniPlayer() {
  const {
    current,
    isPlaying,
    status,
    togglePlay,
    next,
    previous,
    currentTime,
    duration,
    seekTo,
    openFullPlayer,
    fullPlayerOpen,
    toggleQueuePanel,
    registerHost,
    toggleFavourite,
    isFavourite,
    volume,
    setVolume,
    muted,
    toggleMute,
    error,
  } = usePlayer();

  const hostRef = useRef<HTMLDivElement>(null);

  /* The mini player owns the persistent iframe whenever the full player isn't
     showing the video. It stays 1x1 and visually hidden — audio keeps playing. */
  useEffect(() => {
    if (!fullPlayerOpen && hostRef.current) registerHost(hostRef.current);
  }, [fullPlayerOpen, registerHost, current]);

  if (!current) return null;
  const fav = isFavourite(current);
  const loading = status === "loading" || status === "buffering";

  return (
    <>
      {/* Persistent iframe host — kept in the DOM, visually tiny. */}
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 left-0 -z-10 h-[1px] w-[1px] overflow-hidden opacity-0"
      >
        <div ref={hostRef} className="h-full w-full" />
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-[60] transition-transform duration-300 ${
          fullPlayerOpen ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="player-surface safe-b mx-auto max-w-[1400px] border-x-0 border-b-0 sm:mb-3 sm:rounded-2xl sm:border">
          {/* Progress on top for mobile */}
          <div className="px-3 pt-1.5 sm:hidden">
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={seekTo}
              showTimes={false}
              compact
            />
          </div>

          <div className="flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-2.5">
            {/* Artwork + meta -> opens full player */}
            <button
              type="button"
              onClick={openFullPlayer}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
              aria-label={`Open full player for ${shortTitle(current.title, 40)}`}
            >
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl sm:h-14 sm:w-14">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current.thumbnail}
                  alt=""
                  className={`h-full w-full object-cover ${isPlaying ? "art-pulse" : ""}`}
                />
                {loading ? (
                  <span className="absolute inset-0 grid place-items-center bg-black/55">
                    <Spinner size={16} />
                  </span>
                ) : null}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  {isPlaying ? (
                    <span className="eq h-2.5" aria-hidden>
                      <span />
                      <span />
                      <span />
                      <span />
                    </span>
                  ) : null}
                  <span className="line-1 block text-[0.8rem] font-semibold text-white/92 sm:text-sm">
                    {shortTitle(current.title, 46)}
                  </span>
                </span>
                <span className="line-1 block text-[0.68rem] text-white/45 sm:text-xs">
                  {error ? (
                    <span className="text-[color:var(--color-rose)]">{error}</span>
                  ) : (
                    current.artist
                  )}
                </span>
              </span>
            </button>

            {/* Desktop seek */}
            <div className="hidden w-[38%] max-w-[420px] shrink-0 items-center gap-3 md:flex">
              <ProgressBar currentTime={currentTime} duration={duration} onSeek={seekTo} />
            </div>

            {/* Controls */}
            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
              <button
                type="button"
                onClick={() => toggleFavourite(current)}
                aria-label={fav ? "Remove from favourites" : "Add to favourites"}
                aria-pressed={fav}
                className={`hidden h-9 w-9 place-items-center rounded-full transition sm:grid ${
                  fav ? "text-[color:var(--color-rose)]" : "text-white/50 hover:text-white"
                }`}
              >
                <Heart size={17} filled={fav} />
              </button>

              <button
                type="button"
                onClick={previous}
                aria-label="Previous song"
                className="hidden h-10 w-10 place-items-center rounded-full text-white/75 transition hover:text-white active:scale-90 sm:grid"
              >
                <Prev size={19} />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="btn btn-glow h-11 w-11 !p-0 sm:h-12 sm:w-12"
              >
                {loading ? (
                  <Spinner size={19} />
                ) : isPlaying ? (
                  <Pause size={19} />
                ) : (
                  <Play size={19} className="translate-x-[1px]" />
                )}
              </button>

              <button
                type="button"
                onClick={next}
                aria-label="Next song"
                className="grid h-10 w-10 place-items-center rounded-full text-white/75 transition hover:text-white active:scale-90"
              >
                <Next size={19} />
              </button>

              <div className="hidden items-center gap-1.5 lg:flex">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="grid h-9 w-9 place-items-center rounded-full text-white/55 transition hover:text-white"
                >
                  {muted || volume === 0 ? <VolumeMute size={17} /> : <Volume size={17} />}
                </button>
                <input
                  type="range"
                  className="vol w-20"
                  min={0}
                  max={100}
                  value={muted ? 0 : volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label="Volume"
                />
              </div>

              <button
                type="button"
                onClick={toggleQueuePanel}
                aria-label="Open queue"
                className="grid h-9 w-9 place-items-center rounded-full text-white/55 transition hover:text-white"
              >
                <QueueIcon size={18} />
              </button>

              <button
                type="button"
                onClick={openFullPlayer}
                aria-label="Open full player"
                className="grid h-9 w-9 place-items-center rounded-full text-white/55 transition hover:text-white sm:hidden"
              >
                <ChevronDown size={18} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
