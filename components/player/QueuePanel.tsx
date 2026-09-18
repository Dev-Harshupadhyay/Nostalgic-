"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "./PlayerProvider";
import IconButton from "@/components/ui/IconButton";
import { shortTitle } from "@/lib/format";
import type { Song } from "@/lib/types";
import { Close, Trash, Play, Pause, ChevronDown } from "@/components/ui/Icons";

function QueueRow({
  song,
  index,
  isCurrent,
  isPlaying,
  onPlay,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
}: {
  song: Song;
  /** 1-based position shown to the listener. */
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <li className={`pp-row group ${isCurrent ? "is-current" : ""}`}>
      {/* Track number, replaced by an equalizer for the live track. */}
      <span className="pp-row-index" aria-hidden>
        {isCurrent && isPlaying ? (
          <span className="eq mx-auto h-3">
            <span />
            <span />
            <span />
            <span />
          </span>
        ) : (
          index
        )}
      </span>

      <button
        type="button"
        onClick={onPlay}
        className="pp-row-thumb"
        aria-label={isCurrent ? "Play or pause" : `Play ${shortTitle(song.title, 30)}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={song.thumbnail} alt="" loading="lazy" decoding="async" />
        <span
          className={`absolute inset-0 grid place-items-center bg-black/55 transition ${
            isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
          }`}
        >
          {isCurrent && isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </span>
      </button>

      <button type="button" onClick={onPlay} className="min-w-0 flex-1 text-left">
        <p
          className={`line-1 text-[0.82rem] font-semibold ${
            isCurrent ? "text-[color:var(--color-amber)]" : "text-white/88"
          }`}
          title={song.title}
        >
          {shortTitle(song.title, 42)}
        </p>
        <p className="line-1 text-[0.7rem] text-white/42">
          {song.artist}
          {song.duration ? <span className="text-white/28"> · {song.duration}</span> : null}
        </p>
      </button>

      <div className="flex shrink-0 items-center opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 max-[640px]:opacity-100">
        <IconButton
          label={`Move ${shortTitle(song.title, 20)} up`}
          tooltip="Move up"
          onClick={() => onMove(-1)}
          disabled={!canMoveUp}
          size="sm"
          className="!h-8 !w-8"
        >
          <ChevronDown size={14} className="rotate-180" />
        </IconButton>
        <IconButton
          label={`Move ${shortTitle(song.title, 20)} down`}
          tooltip="Move down"
          onClick={() => onMove(1)}
          disabled={!canMoveDown}
          size="sm"
          className="!h-8 !w-8"
        >
          <ChevronDown size={14} />
        </IconButton>
        <IconButton
          label={`Remove ${shortTitle(song.title, 20)} from queue`}
          tooltip="Remove"
          onClick={onRemove}
          size="sm"
          className="!h-8 !w-8 hover:!text-[color:var(--color-rose)]"
        >
          <Close size={14} />
        </IconButton>
      </div>
    </li>
  );
}

export default function QueuePanel() {
  const {
    queue,
    queueIndex,
    queuePanelOpen,
    setQueuePanelOpen,
    jumpTo,
    removeFromQueue,
    moveInQueue,
    clearQueue,
    isPlaying,
    togglePlay,
  } = usePlayer();

  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!queuePanelOpen) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQueuePanelOpen(false);
        return;
      }
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
      restoreRef.current?.focus?.();
    };
  }, [queuePanelOpen, setQueuePanelOpen]);

  if (!queuePanelOpen) return null;

  const currentSong = queueIndex >= 0 ? queue[queueIndex] : null;
  const upNext = queue.slice(queueIndex + 1);

  return (
    <div className="fixed inset-0 z-[90]" role="presentation">
      <button
        type="button"
        aria-label="Close queue"
        onClick={() => setQueuePanelOpen(false)}
        className="fade-in absolute inset-0 h-full w-full cursor-default bg-black/65 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Playback queue"
        className="surface-warm sheet-up absolute inset-x-0 bottom-0 flex max-h-[84dvh] flex-col rounded-t-3xl sm:slide-in-right sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[400px] sm:rounded-none sm:rounded-l-3xl"
      >
        {/* Mobile grab handle */}
        <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        <header className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3.5">
          <div>
            <h2 className="text-base font-bold">Queue</h2>
            <p className="text-xs text-white/45">
              {queue.length} song{queue.length === 1 ? "" : "s"}
              {upNext.length > 0 ? ` · ${upNext.length} up next` : ""}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              label="Clear queue"
              tooltip="Clear"
              onClick={clearQueue}
              disabled={queue.length <= 1}
              size="sm"
            >
              <Trash size={17} />
            </IconButton>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setQueuePanelOpen(false)}
              aria-label="Close queue"
              data-tooltip="Close"
              className="icon-btn tap-target h-9 w-9 text-white/70 hover:text-white"
            >
              <Close size={18} />
            </button>
          </div>
        </header>

        <div className="scroll-y flex-1 px-2 py-3">
          {queue.length === 0 ? (
            <p className="px-3 py-12 text-center text-sm text-white/45">
              Your queue is empty. Play a song or tap “Add to queue”.
            </p>
          ) : (
            <>
              {currentSong ? (
                <section aria-label="Playing now" className="mb-4">
                  <h3 className="eyebrow mb-1.5 px-2">Playing Now</h3>
                  <ul>
                    <QueueRow
                      song={currentSong}
                      index={queueIndex + 1}
                      isCurrent
                      isPlaying={isPlaying}
                      onPlay={togglePlay}
                      onRemove={() => removeFromQueue(queueIndex)}
                      onMove={(d) => moveInQueue(queueIndex, queueIndex + d)}
                      canMoveUp={queueIndex > 0}
                      canMoveDown={queueIndex < queue.length - 1}
                    />
                  </ul>
                </section>
              ) : null}

              {upNext.length > 0 ? (
                <section aria-label="Up next">
                  <h3 className="eyebrow mb-1.5 px-2">Up Next</h3>
                  <ul className="space-y-0.5">
                    {upNext.map((song, i) => {
                      const realIndex = queueIndex + 1 + i;
                      return (
                        <QueueRow
                          key={`${song.youtubeId}-${realIndex}`}
                          song={song}
                          index={realIndex + 1}
                          isCurrent={false}
                          isPlaying={false}
                          onPlay={() => jumpTo(realIndex)}
                          onRemove={() => removeFromQueue(realIndex)}
                          onMove={(d) => moveInQueue(realIndex, realIndex + d)}
                          canMoveUp={realIndex > 0}
                          canMoveDown={realIndex < queue.length - 1}
                        />
                      );
                    })}
                  </ul>
                </section>
              ) : (
                <p className="px-3 py-6 text-center text-xs text-white/35">
                  Nothing up next — add more songs to keep the music going.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
