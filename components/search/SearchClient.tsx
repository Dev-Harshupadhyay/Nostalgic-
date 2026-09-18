"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SongRow from "@/components/music/SongRow";
import GlowButton from "@/components/ui/GlowButton";
import { searchCatalog } from "@/lib/catalog";
import type { Song } from "@/lib/types";
import { Search as SearchIcon, Close, Play, Spinner } from "@/components/ui/Icons";
import { usePlayer } from "@/components/player/PlayerProvider";

const SUGGESTIONS = [
  "Kishore Kumar",
  "90s hindi songs",
  "Chhath geet",
  "Pawan Singh",
  "Lata Mangeshkar",
  "new bhojpuri song",
  "Sharda Sinha",
  "evergreen bollywood",
];

type State = "idle" | "loading" | "done" | "error";

function Skeleton() {
  return (
    <ul className="space-y-2" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 rounded-2xl px-2.5 py-2">
          <div className="skeleton h-12 w-12 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-2/3 rounded-full" />
            <div className="skeleton h-3 w-1/4 rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function SearchClient() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("q") ?? "";

  const [query, setQuery] = useState(initial);
  const [results, setResults] = useState<Song[]>([]);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { playQueue } = usePlayer();

  const run = useCallback(async (q: string) => {
    const term = q.trim();
    abortRef.current?.abort();
    if (!term) {
      setResults([]);
      setState("idle");
      setError(null);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setState("loading");
    setError(null);

    // Instant local matches while the network request is in flight.
    const local = searchCatalog(term, 12);
    if (local.length) setResults(local);

    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(term)}&max=30`, {
        signal: controller.signal,
      });
      const data = (await res.json()) as {
        results?: Song[];
        source?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.results ?? []);
      setSource(data.source ?? "");
      setState("done");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      if (local.length) {
        setResults(local);
        setSource("catalog");
        setState("done");
        setError("Live search is unavailable right now — showing saved results.");
      } else {
        setState("error");
        setError("Music service is temporarily unavailable. Please try again.");
      }
    }
  }, []);

  /* Debounced search + shareable URL */
  useEffect(() => {
    const t = window.setTimeout(() => {
      run(query);
      const url = query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search";
      window.history.replaceState(null, "", url);
    }, 420);
    return () => window.clearTimeout(t);
  }, [query, run]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const showEmpty = state === "done" && results.length === 0 && query.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="glass sticky top-[62px] z-30 rounded-2xl p-2.5 sm:p-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 focus-within:border-[color:var(--color-amber)]/60">
          <SearchIcon size={18} className="shrink-0 text-white/45" />
          <label htmlFor="global-search" className="sr-only">
            Search songs, singers and categories
          </label>
          <input
            id="global-search"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, singers, Bhojpuri, Chhath, old songs…"
            autoComplete="off"
            enterKeyHint="search"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/32 sm:text-base"
            aria-describedby="search-status"
          />
          {state === "loading" ? <Spinner size={16} className="text-[color:var(--color-amber)]" /> : null}
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/45 transition hover:bg-white/8 hover:text-white"
            >
              <Close size={15} />
            </button>
          ) : null}
        </div>

        <div className="scroll-x mt-2 flex gap-2 px-0.5 pb-0.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className="shrink-0 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[0.72rem] font-medium text-white/62 transition hover:border-[color:var(--color-amber)]/50 hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <p id="search-status" className="sr-only" aria-live="polite">
        {state === "loading"
          ? "Searching"
          : state === "done"
          ? `${results.length} results for ${query}`
          : ""}
      </p>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-[color:var(--color-rose)]/30 bg-[color:var(--color-rose)]/8 px-4 py-3 text-sm text-white/78"
        >
          {error}
          <button
            type="button"
            onClick={() => run(query)}
            className="ml-3 font-semibold text-[color:var(--color-amber)] underline underline-offset-4"
          >
            Retry
          </button>
        </div>
      ) : null}

      {state === "loading" && results.length === 0 ? <Skeleton /> : null}

      {results.length > 0 ? (
        <section aria-label="Search results">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <p className="text-xs text-white/42">
              {results.length} result{results.length === 1 ? "" : "s"}
              {source === "catalog" ? " · from saved collection" : " · from YouTube"}
            </p>
            <GlowButton size="sm" variant="ghost" onClick={() => playQueue(results, 0)}>
              <Play size={14} />
              Play all
            </GlowButton>
          </div>
          <ul className="space-y-1">
            {results.map((song, i) => (
              <SongRow
                key={song.id ?? song.youtubeId}
                song={song}
                index={i}
                contextQueue={results}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {showEmpty ? (
        <div className="glass rounded-2xl px-5 py-12 text-center">
          <p className="text-3xl" aria-hidden>
            🎧
          </p>
          <p className="mt-3 text-sm font-semibold text-white/80">
            No songs found for “{query.trim()}”
          </p>
          <p className="mt-1 text-xs text-white/45">
            Try a singer&apos;s name, a movie, or something like “Chhath geet”.
          </p>
        </div>
      ) : null}

      {state === "idle" && !query ? (
        <div className="glass rounded-2xl px-5 py-12 text-center">
          <p className="text-3xl" aria-hidden>
            🔎
          </p>
          <p className="mt-3 text-sm font-semibold text-white/80">Search the whole library</p>
          <p className="mt-1 text-xs text-white/45">
            Song titles, singers, categories — Bhojpuri, Chhath, old classics and more.
          </p>
        </div>
      ) : null}
    </div>
  );
}
