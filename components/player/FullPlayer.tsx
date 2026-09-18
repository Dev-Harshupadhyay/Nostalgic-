"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePlayer } from "./PlayerProvider";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";
import VinylArtwork from "./VinylArtwork";
import IconButton from "@/components/ui/IconButton";
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

const STATUS_TEXT: Record<string, string> = {
  idle: "Nothing playing",
  loading: "Loading next song… 🎧",
  buffering: "Buffering…",
  playing: "Now playing",
  paused: "Paused",
  ended: "Finished",
  error: "Playback error",
};

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
    queue,
    queueIndex,
    notify,
  } = usePlayer();

  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  /* Lock scroll, trap focus, restore focus on close. */
  useEffect(() => {
    if (!fullPlayerOpen) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])'
      );
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [fullPlayerOpen]);

  const share = useCallback(async () => {
    if (!current) return;
    const url = `https://www.youtube.com/watch?v=${current.youtubeId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: cleanTitle(current.title),
          text: `${cleanTitle(current.title)} — ${current.artist}`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      notify("Link copied to clipboard");
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return; // user dismissed the sheet
      notify("Could not share this song");
    }
  }, [current, notify]);

  if (!fullPlayerOpen || !current) return null;

  const fav = isFavourite(current);
  const loading = status === "loading";
  const statusText = STATUS_TEXT[status] ?? "";
  const upNext = queue[queueIndex + 1];

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`Now playing: ${cleanTitle(current.title)}`}
      ref={panelRef}
    >
      {/* Ambient backdrop derived from the artwork */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden bg-[#0a0606]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.thumbnail}
          alt=""
          className="h-full w-full scale-150 object-cover opacity-30 blur-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/78 to-black/96" />
      </div>

      {/* Header */}
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 pt-[max(0.9rem,env(safe-area-inset-top))] sm:px-7">
        <IconButton
          label="Close full player"
          tooltip="Back"
          onClick={closeFullPlayer}
          size="md"
          className="bg-white/8 hover:bg-white/14"
        >
          <ChevronDown size={22} />
        </IconButton>

        <div className="min-w-0 text-center">
          <p className="eyebrow" aria-live="polite">
            {statusText}
          </p>
          <p className="line-1 text-[0.72rem] text-white/45">{current.category}</p>
        </div>

        <IconButton
          label="Open queue"
          tooltip="Queue"
          onClick={toggleQueuePanel}
          size="md"
          className="bg-white/8 hover:bg-white/14"
        >
          <QueueIcon size={20} />
        </IconButton>
      </header>

      {/* Body */}
      <div className="scroll-y flex flex-1 flex-col items-center justify-center gap-6 px-5 py-4 sm:gap-7 sm:px-8">
        <VinylArtwork song={current} playing={isPlaying} loading={loading} size="full" />

        {/* Metadata */}
        <div className="w-full max-w-xl text-center">
          <h1
            key={current.youtubeId}
            className="fade-up line-2 text-lg font-bold leading-snug text-white sm:text-2xl"
          >
            {cleanTitle(current.title)}
          </h1>
          <p className="mt-1.5 text-sm text-white/58 sm:text-base">{current.artist}</p>

          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[0.7rem] text-white/40">
            <span className="rounded-full bg-white/7 px-2.5 py-0.5">• {current.category}</span>
            {current.language ? (
              <span className="rounded-full bg-white/7 px-2.5 py-0.5">{current.language}</span>
            ) : null}
            {current.year ? (
              <span className="rounded-full bg-white/7 px-2.5 py-0.5">{current.year}</span>
            ) : null}
            <span className="rounded-full bg-white/7 px-2.5 py-0.5">YouTube</span>
          </div>

          {error ? (
            <p role="alert" className="mt-3 text-xs text-[color:var(--color-rose)]">
              {error}
            </p>
          ) : null}
        </div>

        {/* Timeline */}
        <div className="w-full max-w-xl">
          <ProgressBar currentTime={currentTime} duration={duration} onSeek={seekTo} size="lg" />
        </div>

        {/* Main transport */}
        <PlayerControls size="lg" showExtras />

        {/* Secondary row */}
        <div className="flex w-full max-w-xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-1.5">
            <IconButton
              label={fav ? "Remove from favourites" : "Add to favourites"}
              tooltip="Favourite"
              onClick={() => toggleFavourite(current)}
              active={fav}
              tone={fav ? "rose" : "default"}
              aria-pressed={fav}
            >
              <Heart size={20} filled={fav} />
            </IconButton>

            <IconButton label="Share this song" tooltip="Share" onClick={share}>
              <Share size={19} />
            </IconButton>

            <a
              href={`https://www.youtube.com/watch?v=${current.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open this song on YouTube"
              data-tooltip="Open on YouTube"
              className="icon-btn tap-target h-11 w-11 text-white/65 hover:text-white"
            >
              <ExternalLink size={18} />
            </a>

            <IconButton label="Open queue" tooltip="Queue" onClick={toggleQueuePanel}>
              <QueueIcon size={19} />
            </IconButton>
          </div>

          <div className="flex items-center gap-2.5">
            <IconButton
              label={muted || volume === 0 ? "Unmute" : "Mute"}
              tooltip="Mute"
              onClick={toggleMute}
            >
              {muted || volume === 0 ? <VolumeMute size={20} /> : <Volume size={20} />}
            </IconButton>
            <input
              type="range"
              className="vol w-32 sm:w-40"
              min={0}
              max={100}
              step={1}
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              aria-valuetext={`${muted ? 0 : volume} percent`}
            />
          </div>
        </div>

        {upNext ? (
          <p className="line-1 max-w-xl text-center text-[0.7rem] text-white/32">
            Up next · {cleanTitle(upNext.title).slice(0, 52)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
