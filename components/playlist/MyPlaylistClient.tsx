"use client";

import { useEffect, useRef, useState } from "react";
import GlowButton from "@/components/ui/GlowButton";
import SongCard from "@/components/music/SongCard";
import { usePlayer } from "@/components/player/PlayerProvider";
import type { Song } from "@/lib/types";
import { Close, Play, Queue, Shuffle, Spinner } from "@/components/ui/Icons";

type State = "idle" | "loading" | "done" | "error";
type Playlist = {
  id: string;
  title: string;
  channel?: string;
  thumbnail?: string;
  songs: Song[];
  source: "youtube-api" | "youtube-public";
  cached?: boolean;
};
type PlaylistError = { code?: "INVALID_URL" | "PRIVATE" | "UNAVAILABLE"; error?: string };

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

/** A private, paste-only YouTube playlist importer. Nothing is stored on our server. */
export default function MyPlaylistClient() {
  const { playQueue, addToQueue } = usePlayer();
  const [url, setUrl] = useState("");
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<PlaylistError | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const runRef = useRef(0);

  useEffect(() => () => abortRef.current?.abort(), []);

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
    <section aria-label="Import a public YouTube playlist">
      <div className="my-playlist-form">
        <div className="my-playlist-form-aura" aria-hidden />
        <div className="relative">
          <p className="eyebrow">Public YouTube playlist</p>
          <h2 className="mt-1.5 text-xl font-extrabold sm:text-2xl">Link paste karo, playlist chalao</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/58">
            YouTube par playlist <b className="text-white/84">Public</b> honi chahiye. Private playlist
            fetch nahi hoti aur hum aapka link ya songs save nahi karte.
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
              {state === "loading" ? "Fetching…" : "Fetch playlist"}
            </GlowButton>
          </form>
          <p className="mt-2 text-[0.72rem] text-white/38">
            Example: youtube.com/playlist?list=PL… &nbsp;·&nbsp; Private / Watch Later playlist supported nahi hai.
          </p>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {state === "loading" ? "Fetching public YouTube playlist" : playlist ? `${playlist.songs.length} songs found` : ""}
      </p>

      {state === "loading" ? <div className="mt-7"><LoadingCards /></div> : null}

      {state === "error" && error ? (
        <div
          role="alert"
          className={`my-playlist-error mt-7 ${error.code === "PRIVATE" ? "is-private" : ""}`}
        >
          <span className="text-2xl" aria-hidden>{error.code === "PRIVATE" ? "🔒" : "⚠️"}</span>
          <div>
            <h3 className="font-bold text-white/92">
              {error.code === "PRIVATE" ? "Playlist private hai" : "Playlist fetch nahi hui"}
            </h3>
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
        <div className="mt-8">
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
              <p className="eyebrow">Fetched from YouTube</p>
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
