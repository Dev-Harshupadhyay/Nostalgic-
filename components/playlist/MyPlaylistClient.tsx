"use client";

import { useEffect, useRef, useState } from "react";
import GlowButton from "@/components/ui/GlowButton";
import SongCard from "@/components/music/SongCard";
import { usePlayer } from "@/components/player/PlayerProvider";
import type { Song } from "@/lib/types";
import { Close, Play, Queue, Shuffle, Spinner, Trash } from "@/components/ui/Icons";

const STORAGE_KEY = "nostalgic:my-playlists";
const VIEW_STORAGE_KEY = "nostalgic:my-playlists-view";
const MAX_SAVED_PLAYLISTS = 12;

type State = "idle" | "loading" | "done" | "error";
type SavedView = "grid" | "list";
type Playlist = {
  id: string;
  title: string;
  channel?: string;
  thumbnail?: string;
  songs: Song[];
  source: "youtube-api" | "youtube-public";
  cached?: boolean;
};
type SavedPlaylist = Playlist & { url: string; savedAt: number };
type PlaylistError = { code?: "INVALID_URL" | "PRIVATE" | "UNAVAILABLE"; error?: string };

function readSavedPlaylists(): SavedPlaylist[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is SavedPlaylist => {
        if (!item || typeof item !== "object") return false;
        const entry = item as Partial<SavedPlaylist>;
        return (
          typeof entry.id === "string" &&
          typeof entry.title === "string" &&
          typeof entry.url === "string" &&
          typeof entry.savedAt === "number" &&
          Array.isArray(entry.songs)
        );
      })
      .sort((a, b) => b.savedAt - a.savedAt)
      .slice(0, MAX_SAVED_PLAYLISTS);
  } catch {
    return [];
  }
}

