"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayer } from "./PlayerProvider";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";
import { cleanTitle } from "@/lib/format";
import {
  ChevronDown,
  Heart,
  Share,
  Queue as QueueIcon,
  Volume,
  VolumeMute,
  ExternalLink,
} from "@/components/ui/Icons";

export default function FullPlayer() {
  const {
    current,
    fullPlayerOpen,
    closeFullPlayer,
    currentTime,
    duration,
    seekTo,
    volume,
    setVolume,
    muted,
    toggleMute,
    isPlaying,
    status,
    error,
    toggleFavourite,
    isFavourite,
    toggleQueuePanel,
    registerHost,
    notify,
  } = usePlayer();

  const hostRef = useRef<HTMLDivElement>(null);
  const [videoMode, setVideoMode] = useState(false);

  /* Claim the persistent YouTube iframe while the video view is open, then hand
     it back to the mini player. The iframe itself is never re-created. */
  useEffect(() => {
    if (fullPlayerOpen && videoMode && hostRef.current) {
      registerHost(hostRef.current);
      return () => registerHost(null);
    }
    return;
  }, [fullPlayerOpen, videoMode, registerHost]);

  useEffect(() => {
    if (!fullPlayerOpen) {
      setVideoMode(false);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullPlayerOpen]);

  const share = useCallback(async () => {
    if (!current) return;
    const url = `https://www.youtube.com/watch?v=${current.youtubeId}`;
    const data = { title: current.title, text: `${current.title} — ${current.artist}`, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      notify("Link copied to clipboard");
    } catch {
      notify("Could not share this song");
    }
  }, [current, notify]);

  if (!fullPlayerOpen || !current) return null;
  const fav = isFavourite(current);

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`Now playing: ${current.title}`}
    >
      {/* Ambient backdrop derived from the artwork */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden bg-[#0b0708]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.thumbnail}
          alt=""
          className="h-full w-full scale-150 object-cover opacity-35 blur-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/75 to-black/95" />
      </div>

      <header className="flex shrink-0 items-center justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <button
          type="button"
          onClick={closeFullPlayer}
          aria-label="Close full player"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/8 text-white/85 backdrop-blur transition hover:bg-white/14"
        >
          <ChevronDown size={20} />
        </button>
        <div className="min-w-0 text-center">
          <p className="eyebrow">Now playing</p>
          <p className="line-1 text-[0.72rem] text-white/50">{current.category}</p>
        </div>
        <button
          type="button"
          onClick={toggleQueuePanel}
          aria-label="Open queue"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/8 text-white/85 backdrop-blur transition hover:bg-white/14"
        >
          <QueueIcon size={19} />
        </button>
      </header>

      <div className="scroll-y flex flex-1 flex-col items-center justify-center gap-6 px-5 py-5 sm:px-8">
        {/* Artwork / video */}
        <div className="relative mb-2 w-full max-w-[min(72vw,320px)] sm:max-w-[360px]">
          <div
            aria-hidden
            className={`absolute -inset-6 -z-10 rounded-full bg-[radial-gradient(circle,rgba(232,163,61,0.45),transparent_68%)] blur-2xl ${
              isPlaying ? "halo" : "opacity-40"
            }`}
          />
          <div
            className={`relative aspect-square w-full overflow-hidden rounded-[26px] border border-white/12 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95)] ${
              isPlaying && !videoMode ? "art-pulse" : ""
            }`}
          >
            <div
              ref={hostRef}
              className={`absolute inset-0 ${videoMode ? "opacity-100" : "pointer-events-none opacity-0"}`}
            />
            {!videoMode ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${current.youtubeId}/maxresdefault.jpg`}
                  alt={`${current.title} artwork`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = current.thumbnail;
                  }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18),transparent_38%)]"
                />
              </>
            ) : null}
            {status === "loading" ? (
              <div className="absolute inset-0 skeleton" aria-hidden />
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setVideoMode((v) => !v)}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/14 bg-[#100a09]/95 px-4 py-1.5 text-[0.7rem] font-semibold text-white/85 shadow-[0_8px_22px_-8px_rgba(0,0,0,0.9)] backdrop-blur transition hover:border-[color:var(--color-amber)]/60 hover:text-white"
            aria-pressed={videoMode}
          >
            {videoMode ? "Show artwork" : "Show video"}
          </button>
        </div>

        {/* Meta */}
        <div className="w-full max-w-xl text-center">
          <h1 className="line-2 text-lg font-bold leading-snug text-white sm:text-2xl">
            {cleanTitle(current.title)}
          </h1>
          <p className="mt-1 text-sm text-white/55">{current.artist}</p>
          {error ? (
            <p role="alert" className="mt-2 text-xs text-[color:var(--color-rose)]">
              {error}
            </p>
          ) : null}
        </div>

        {/* Progress */}
        <div className="w-full max-w-xl">
          <ProgressBar currentTime={currentTime} duration={duration} onSeek={seekTo} />
        </div>

        {/* Controls */}
        <PlayerControls size="lg" showExtras />

        {/* Secondary row */}
        <div className="flex w-full max-w-xl flex-wrap items-center justify-center gap-4 sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleFavourite(current)}
              aria-label={fav ? "Remove from favourites" : "Add to favourites"}
              aria-pressed={fav}
              className={`grid h-10 w-10 place-items-center rounded-full transition ${
                fav
                  ? "bg-[color:var(--color-rose)]/16 text-[color:var(--color-rose)]"
                  : "text-white/60 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Heart size={19} filled={fav} />
            </button>
            <button
              type="button"
              onClick={share}
              aria-label="Share this song"
              className="grid h-10 w-10 place-items-center rounded-full text-white/60 transition hover:bg-white/8 hover:text-white"
            >
              <Share size={18} />
            </button>
            <a
              href={`https://www.youtube.com/watch?v=${current.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open this song on YouTube"
              className="grid h-10 w-10 place-items-center rounded-full text-white/60 transition hover:bg-white/8 hover:text-white"
            >
              <ExternalLink size={17} />
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className="grid h-10 w-10 place-items-center rounded-full text-white/60 transition hover:bg-white/8 hover:text-white"
            >
              {muted || volume === 0 ? <VolumeMute size={19} /> : <Volume size={19} />}
            </button>
            <input
              type="range"
              className="vol w-28 sm:w-36"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
