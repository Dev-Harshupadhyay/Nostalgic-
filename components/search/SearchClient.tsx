"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ResultCard from "@/components/search/ResultCard";
import GlowButton from "@/components/ui/GlowButton";
import { searchCatalog } from "@/lib/catalog";
import type { Song } from "@/lib/types";
import {
  Search as SearchIcon,
  Close,
  Play,
  Spinner,
  Clock,
  Trash,
} from "@/components/ui/Icons";
import { usePlayer } from "@/components/player/PlayerProvider";

/* Suggestion chips: genres and names, never presented as rankings. */
const SUGGESTIONS = [
  "Arijit Singh",
  "Kesariya",
  "Kishore Kumar",
  "90s hindi songs",
  "Bollywood",
  "Chhath geet",
  "Pawan Singh",
  "Lata Mangeshkar",
  "Lo-fi hindi",
  "Instrumental sitar",
  "English songs",
  "Sharda Sinha",
];

const HISTORY_KEY = "nostalgic:searchHistory";
const MAX_HISTORY = 8;
const PAGE_SIZE = 20;

type State = "idle" | "loading" | "done" | "error";

type ApiResponse = {
  results?: Song[];
  source?: string;
  error?: string;
  nextPageToken?: string;
};

function readHistory(): string[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function Skeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid gap-2.5" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-2.5 sm:gap-4 sm:p-3"
        >
          <div className="skeleton aspect-video w-[104px] shrink-0 rounded-xl sm:w-[136px]" />
          <div className="flex-1 space-y-2.5">
            <div className="skeleton h-3 w-4/5 rounded-full" />
            <div className="skeleton h-3 w-1/3 rounded-full" />
            <div className="skeleton h-6 w-40 rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function SearchClient() {
  const params = useSearchParams();
  const initial = params.get("q") ?? "";

  const [query, setQuery] = useState(initial);
  /** The query whose results are currently on screen. */
  const [activeQuery, setActiveQuery] = useState(initial);
  const [results, setResults] = useState<Song[]>([]);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>("");
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  /** Monotonic id so a slow old response can never overwrite a newer one. */
  const runIdRef = useRef(0);

  const { playQueue } = usePlayer();

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const pushHistory = useCallback((term: string) => {
    setHistory((prev) => {
      const next = [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(
        0,
        MAX_HISTORY
      );
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        /* private mode — history is a nicety, not a requirement */
      }
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  /* ------------------------------- Searching ------------------------------ */

  const run = useCallback(
    async (q: string) => {
      const term = q.trim();

      // Cancel any in-flight request: an outdated search must never win.
      abortRef.current?.abort();

      if (!term) {
        runIdRef.current += 1;
        setResults([]);
        setState("idle");
        setError(null);
        setNextPageToken(undefined);
        setActiveQuery("");
        return;
      }

      const myRun = ++runIdRef.current;
      const controller = new AbortController();
      abortRef.current = controller;

      setState("loading");
      setError(null);

      /* Instant local matches so the grid is never empty while the network
         request is in flight — previous results otherwise stay on screen. */
      const local = searchCatalog(term, 8);

      try {
        const res = await fetch(
          `/api/youtube/search?q=${encodeURIComponent(term)}&max=${PAGE_SIZE}`,
          { signal: controller.signal }
        );
        const data = (await res.json()) as ApiResponse;
        if (myRun !== runIdRef.current) return; // a newer search already landed
        if (!res.ok) throw new Error(data.error ?? "Search failed");

        setResults(data.results ?? []);
        setSource(data.source ?? "");
        setNextPageToken(data.nextPageToken);
        setActiveQuery(term);
        setState("done");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        if (myRun !== runIdRef.current) return;

        if (local.length) {
          setResults(local);
          setSource("catalog");
          setActiveQuery(term);
          setNextPageToken(undefined);
          setState("done");
          setError("Live YouTube search is unavailable right now — showing saved results.");
        } else {
          setResults([]);
          setState("error");
          setError("Couldn't reach YouTube. Check your connection and try again.");
        }
      }
    },
    []
  );

  const loadMore = useCallback(async () => {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(activeQuery)}&max=${PAGE_SIZE}&pageToken=${encodeURIComponent(
          nextPageToken
        )}`
      );
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) throw new Error(data.error ?? "Load more failed");

      // De-duplicate: the keyless fallback can overlap between pages.
      setResults((prev) => {
        const seen = new Set(prev.map((s) => s.youtubeId));
        return [...prev, ...(data.results ?? []).filter((s) => !seen.has(s.youtubeId))];
      });
      setNextPageToken(data.nextPageToken);
    } catch {
      setError("Couldn't load more results. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }, [nextPageToken, loadingMore, activeQuery]);

  /* Debounced live search + shareable URL. */
  useEffect(() => {
    const t = window.setTimeout(() => {
      run(query);
      const url = query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search";
      window.history.replaceState(null, "", url);
    }, 420);
    return () => window.clearTimeout(t);
  }, [query, run]);

  useEffect(() => () => abortRef.current?.abort(), []);

  /* History records deliberate intent (submit / chip), so it is written at the
     moment of the action rather than on fetch success — a debounced re-run can
     abort the in-flight request and would otherwise drop the entry. */
  const submit = useCallback(() => {
    const term = query.trim();
    if (!term) return;
    inputRef.current?.blur();
    pushHistory(term);
    run(term);
  }, [query, run, pushHistory]);

  const showEmpty = state === "done" && results.length === 0 && activeQuery.length > 0;
  const showHistory = history.length > 0 && !query.trim();

  const statusLine = useMemo(() => {
    if (state === "loading") return "Searching YouTube…";
    if (state === "done" && results.length)
      return `${results.length} result${results.length === 1 ? "" : "s"}${
        source === "catalog" ? " · from saved collection" : " · live from YouTube"
      }`;
    return "";
  }, [state, results.length, source]);

  return (
    <div className="space-y-5">
      {/* ------------------------------ Search bar ----------------------------- */}
      <div className="glass sticky top-[62px] z-30 rounded-2xl p-2.5 sm:p-3">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-center gap-2"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 transition focus-within:border-[color:var(--color-amber)]/60">
            <SearchIcon size={18} className="shrink-0 text-white/45" />
            <label htmlFor="global-search" className="sr-only">
              Search songs, artists, albums
            </label>
            <input
              id="global-search"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs, artists, albums…"
              autoComplete="off"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/32 sm:text-base"
              aria-describedby="search-status"
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
            <SearchIcon size={15} />
            <span className="hidden sm:inline">Search</span>
          </GlowButton>
        </form>

        <div className="scroll-x mt-2 flex gap-2 px-0.5 pb-0.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQuery(s);
                pushHistory(s);
                run(s);
              }}
              className="shrink-0 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[0.72rem] font-medium text-white/62 transition hover:border-[color:var(--color-amber)]/50 hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <p id="search-status" className="sr-only" aria-live="polite">
        {statusLine}
      </p>

      {/* ------------------------------- History ------------------------------- */}
      {showHistory ? (
        <section aria-label="Recent searches" className="px-0.5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/42">
              <Clock size={13} />
              Recent searches
            </p>
            <button
              type="button"
              onClick={clearHistory}
              className="inline-flex items-center gap-1 text-[0.7rem] font-medium text-white/40 transition hover:text-white/75"
            >
              <Trash size={12} />
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  setQuery(h);
                  run(h);
                }}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[0.72rem] text-white/68 transition hover:border-white/24 hover:text-white"
              >
                {h}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* -------------------------------- Error -------------------------------- */}
      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-[color:var(--color-rose)]/30 bg-[color:var(--color-rose)]/8 px-4 py-3 text-sm text-white/78"
        >
          {error}
          <button
            type="button"
            onClick={() => run(query || activeQuery)}
            className="ml-3 font-semibold text-[color:var(--color-amber)] underline underline-offset-4"
          >
            Retry
          </button>
        </div>
      ) : null}

      {/* ------------------------------- Results ------------------------------- */}
      {state === "loading" && results.length === 0 ? <Skeleton /> : null}

      {results.length > 0 ? (
        <section aria-label="Search results">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <p className="text-xs text-white/42">
              {state === "loading" ? (
                <span className="inline-flex items-center gap-1.5">
                  <Spinner size={11} /> Searching YouTube…
                </span>
              ) : (
                statusLine
              )}
            </p>
            <GlowButton size="sm" variant="ghost" onClick={() => playQueue(results, 0)}>
              <Play size={14} />
              Play all
            </GlowButton>
          </div>

          <ul className="grid gap-2.5">
            {results.map((song) => (
              <ResultCard
                key={song.id ?? song.youtubeId}
                song={song}
                contextQueue={results}
              />
            ))}
          </ul>

          {nextPageToken ? (
            <div className="mt-5 flex justify-center">
              <GlowButton variant="ghost" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? <Spinner size={14} /> : null}
                {loadingMore ? "Loading…" : "Load more"}
              </GlowButton>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* ------------------------------ No results ----------------------------- */}
      {showEmpty ? (
        <div className="glass rounded-2xl px-5 py-12 text-center">
          <p className="text-3xl" aria-hidden>
            🎧
          </p>
          <p className="mt-3 text-sm font-semibold text-white/80">No songs found on YouTube.</p>
          <p className="mt-1 text-xs text-white/45">
            Nothing matched “{activeQuery}”. Try a singer&apos;s name, a movie, or a different
            spelling.
          </p>
        </div>
      ) : null}

      {/* -------------------------------- Idle --------------------------------- */}
      {state === "idle" && !query ? (
        <div className="glass rounded-2xl px-5 py-12 text-center">
          <p className="text-3xl" aria-hidden>
            🔎
          </p>
          <p className="mt-3 text-sm font-semibold text-white/80">Search YouTube for any song</p>
          <p className="mt-1 text-xs text-white/45">
            Songs, artists, albums — Bollywood, Bhojpuri, Chhath, lo-fi, instrumentals and more.
          </p>
        </div>
      ) : null}
    </div>
  );
}
