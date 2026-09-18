"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "./PlayerProvider";
import { shortTitle } from "@/lib/format";
import { Close, Trash, Play, Pause, ChevronDown } from "@/components/ui/Icons";

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

  useEffect(() => {
    if (!queuePanelOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQueuePanelOpen(false);
      if (e.key !== "Tab") return;
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
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
    return () => document.removeEventListener("keydown", onKey);
  }, [queuePanelOpen, setQueuePanelOpen]);

  if (!queuePanelOpen) return null;

  const upcoming = queue.length - Math.max(queueIndex + 1, 0);

  return (
    <div className="fixed inset-0 z-[70]" role="presentation">
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
        className="glass slide-in-right absolute inset-x-0 bottom-0 flex max-h-[82dvh] flex-col rounded-t-3xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[380px] sm:rounded-none sm:rounded-l-3xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3.5">
          <div>
            <h2 className="text-base font-bold">Queue</h2>
            <p className="text-xs text-white/45">
              {queue.length} song{queue.length === 1 ? "" : "s"}
              {upcoming > 0 ? ` · ${upcoming} up next` : ""}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={clearQueue}
              disabled={queue.length <= 1}
              aria-label="Clear queue"
              className="grid h-9 w-9 place-items-center rounded-full text-white/55 transition hover:bg-white/8 hover:text-white disabled:opacity-30"
            >
              <Trash size={17} />
            </button>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setQueuePanelOpen(false)}
              aria-label="Close queue"
              className="grid h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/8 hover:text-white"
            >
              <Close size={18} />
            </button>
          </div>
        </header>

        <div className="scroll-y flex-1 px-2 py-2">
          {queue.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-white/45">
              Your queue is empty. Play a song or tap “Add to queue”.
            </p>
          ) : (
            <ul className="space-y-1">
              {queue.map((song, i) => {
                const isCurrent = i === queueIndex;
                return (
                  <li
                    key={`${song.youtubeId}-${i}`}
                    className={`group flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition ${
                      isCurrent ? "bg-[color:var(--color-amber)]/12" : "hover:bg-white/6"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => (isCurrent ? togglePlay() : jumpTo(i))}
                      className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg"
                      aria-label={isCurrent ? "Play or pause" : `Play ${shortTitle(song.title, 30)}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={song.thumbnail}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                        {isCurrent && isPlaying ? <Pause size={15} /> : <Play size={15} />}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => jumpTo(i)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p
                        className={`line-1 text-[0.8rem] font-semibold ${
                          isCurrent ? "text-[color:var(--color-amber)]" : "text-white/88"
                        }`}
                      >
                        {shortTitle(song.title, 42)}
                      </p>
                      <p className="line-1 text-[0.7rem] text-white/42">{song.artist}</p>
                    </button>

                    <div className="flex shrink-0 items-center opacity-60 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => moveInQueue(i, i - 1)}
                        disabled={i === 0}
                        aria-label="Move up"
                        className="grid h-7 w-7 place-items-center rounded-full text-white/55 hover:text-white disabled:opacity-25"
                      >
                        <ChevronDown size={14} className="rotate-180" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveInQueue(i, i + 1)}
                        disabled={i === queue.length - 1}
                        aria-label="Move down"
                        className="grid h-7 w-7 place-items-center rounded-full text-white/55 hover:text-white disabled:opacity-25"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromQueue(i)}
                        aria-label={`Remove ${shortTitle(song.title, 24)} from queue`}
                        className="grid h-7 w-7 place-items-center rounded-full text-white/45 hover:text-[color:var(--color-rose)]"
                      >
                        <Close size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
