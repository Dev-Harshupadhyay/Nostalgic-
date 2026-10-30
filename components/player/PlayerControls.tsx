"use client";

import { usePlayer } from "./PlayerProvider";
import IconButton from "@/components/ui/IconButton";
import {
  Play,
  Pause,
  Prev,
  Next,
  Shuffle,
  Repeat,
  RepeatOne,
  Spinner,
  Volume,
  VolumeMute,
} from "@/components/ui/Icons";

type Props = { size?: "sm" | "md" | "lg"; showExtras?: boolean; showVolume?: boolean };

const MAIN = {
  sm: { btn: "h-11 w-11", icon: 18 },
  md: { btn: "h-14 w-14", icon: 22 },
  lg: { btn: "h-16 w-16 shrink-0 sm:h-[68px] sm:w-[68px]", icon: 28 },
};

export default function PlayerControls({ size = "md", showExtras = false, showVolume = false }: Props) {
  const {
    isPlaying,
    status,
    volume,
    muted,
    setVolume,
    toggleMute,
    togglePlay,
    next,
    previous,
    shuffle,
    toggleShuffle,
    repeat,
    cycleRepeat,
    current,
    canGoNext,
    canGoPrevious,
  } = usePlayer();

  const dim = MAIN[size];
  const loading = status === "loading" || status === "buffering";
  const idle = !current;

  const repeatLabel =
    repeat === "off" ? "Repeat: off" : repeat === "all" ? "Repeat: queue" : "Repeat: this song";

  return (
    <div className="player-controls-stack">
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {showExtras ? (
          <IconButton
            label="Shuffle"
            tooltip={shuffle ? "Shuffle: on" : "Shuffle: off"}
            active={shuffle}
            onClick={toggleShuffle}
            disabled={idle}
            size="md"
          >
            <Shuffle size={20} />
          </IconButton>
        ) : null}

        <IconButton
          label="Previous song"
          tooltip="Previous"
          onClick={previous}
          disabled={idle || !canGoPrevious}
          size="md"
        >
          <Prev size={22} />
        </IconButton>

        <button
          type="button"
          onClick={togglePlay}
          disabled={idle}
          aria-label={isPlaying ? "Pause song" : "Play song"}
          data-tooltip={isPlaying ? "Pause" : "Play"}
          className={`btn btn-glow play-btn ${dim.btn} !p-0 disabled:opacity-40`}
        >
          {loading ? (
            <Spinner size={dim.icon} />
          ) : isPlaying ? (
            <Pause size={dim.icon} />
          ) : (
            <Play size={dim.icon} className="translate-x-[1.5px]" />
          )}
        </button>

        <IconButton
          label="Next song"
          tooltip="Next"
          onClick={next}
          disabled={idle || !canGoNext}
          size="md"
        >
          <Next size={22} />
        </IconButton>

        {showExtras ? (
          <IconButton
            label={repeatLabel}
            tooltip={repeatLabel}
            active={repeat !== "off"}
            onClick={cycleRepeat}
            disabled={idle}
            size="md"
          >
            {repeat === "one" ? <RepeatOne size={20} /> : <Repeat size={20} />}
          </IconButton>
        ) : null}
      </div>

      {showVolume ? (
        <div className="yt-volume-row">
          <IconButton
            label={muted || volume === 0 ? "Unmute" : "Mute"}
            tooltip={muted || volume === 0 ? "Unmute" : "Mute"}
            onClick={toggleMute}
            disabled={idle}
            size="sm"
          >
            {muted || volume === 0 ? <VolumeMute size={17} /> : <Volume size={17} />}
          </IconButton>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={muted ? 0 : volume}
            onChange={(event) => setVolume(Number(event.currentTarget.value))}
            disabled={idle}
            aria-label="Volume"
            aria-valuetext={`${muted ? 0 : volume}%`}
          />
          <span>{muted ? 0 : volume}%</span>
        </div>
      ) : null}
    </div>
  );
}
