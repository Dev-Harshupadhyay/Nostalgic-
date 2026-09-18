"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayer } from "@/components/player/PlayerProvider";
import ArtworkCard from "@/components/player/ArtworkCard";
import Marquee from "@/components/player/Marquee";
import NowPlaying from "@/components/player/NowPlaying";
import ProgressBar from "@/components/player/ProgressBar";
import PlayerControls from "@/components/player/PlayerControls";
import GlowButton from "@/components/ui/GlowButton";
import { cleanTitle } from "@/lib/format";
import type { Song } from "@/lib/types";
import {
  Search as SearchIcon,
  Close,
  Spinner,
  Play,
  Plus,
  Check,
  Sparkle,
} from "@/components/ui/Icons";

const MOODS = [
  "Lo-fi hindi",
  "Arijit Singh",
  "90s Bollywood",
  "Bhojpuri hits",
  "Chhath geet",
  "Instrumental sitar",
  "Punjabi party",
  "English pop",
];

type State = "idle" | "loading" | "done" | "error";

function Skeleton() {
  return (
    <ul className="grid gap-2" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 rounded-2xl border border-white/8 p-2.5">
          <div className="skeleton h-14 w-14 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-3/4 rounded-full" />
            <div className="skeleton h-3 w-1/3 rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * "Live Song": type a song, it is fetched from YouTube and played instantly.
 *
 * The difference from /search is intent — the first result plays immediately on
 * submit (instant mode), and the now-playing deck sits directly above the
 * results so the whole loop happens on one screen.
 */
export default function LiveClient() {
  const {
    current,
    status,
    isPlaying,
    currentTime,
    duration,
    seekTo,
    playSong,
    playQueue,
    addToQueue,
  } = usePlayer();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [queued, setQueued] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const runIdRef = useRef(0);

  const search = useCallback(
    async (term: string, { autoplay = false }: { autoplay?: boolean } = {}) => {
      const q = term.trim();
      abortRef.current?.abort();
      if (!q) {
        runIdRef.current += 1;
        setResults([]);
        setState("idle");
        setError(null);
        return;
      }

      const myRun = ++runIdRef.current;
      const controller = new AbortController();
      abortRef.current = controller;
      setState("loading");
      setError(null);

      try {
        const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}&max=20`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as { results?: Song[]; error?: string };
        if (myRun !== runIdRef.current) return; // a newer search already won
        if (!res.ok) throw new Error(data.error ?? "Search failed");

        const list = data.results ?? [];
        setResults(list);
        setState("done");

        // Instant mode: the whole point of this tab is "search → it plays".
        if (autoplay && list.length) playQueue(list, 0);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        if (myRun !== runIdRef.current) return;
        setResults([]);
        setState("error");
        setError("YouTube se connect nahi ho paya. Dobara try karein.");
      }
    },
    [playQueue]
  );

  /* Debounced preview while typing — does not autoplay. */
  useEffect(() => {
    const t = window.setTimeout(() => search(query), 450);
    return () => window.clearTimeout(t);
  }, [query, search]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const onQueue = (song: Song) => {
    addToQueue(song);
    setQueued(song.youtubeId);
    window.setTimeout(() => setQueued(null), 1600);
  };

  return (
    <div className="space-y-5">
      {/* ----------------------------- Now playing ---------------------------- */}
      {current ? (
        <section className="pp-card p-4 sm:p-6" aria-label="Currently playing">
          <div className="flex items-center gap-4">
            <ArtworkCard
              song={current}
              playing={isPlaying}
              glow
              className="h-20 w-20 shrink-0 sm:h-28 sm:w-28"
              rounded="18px"
            />
            <div className="min-w-0 flex-1">
              <NowPlaying status={status} />
              <h2 className="mt-2 text-base font-bold text-white sm:text-xl">
                <Marquee text={cleanTitle(current.title)} />
              </h2>
              <p className="line-1 mt-0.5 text-sm text-white/55">{current.artist}</p>
            </div>
          </div>

          <div className="mt-4">
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={seekTo}
              size="lg"
            />
          </div>

          <div className="mt-4">
            <PlayerControls size="md" showExtras />
          </div>
        </section>
      ) : null}

      {/* ------------------------------- Search ------------------------------- */}
      <div className="pp-card !rounded-[22px] p-2.5 sm:p-3">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            inputRef.current?.blur();
            search(query, { autoplay: true });
          }}
          className="flex items-center gap-2"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 transition focus-within:border-[color:var(--color-amber)]/60">
            <SearchIcon size={18} className="shrink-0 text-white/45" />
            <label htmlFor="live-search" className="sr-only">
              Search any song to play live from YouTube
            </label>
            <input
              id="live-search"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Koi bhi gaana likhein — live chalega…"
              autoComplete="off"
              enterKeyHint="go"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/32 sm:text-base"
            />
            {state === "loading" ? (
              <Spinner size={16} className="shrink-0 text-[color:var(--color-amber)]" />
            ) : null}
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="tap-target grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/45 transition hover:bg-white/8 hover:text-white"
              >
                <Close size={15} />
              </button>
            ) : null}
          </div>

          <GlowButton type="submit" size="sm" className="shrink-0">
            <Play size={14} />
            <span className="hidden sm:inline">Play</span>
          </GlowButton>
        </form>

        <div className="scroll-x mt-2 flex gap-2 px-0.5 pb-0.5">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setQuery(m);
                search(m, { autoplay: true });
              }}
              className="shrink-0 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[0.72rem] font-medium text-white/62 transition hover:border-[color:var(--color-amber)]/50 hover:text-white"
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {state === "loading" ? "Searching YouTube" : state === "done" ? `${results.length} results` : ""}
      </p>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-[color:var(--color-rose)]/30 bg-[color:var(--color-rose)]/8 px-4 py-3 text-sm text-white/78"
        >
          {error}
          <button
            type="button"
            onClick={() => search(query)}
            className="ml-3 font-semibold text-[color:var(--color-amber)] underline underline-offset-4"
          >
            Retry
          </button>
        </div>
      ) : null}

      {state === "loading" && results.length === 0 ? <Skeleton /> : null}

      {results.length > 0 ? (
        <section aria-label="Live results">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="eyebrow">Live from YouTube</p>
            <GlowButton size="sm" variant="ghost" onClick={() => playQueue(results, 0)}>
              <Play size={13} />
              Play all
            </GlowButton>
          </div>

          <ul className="grid gap-2">
            {results.map((song) => {
              const active = current?.youtubeId === song.youtubeId;
              return (
                <li
                  key={song.youtubeId}
                  className={`pp-row group ${active ? "is-current" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => playSong(song, results)}
                    className="pp-row-thumb !h-14 !w-14"
                    aria-label={`Play ${song.title}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={song.thumbnail} alt="" loading="lazy" decoding="async" />
                    <span className="absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                      <Play size={15} />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => playSong(song, results)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p
                      className={`line-1 text-sm font-semibold ${
                        active ? "text-[color:var(--color-amber)]" : "text-white/90"
                      }`}
                      title={song.title}
                    >
                      {cleanTitle(song.title)}
                    </p>
                    <p className="line-1 text-xs text-white/45">
                      {song.artist}
                      {song.duration ? (
                        <span className="text-white/28"> · {song.duration}</span>
                      ) : null}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onQueue(song)}
                    aria-label={`Add ${song.title} to queue`}
                    className="tap-target grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/45 transition hover:bg-white/8 hover:text-[color:var(--color-amber)]"
                  >
                    {queued === song.youtubeId ? <Check size={16} /> : <Plus size={16} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {state === "done" && results.length === 0 && query.trim() ? (
        <div className="pp-card px-5 py-12 text-center">
          <p className="text-3xl" aria-hidden>
            🎧
          </p>
          <p className="mt-3 text-sm font-semibold text-white/80">No songs found on YouTube.</p>
          <p className="mt-1 text-xs text-white/45">Koi aur naam ya spelling try karein.</p>
        </div>
      ) : null}

      {state === "idle" && !query ? (
        <div className="pp-card px-5 py-12 text-center">
          <p className="text-3xl" aria-hidden>
            <Sparkle size={30} className="mx-auto text-[color:var(--color-amber)]" />
          </p>
          <p className="mt-3 text-sm font-semibold text-white/80">Jo mann kare, likhiye</p>
          <p className="mt-1 text-xs text-white/45">
            Gaana, singer ya mood — seedha YouTube se live chalega.
          </p>
        </div>
      ) : null}
    </div>
  );
}
