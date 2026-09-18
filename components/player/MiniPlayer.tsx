"use client";

import { usePlayer } from "./PlayerProvider";
import ProgressBar from "./ProgressBar";
import ArtworkCard from "./ArtworkCard";
import Marquee from "./Marquee";
import IconButton from "@/components/ui/IconButton";
import { cleanTitle, formatTime } from "@/lib/format";
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
    toggleFavourite,
    isFavourite,
    volume,
    setVolume,
    muted,
    toggleMute,
    error,
    canGoNext,
    canGoPrevious,
  } = usePlayer();

  if (!current) return null;

  const fav = isFavourite(current);
  const loading = status === "loading" || status === "buffering";
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[60] transition-transform duration-300 ${
        fullPlayerOpen ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="pp-mini safe-b relative mx-auto max-w-[1400px] sm:mb-3">
        {/* Hairline progress on mobile — the draggable bar lives on desktop. */}
        <div className="pp-mini-progress md:hidden" aria-hidden>
          <span style={{ width: `${pct}%` }} />
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
          {/* Artwork + meta → opens the full player */}
          <button
            type="button"
            onClick={openFullPlayer}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl text-left"
            aria-label={`Open full player for ${cleanTitle(current.title)}`}
          >
            <ArtworkCard
              song={current}
              playing={isPlaying}
              className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
              rounded="14px"
            />

            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                {isPlaying ? (
                  <span className="eq h-2.5 shrink-0" aria-hidden>
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                ) : null}
                <Marquee
                  text={cleanTitle(current.title)}
                  className="text-[0.84rem] font-semibold text-white/92 sm:text-sm"
                />
              </span>
              <span className="line-1 mt-0.5 block text-[0.7rem] text-white/45 sm:text-xs">
                {error ? (
                  <span className="text-[color:var(--color-rose)]">{error}</span>
                ) : (
                  <>
                    {current.artist}
                    <span className="hidden tabular-nums text-white/30 sm:inline">
                      {" · "}
                      {formatTime(currentTime)} / {duration ? formatTime(duration) : "--:--"}
                    </span>
                  </>
                )}
              </span>
            </span>
          </button>

          {/* Desktop: full draggable timeline */}
          <div className="hidden w-[32%] max-w-[420px] shrink-0 md:block">
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={seekTo}
              size="sm"
              showTimes={false}
            />
          </div>

          {/* Controls */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <IconButton
              label={fav ? "Remove from favourites" : "Add to favourites"}
              tooltip="Favourite"
              onClick={() => toggleFavourite(current)}
              active={fav}
              tone={fav ? "rose" : "default"}
              aria-pressed={fav}
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Heart size={17} filled={fav} />
            </IconButton>

            <IconButton
              label="Previous song"
              tooltip="Previous"
              onClick={previous}
              disabled={!canGoPrevious}
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Prev size={19} />
            </IconButton>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause song" : "Play song"}
              data-tooltip={isPlaying ? "Pause" : "Play"}
              className="btn btn-glow play-btn h-12 w-12 !p-0"
            >
              {loading ? (
                <Spinner size={19} />
              ) : isPlaying ? (
                <Pause size={19} />
              ) : (
                <Play size={19} className="translate-x-[1px]" />
              )}
            </button>

            <IconButton
              label="Next song"
              tooltip="Next"
              onClick={next}
              disabled={!canGoNext}
              size="sm"
            >
              <Next size={19} />
            </IconButton>

            <div className="hidden items-center gap-1.5 lg:flex">
              <IconButton
                label={muted || volume === 0 ? "Unmute" : "Mute"}
                tooltip="Mute"
                onClick={toggleMute}
                size="sm"
              >
                {muted || volume === 0 ? <VolumeMute size={17} /> : <Volume size={17} />}
              </IconButton>
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

            <IconButton
              label="Open queue"
              tooltip="Queue"
              onClick={toggleQueuePanel}
              size="sm"
              className="hidden sm:inline-flex"
            >
              <QueueIcon size={18} />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
