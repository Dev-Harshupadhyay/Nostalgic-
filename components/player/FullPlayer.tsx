"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePlayer } from "./PlayerProvider";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";
import ArtworkCard from "./ArtworkCard";
import NowPlaying from "./NowPlaying";
import Marquee from "./Marquee";
import IconButton from "@/components/ui/IconButton";
import { cleanTitle } from "@/lib/format";
import {
  ChevronDown,
  Heart,
  Share,
  Queue as QueueIcon,
  ExternalLink,
} from "@/components/ui/Icons";

const STATUS_COPY: Record<string, string> = {
  idle: "Choose a song to start",
  loading: "Loading video…",
  buffering: "Buffering…",
  playing: "Playing on YouTube",
  paused: "Paused",
  ended: "Finished",
  error: "Could not play this video",
};

export default function FullPlayer() {
  const {
    current,
    fullPlayerOpen,
    openFullPlayer,
    closeFullPlayer,
    playerMountRef,
    currentTime,
    duration,
    seekTo,
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

  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!fullPlayerOpen) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeFullPlayer();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input, iframe, [tabindex]:not([tabindex="-1"])'
      );
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [fullPlayerOpen, closeFullPlayer]);

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
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        notify("YouTube link copied");
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (shareError) {
      if ((shareError as Error)?.name !== "AbortError") notify("Could not share this song");
    }
  }, [current, notify]);

  if (!current) return null;

  const favourite = isFavourite(current);
  const upNext = queue[queueIndex + 1] ?? null;
  const videoUrl = `https://www.youtube.com/watch?v=${current.youtubeId}`;

  return (
    <div className={`yt-stage-root ${fullPlayerOpen ? "is-expanded" : "is-docked"}`}>
      {fullPlayerOpen ? (
        <button
          type="button"
          className="yt-stage-backdrop"
          aria-label="Close full player"
          onClick={closeFullPlayer}
        />
      ) : null}

      <section
        ref={panelRef}
        className="yt-stage-card"
        role={fullPlayerOpen ? "dialog" : undefined}
        aria-modal={fullPlayerOpen ? true : undefined}
        aria-label={fullPlayerOpen ? `Now playing: ${cleanTitle(current.title)}` : undefined}
      >
        <header className="yt-stage-head">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <NowPlaying status={status} />
              <span className="yt-stage-source">Official YouTube player</span>
            </div>
            <p className="mt-1 line-1 text-[0.68rem] text-white/48">
              {current.category}{current.language ? ` · ${current.language}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <IconButton label="Open playback queue" tooltip="Queue" onClick={toggleQueuePanel} size="sm">
              <QueueIcon size={17} />
            </IconButton>
            {fullPlayerOpen ? (
              <button
                ref={closeRef}
                type="button"
                onClick={closeFullPlayer}
                aria-label="Close full player"
                data-tooltip="Minimize player"
                className="icon-btn tap-target grid h-9 w-9 place-items-center text-white/72 hover:text-white"
              >
                <ChevronDown size={19} />
              </button>
            ) : (
              <button
                type="button"
                onClick={openFullPlayer}
                aria-label="Expand video player"
                data-tooltip="Expand player"
                className="icon-btn tap-target grid h-9 w-9 place-items-center text-white/72 hover:text-white"
              >
                <ChevronDown size={17} className="rotate-180" />
              </button>
            )}
          </div>
        </header>

        <div className="yt-stage-layout">
          {/* Keep YouTube visible but compact beside the audio controls; never hide or shrink below policy minimums. */}
          <div className="yt-stage-video" aria-label="Visible YouTube video player">
          <div ref={playerMountRef} className="yt-player-host" />
        </div>

        <div className="yt-stage-details">
          <div className="yt-stage-song">
            <ArtworkCard
              song={current}
              playing={isPlaying}
              className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
              rounded="14px"
              alt={`Thumbnail for ${cleanTitle(current.title)}`}
            />
            <div className="min-w-0 flex-1">
              <h2 className="line-1 text-sm font-bold text-white sm:text-base" title={current.title}>
                <Marquee text={cleanTitle(current.title)} />
              </h2>
              <p className="line-1 mt-1 text-xs text-white/52">{current.artist || "YouTube creator"}</p>
              {error ? <p role="alert" className="mt-1 line-2 text-[0.68rem] text-[color:var(--color-rose)]">{error}</p> : null}
            </div>
            <div className="yt-stage-actions">
              <IconButton
                label={favourite ? "Remove from favourites" : "Add to favourites"}
                tooltip="Favourite"
                active={favourite}
                aria-pressed={favourite}
                onClick={() => toggleFavourite(current)}
                size="sm"
              >
                <Heart size={17} filled={favourite} />
              </IconButton>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open this video on YouTube"
                data-tooltip="Open on YouTube"
                className="icon-btn tap-target grid h-9 w-9 place-items-center text-white/68 hover:text-white"
              >
                <ExternalLink size={16} />
              </a>
              <IconButton label="Share YouTube link" tooltip="Share" onClick={share} size="sm" className="yt-stage-share">
                <Share size={16} />
              </IconButton>
            </div>
          </div>

          <div className="yt-stage-progress">
            <ProgressBar currentTime={currentTime} duration={duration} onSeek={seekTo} size="sm" />
          </div>
          <div className="yt-stage-controls">
            <PlayerControls size={fullPlayerOpen ? "md" : "sm"} showExtras={fullPlayerOpen} showVolume />
          </div>

          {fullPlayerOpen && upNext ? (
            <button type="button" onClick={toggleQueuePanel} className="yt-stage-upnext">
              <span>UP NEXT</span>
              <strong>{cleanTitle(upNext.title)}</strong>
              <span>Open queue →</span>
            </button>
          ) : null}
          <p className="yt-stage-footnote">{STATUS_COPY[status] ?? "YouTube playback"} · keep the visible video player on-screen while listening.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