function saveToDevice(items: SavedPlaylist[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

function savedTime(timestamp: number) {
  const delta = Date.now() - timestamp;
  if (delta < 60_000) return "Just now";
  if (delta < 3_600_000) return `${Math.max(1, Math.floor(delta / 60_000))}m ago`;
  if (delta < 86_400_000) return `${Math.max(1, Math.floor(delta / 3_600_000))}h ago`;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(timestamp);
}

function LoadingCards() {
  return (
    <div className="my-playlist-grid" aria-hidden>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[18px] border border-white/8 bg-white/[0.025]">
          <div className="skeleton aspect-square w-full" />
          <div className="space-y-2 p-3">
            <div className="skeleton h-3 w-4/5 rounded-full" />
            <div className="skeleton h-3 w-2/5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Public YouTube playlist importer. Successful imports are saved only in the
 * visitor's localStorage, so the grid survives reloads without an account.
 */
export default function MyPlaylistClient() {
  const { playQueue, addToQueue, notify } = usePlayer();
  const [url, setUrl] = useState("");
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>([]);
  const [savedView, setSavedView] = useState<SavedView>("grid");
  const [savedHydrated, setSavedHydrated] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<PlaylistError | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const runRef = useRef(0);

  useEffect(() => {
    setSavedPlaylists(readSavedPlaylists());
    const rememberedView = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (rememberedView === "grid" || rememberedView === "list") setSavedView(rememberedView);
    setSavedHydrated(true);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  const rememberPlaylist = (fetched: Playlist, sourceUrl: string) => {
    const entry: SavedPlaylist = {
      ...fetched,
      cached: undefined,
      url: sourceUrl,
      savedAt: Date.now(),
    };
    setSavedPlaylists((previous) => {
      const next = [entry, ...previous.filter((item) => item.id !== entry.id)].slice(0, MAX_SAVED_PLAYLISTS);
      if (!saveToDevice(next)) {
        window.setTimeout(() => notify("Playlist load ho gayi, par phone storage mein save nahi ho paayi."), 0);
      }
      return next;
    });
  };

  const fetchPlaylist = async () => {
    const value = url.trim();
    abortRef.current?.abort();
    const run = ++runRef.current;
    setError(null);
    setPlaylist(null);

    if (!value) {
      setState("error");
      setError({ code: "INVALID_URL", error: "Pehle apni YouTube playlist ka link paste kijiye." });
      inputRef.current?.focus();
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setState("loading");

    try {
      const response = await fetch(`/api/youtube/playlist?url=${encodeURIComponent(value)}&max=100`, {
        signal: controller.signal,
      });
      const data = (await response.json()) as Playlist & PlaylistError;
      if (run !== runRef.current) return;
      if (!response.ok) throw data;
      setPlaylist(data);
      setState("done");
      rememberPlaylist(data, value);
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (caught) {
      if ((caught as Error).name === "AbortError") return;
      if (run !== runRef.current) return;
      const problem = caught as PlaylistError;
      setState("error");
      setError({
        code: problem.code ?? "UNAVAILABLE",
        error:
          problem.error ?? "Playlist abhi fetch nahi ho pa rahi. Link check karke dobara try karein.",
      });
    }
  };

  const openSavedPlaylist = (saved: SavedPlaylist) => {
    abortRef.current?.abort();
    runRef.current += 1;
    setUrl(saved.url);
    setPlaylist(saved);
    setError(null);
    setState("done");
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const changeSavedView = (view: SavedView) => {
    setSavedView(view);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch {
      // View preference is optional; the playlist data is still kept separately.
    }
  };

  const removeSavedPlaylist = (id: string) => {
    setSavedPlaylists((previous) => {
      const next = previous.filter((item) => item.id !== id);
      saveToDevice(next);
      return next;
    });
    notify("Playlist device se hata di gayi.");
  };

  const shuffleAndPlay = () => {
    if (!playlist?.songs.length) return;
    const songs = [...playlist.songs];
    for (let i = songs.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }
    playQueue(songs, 0);
  };

  return (
    <section aria-label="Import and save public YouTube playlists">
      <div className="my-playlist-form">
        <div className="my-playlist-form-aura" aria-hidden />
        <div className="relative">
          <p className="eyebrow">Public YouTube playlist</p>
          <h2 className="mt-1.5 text-xl font-extrabold sm:text-2xl">Link paste karo, playlist chalao</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/58">
            YouTube par playlist <b className="text-white/84">Public</b> honi chahiye. Fetch hote hi yeh
            playlist <b className="text-white/84">isi device</b> par save ho jaayegi — hamare server par nahi.
          </p>

          <form
            className="mt-5 flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              inputRef.current?.blur();
              fetchPlaylist();
            }}
          >
            <label htmlFor="youtube-playlist-url" className="sr-only">
              Public YouTube playlist URL
            </label>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-white/12 bg-black/25 px-3.5 py-3 transition focus-within:border-[color:var(--color-amber)]/70 focus-within:bg-black/35">
              <span aria-hidden className="text-lg">🔗</span>
              <input
                id="youtube-playlist-url"
                ref={inputRef}
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://www.youtube.com/playlist?list=..."
                autoComplete="url"
                inputMode="url"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30 sm:text-base"
              />
              {url ? (
                <button
                  type="button"
                  onClick={() => {
                    setUrl("");
                    setPlaylist(null);
                    setError(null);
                    setState("idle");
                    inputRef.current?.focus();
                  }}
                  className="tap-target grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/45 transition hover:bg-white/8 hover:text-white"
                  aria-label="Clear playlist link"
                >
                  <Close size={15} />
                </button>
              ) : null}
            </div>
            <GlowButton type="submit" size="lg" className="shrink-0" disabled={state === "loading"}>
              {state === "loading" ? <Spinner size={17} /> : <Queue size={17} />}
              {state === "loading" ? "Fetching…" : "Fetch & save"}
            </GlowButton>
          </form>
          <p className="mt-2 text-[0.72rem] text-white/38">
            Example: youtube.com/playlist?list=PL… &nbsp;·&nbsp; Private / Watch Later playlist supported nahi hai.
          </p>
        </div>
      </div>

      {savedHydrated ? (
        <section className="my-saved-playlists" aria-labelledby="saved-playlists-title">
          <div className="my-saved-playlists-head">
            <div>
              <p className="eyebrow">Saved on this device</p>
              <h2 id="saved-playlists-title" className="mt-1 text-xl font-extrabold">Your playlist shelf</h2>
            </div>
            <div className="my-saved-playlists-actions">
              <span className="my-saved-playlists-count">{savedPlaylists.length}/{MAX_SAVED_PLAYLISTS} saved</span>
              <div className="my-saved-view-switch" role="group" aria-label="Saved playlists layout">
                <button type="button" onClick={() => changeSavedView("grid")} aria-pressed={savedView === "grid"} className={savedView === "grid" ? "is-on" : ""}>
                  <span aria-hidden>▦</span> Grid
                </button>
                <button type="button" onClick={() => changeSavedView("list")} aria-pressed={savedView === "list"} className={savedView === "list" ? "is-on" : ""}>
                  <span aria-hidden>☰</span> List
                </button>
              </div>
            </div>
          </div>

          {savedPlaylists.length ? (
            <div className={savedView === "grid" ? "my-saved-playlists-grid" : "my-saved-playlists-list"}>
              {savedPlaylists.map((saved, index) => (
                <article key={saved.id} className={`saved-playlist-card ${savedView === "list" ? "is-list" : ""} stagger-in`} style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}>
                  <button type="button" onClick={() => openSavedPlaylist(saved)} className="saved-playlist-main" aria-label={`Open ${saved.title}`}>
                    <span className="saved-playlist-art" aria-hidden>
                      {saved.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={saved.thumbnail} alt="" loading="lazy" />
                      ) : (
                        <span>🎶</span>
                      )}
                      <span className="saved-playlist-art-shade" />
                      <span className="saved-playlist-open"><Queue size={16} /> Open</span>
                    </span>
                    <span className="saved-playlist-copy">
                      <span className="line-1 saved-playlist-title">{saved.title}</span>
                      <span className="line-1 saved-playlist-channel">{saved.channel || "YouTube"}</span>
                    </span>
                  </button>
                  <div className="saved-playlist-meta">
                    <span>{saved.songs.length} {saved.songs.length === 1 ? "song" : "songs"} · {savedTime(saved.savedAt)}</span>
                    <button type="button" onClick={() => playQueue(saved.songs, 0)} aria-label={`Play ${saved.title}`} className="saved-playlist-play">
                      <Play size={14} />
                    </button>
                  </div>
                  <button type="button" onClick={() => removeSavedPlaylist(saved.id)} aria-label={`Remove ${saved.title} from saved playlists`} className="saved-playlist-remove">
                    <Trash size={14} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="my-saved-playlists-empty">
              <span aria-hidden className="text-2xl">📚</span>
              <div>
                <h3 className="font-bold text-white/84">Abhi koi playlist saved nahi hai</h3>
                <p className="mt-0.5 text-sm text-white/48">Upar public YouTube playlist link paste karo — wo yahin ek beautiful grid mein save ho jaayegi.</p>
              </div>
            </div>
          )}
        </section>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {state === "loading" ? "Fetching public YouTube playlist" : playlist ? `${playlist.songs.length} songs found and saved on this device` : ""}
      </p>

      {state === "loading" ? <div className="mt-7"><LoadingCards /></div> : null}

      {state === "error" && error ? (
        <div role="alert" className={`my-playlist-error mt-7 ${error.code === "PRIVATE" ? "is-private" : ""}`}>
          <span className="text-2xl" aria-hidden>{error.code === "PRIVATE" ? "🔒" : "⚠️"}</span>
          <div>
            <h3 className="font-bold text-white/92">{error.code === "PRIVATE" ? "Playlist private hai" : "Playlist fetch nahi hui"}</h3>
            <p className="mt-0.5 text-sm leading-relaxed text-white/62">{error.error}</p>
            {error.code === "PRIVATE" ? (
              <p className="mt-2 text-xs leading-relaxed text-[color:var(--color-amber)]">
                YouTube → Playlist → Edit → Visibility → <b>Public</b>, phir yahan link paste kijiye.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {state === "done" && playlist ? (
        <div ref={resultRef} className="mt-8 scroll-mt-32">
          <section className="my-playlist-hero fade-up">
            <div className="my-playlist-cover" aria-hidden>
              {playlist.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={playlist.thumbnail} alt="" />
              ) : (
                <span>🎶</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="eyebrow">Saved in your playlist shelf</p>
              <h2 className="line-2 mt-1.5 text-2xl font-extrabold tracking-tight sm:text-3xl">{playlist.title}</h2>
              <p className="mt-1 line-1 text-sm text-white/55">
                {playlist.channel ? `${playlist.channel} · ` : ""}{playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <GlowButton size="lg" aura onClick={() => playQueue(playlist.songs, 0)} disabled={!playlist.songs.length}>
                  <Play size={16} /> Play all
                </GlowButton>
                <button type="button" onClick={shuffleAndPlay} disabled={!playlist.songs.length} className="btn btn-ghost px-4 py-2.5 text-sm disabled:opacity-45">
                  <Shuffle size={16} /> Shuffle
                </button>
                <button type="button" onClick={() => playlist.songs.forEach((song) => addToQueue(song))} disabled={!playlist.songs.length} className="btn btn-ghost px-4 py-2.5 text-sm disabled:opacity-45">
                  <Queue size={16} /> Add all to queue
                </button>
              </div>
            </div>
          </section>

          {playlist.songs.length ? (
            <div className="my-playlist-grid mt-7">
              {playlist.songs.map((song, index) => (
                <div key={song.youtubeId} className="stagger-in" style={{ animationDelay: `${Math.min(index, 14) * 36}ms` }}>
                  <SongCard song={song} contextQueue={playlist.songs} priority={index < 6} />
                </div>
              ))}
            </div>
          ) : (
            <div className="my-playlist-empty mt-7">
              <p className="text-3xl" aria-hidden>🎧</p>
              <h3 className="mt-3 font-bold">Is public playlist mein playable songs nahi mile.</h3>
              <p className="mt-1 text-sm text-white/52">YouTube par videos public aur embeddable hain ya nahi, ek baar check kar lijiye.</p>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
