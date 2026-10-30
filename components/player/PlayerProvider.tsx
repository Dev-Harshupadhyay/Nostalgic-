"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PlayerStatus, RepeatMode, Song } from "@/lib/types";
import { shortTitle } from "@/lib/format";
import { useYouTubePlayer, type YTState } from "@/lib/useYouTubePlayer";

const STORAGE = {
  recent: "nostalgic:recent",
  favourites: "nostalgic:favourites",
  resume: "nostalgic:resume",
  prefs: "nostalgic:prefs",
  queue: "nostalgic:queue",
};

const MAX_RECENT = 24;
/** Below this, Previous jumps to the earlier track; above it, it restarts. */
export const PREVIOUS_RESTART_THRESHOLD = 4;

type Prefs = { volume: number; muted: boolean; repeat: RepeatMode; shuffle: boolean };

const DEFAULT_PREFS: Prefs = { volume: 80, muted: false, repeat: "off", shuffle: false };

type PlayerContextValue = {
  current: Song | null;
  queue: Song[];
  queueIndex: number;
  status: PlayerStatus;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  error: string | null;
  canGoNext: boolean;
  canGoPrevious: boolean;
  fullPlayerOpen: boolean;
  queuePanelOpen: boolean;
  recentlyPlayed: Song[];
  favourites: Song[];
  resumeTarget: { song: Song; position: number } | null;

  playSong: (song: Song, contextQueue?: Song[]) => void;
  playQueue: (songs: Song[], startIndex?: number) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (song: Song) => void;
  playNextInQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  moveInQueue: (from: number, to: number) => void;
  clearQueue: () => void;
  jumpTo: (index: number) => void;
  toggleFavourite: (song: Song) => void;
  isFavourite: (song: Song) => boolean;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  toggleQueuePanel: () => void;
  setQueuePanelOpen: (open: boolean) => void;
  resumeLast: () => void;
  notify: (message: string) => void;
  toastMessage: { id: number; text: string } | null;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}

/* ------------------------------- Storage --------------------------------- */

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private mode — never fatal */
  }
}

function shuffleKeeping<T>(items: T[], keepIndex: number): T[] {
  const rest = items.filter((_, i) => i !== keepIndex);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  const head = items[keepIndex];
  return head ? [head, ...rest] : rest;
}

/* ------------------------------- Provider -------------------------------- */

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [error, setError] = useState<string | null>(null);
  const [fullPlayerOpen, setFullPlayerOpen] = useState(false);
  const [queuePanelOpen, setQueuePanelOpen] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [favourites, setFavourites] = useState<Song[]>([]);
  const [resumeTarget, setResumeTarget] = useState<{ song: Song; position: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ id: number; text: string } | null>(null);

  /* Mirrors for use inside stable callbacks / player events. */
  const queueRef = useRef<Song[]>([]);
  const indexRef = useRef(-1);
  const prefsRef = useRef<Prefs>(DEFAULT_PREFS);
  const seekingRef = useRef(false);

  const current = queueIndex >= 0 ? queue[queueIndex] ?? null : null;
  const isPlaying = status === "playing" || status === "buffering";

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  useEffect(() => {
    indexRef.current = queueIndex;
  }, [queueIndex]);
  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  const notify = useCallback((text: string) => {
    setToastMessage({ id: Date.now() + Math.random(), text });
  }, []);

  const savePrefs = useCallback((patch: Partial<Prefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      prefsRef.current = next;
      writeJSON(STORAGE.prefs, next);
      return next;
    });
  }, []);

  /* ------------------------- YouTube abstraction ------------------------- */

  /* True as soon as the user deliberately loads any track. */
  const userLoadedRef = useRef(false);
  const advanceRef = useRef<(auto: boolean) => void>(() => {});
  const loadRef = useRef<(song: Song, autoplay: boolean, startAt?: number) => void>(() => {});

  const player = useYouTubePlayer(
    {
      onStateChange: (state: YTState) => {
        if (state === "playing") {
          setStatus("playing");
          setError(null);
          const d = player.getDuration();
          if (d > 0) setDuration(d);
        } else if (state === "paused") {
          // A pause fired while seeking is a transient artefact, not a real pause.
          if (!seekingRef.current) setStatus("paused");
        } else if (state === "buffering") {
          setStatus("buffering");
        } else if (state === "cued") {
          setStatus("paused");
          const d = player.getDuration();
          if (d > 0) setDuration(d);
        }
      },
      onEnded: () => {
        setStatus("ended");
        advanceRef.current(true);
      },
      onError: () => {
        setStatus("error");
        setError("Unable to play this song. Try another track.");
        // Skip forward so one dead video doesn't stall the whole queue.
        window.setTimeout(() => {
          if (queueRef.current.length > 1) advanceRef.current(true);
        }, 1600);
      },
      onApiFailure: () => {
        setStatus("error");
        setError("Music service is temporarily unavailable. Please try again.");
      },
    },
    DEFAULT_PREFS.volume
  );

  /* --------------------------- Restore on mount -------------------------- */

  useEffect(() => {
    setRecentlyPlayed(readJSON<Song[]>(STORAGE.recent, []));
    setFavourites(readJSON<Song[]>(STORAGE.favourites, []));

    const storedPrefs = readJSON<Partial<Prefs>>(STORAGE.prefs, {});
    const merged = { ...DEFAULT_PREFS, ...storedPrefs };
    setPrefs(merged);
    prefsRef.current = merged;

    const resume = readJSON<{ song: Song; position: number } | null>(STORAGE.resume, null);
    if (resume?.song?.youtubeId) setResumeTarget(resume);

    /* Restore the queue but NEVER autoplay — the song is only cued, so
       reopening the site is always silent until the user asks for sound. */
    const savedQueue = readJSON<{ songs: Song[]; index: number } | null>(STORAGE.queue, null);
    if (savedQueue?.songs?.length) {
      const idx = Math.min(Math.max(savedQueue.index, 0), savedQueue.songs.length - 1);
      setQueue(savedQueue.songs);
      queueRef.current = savedQueue.songs;
      setQueueIndex(idx);
      indexRef.current = idx;
    }
  }, []);

  /* Apply restored volume/mute once the player is live. */
  useEffect(() => {
    if (!player.ready) return;
    player.setVolume(prefsRef.current.volume);
    if (prefsRef.current.muted) player.mute();
  }, [player.ready, player]);

  /* Cue (never autoplay) the restored track once the player is ready.
     Skipped entirely if the user already asked for a song while the iframe was
     still booting — otherwise this would re-cue (and therefore silence) the very
     track they just pressed play on. */
  const cuedRestoreRef = useRef(false);
  useEffect(() => {
    if (!player.ready || cuedRestoreRef.current || userLoadedRef.current) return;
    const song = queueRef.current[indexRef.current];
    if (!song) return;
    cuedRestoreRef.current = true;
    const resume = readJSON<{ song: Song; position: number } | null>(STORAGE.resume, null);
    const startAt = resume?.song?.youtubeId === song.youtubeId ? resume.position : 0;
    setStatus("paused");
    player.loadVideo(song.youtubeId, { autoplay: false, startAt });
  }, [player.ready, player]);

  /* Persist the queue so it survives a refresh. */
  useEffect(() => {
    if (queue.length === 0) return;
    writeJSON(STORAGE.queue, { songs: queue.slice(0, 60), index: queueIndex });
  }, [queue, queueIndex]);

  /* ------------------------------ Progress ------------------------------- */

  /**
   * Single rAF loop, throttled to ~4 updates/sec. The YouTube player is the only
   * source of truth for time — we never run an independent timer.
   */
  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    let last = 0;

    const tick = (ts: number) => {
      if (ts - last >= 250) {
        last = ts;
        if (!seekingRef.current) {
          const t = player.getCurrentTime();
          if (Number.isFinite(t)) setCurrentTime(t);
        }
        const d = player.getDuration();
        if (Number.isFinite(d) && d > 0) {
          setDuration((prev) => (Math.abs(prev - d) > 0.5 ? d : prev));
        }
      }
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [isPlaying, player]);

  /* Persist a resume point (throttled). */
  useEffect(() => {
    if (!current || currentTime < 5) return;
    const id = window.setTimeout(() => {
      writeJSON(STORAGE.resume, { song: current, position: Math.floor(currentTime) });
    }, 2000);
    return () => window.clearTimeout(id);
  }, [current, currentTime]);

  /* Lock-screen / headset controls on Android. */
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator) || !current) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.title,
        artist: current.artist,
        album: current.category,
        artwork: [
          { src: current.thumbnail, sizes: "480x360", type: "image/jpeg" },
          {
            src: `https://i.ytimg.com/vi/${current.youtubeId}/maxresdefault.jpg`,
            sizes: "1280x720",
            type: "image/jpeg",
          },
        ],
      });
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    } catch {
      /* unsupported browser */
    }
  }, [current, isPlaying]);

  /* ------------------------------ Transport ------------------------------ */

  const pushRecent = useCallback((song: Song) => {
    setRecentlyPlayed((prev) => {
      const next = [song, ...prev.filter((s) => s.youtubeId !== song.youtubeId)].slice(0, MAX_RECENT);
      writeJSON(STORAGE.recent, next);
      return next;
    });
  }, []);

  /** Load a track: reset the timer first so the UI never shows stale progress. */
  const load = useCallback(
    (song: Song, autoplay: boolean, startAt?: number) => {
      if (autoplay) {
        userLoadedRef.current = true;
        cuedRestoreRef.current = true;
      }
      setError(null);
      setStatus("loading");
      setCurrentTime(startAt ?? 0);
      setDuration(0);
      pushRecent(song);
      player.loadVideo(song.youtubeId, { autoplay, startAt });
    },
    [player, pushRecent]
  );

  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  /** Shared next-track logic for the button and for the ENDED event. */
  const advance = useCallback(
    (auto: boolean) => {
      const q = queueRef.current;
      const i = indexRef.current;
      const repeat = prefsRef.current.repeat;
      if (!q.length) return;

      if (auto && repeat === "one") {
        setCurrentTime(0);
        player.seekTo(0);
        player.play();
        return;
      }

      const atEnd = i >= q.length - 1;
      if (atEnd) {
        // Manual Next wraps; automatic advance only wraps with repeat = all.
        if (!auto || repeat === "all") {
          setQueueIndex(0);
          indexRef.current = 0;
          load(q[0], true);
        } else {
          setStatus("ended");
          setCurrentTime(0);
        }
        return;
      }

      const nextIndex = i + 1;
      setQueueIndex(nextIndex);
      indexRef.current = nextIndex;
      load(q[nextIndex], true);
    },
    [load, player]
  );

  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  const playQueue = useCallback(
    (songs: Song[], startIndex = 0) => {
      if (!songs.length) return;
      const safeStart = Math.min(Math.max(startIndex, 0), songs.length - 1);
      const ordered = prefsRef.current.shuffle ? shuffleKeeping(songs, safeStart) : songs;
      const index = prefsRef.current.shuffle ? 0 : safeStart;
      setQueue(ordered);
      queueRef.current = ordered;
      setQueueIndex(index);
      indexRef.current = index;
      load(ordered[index], true);
    },
    [load]
  );

  const playSong = useCallback(
    (song: Song, contextQueue?: Song[]) => {
      if (contextQueue?.length) {
        const idx = contextQueue.findIndex((s) => s.youtubeId === song.youtubeId);
        playQueue(contextQueue, idx >= 0 ? idx : 0);
        return;
      }
      const existing = queueRef.current.findIndex((s) => s.youtubeId === song.youtubeId);
      if (existing >= 0) {
        setQueueIndex(existing);
        indexRef.current = existing;
        load(song, true);
        return;
      }
      const nextQueue = [...queueRef.current, song];
      setQueue(nextQueue);
      queueRef.current = nextQueue;
      const idx = nextQueue.length - 1;
      setQueueIndex(idx);
      indexRef.current = idx;
      load(song, true);
    },
    [load, playQueue]
  );

  const togglePlay = useCallback(() => {
    if (!current) return;
    if (status === "ended") {
      setCurrentTime(0);
      player.seekTo(0);
      player.play();
      return;
    }
    if (isPlaying) player.pause();
    else player.play();
  }, [current, isPlaying, player, status]);

  const previous = useCallback(() => {
    const q = queueRef.current;
    const i = indexRef.current;
    if (!q.length) return;

    // Standard music-player behaviour: restart if we're past the threshold.
    if (player.getCurrentTime() > PREVIOUS_RESTART_THRESHOLD) {
      setCurrentTime(0);
      player.seekTo(0);
      return;
    }
    if (i <= 0) {
      setCurrentTime(0);
      player.seekTo(0);
      return;
    }
    const prevIndex = i - 1;
    setQueueIndex(prevIndex);
    indexRef.current = prevIndex;
    load(q[prevIndex], true);
  }, [load, player]);

  /**
   * Seek. `seekingRef` suppresses both the progress loop and the transient
   * "paused" event YouTube emits mid-seek, so the thumb never jumps back.
   */
  const seekTo = useCallback(
    (seconds: number) => {
      if (!current) return;
      const target = Math.max(0, duration ? Math.min(seconds, duration) : seconds);
      seekingRef.current = true;
      setCurrentTime(target);
      player.seekTo(target);
      window.setTimeout(() => {
        seekingRef.current = false;
      }, 320);
    },
    [current, duration, player]
  );

  const setVolume = useCallback(
    (v: number) => {
      const clamped = Math.min(100, Math.max(0, Math.round(v)));
      savePrefs({ volume: clamped, muted: clamped === 0 });
      player.setVolume(clamped);
      if (clamped === 0) player.mute();
      else player.unMute();
    },
    [player, savePrefs]
  );

  const toggleMute = useCallback(() => {
    const nextMuted = !prefsRef.current.muted;
    savePrefs({ muted: nextMuted });
    if (nextMuted) player.mute();
    else {
      player.unMute();
      if (prefsRef.current.volume === 0) {
        savePrefs({ volume: 60 });
        player.setVolume(60);
      }
    }
  }, [player, savePrefs]);

  const toggleShuffle = useCallback(() => {
    const nextShuffle = !prefsRef.current.shuffle;
    savePrefs({ shuffle: nextShuffle });
    if (nextShuffle) {
      const q = queueRef.current;
      const i = indexRef.current;
      if (q.length > 1 && i >= 0) {
        const reordered = shuffleKeeping(q, i);
        setQueue(reordered);
        queueRef.current = reordered;
        setQueueIndex(0);
        indexRef.current = 0;
      }
    }
    notify(nextShuffle ? "Shuffle on" : "Shuffle off");
  }, [notify, savePrefs]);

  const cycleRepeat = useCallback(() => {
    const order: RepeatMode[] = ["off", "all", "one"];
    const nextRepeat = order[(order.indexOf(prefsRef.current.repeat) + 1) % order.length];
    savePrefs({ repeat: nextRepeat });
    notify(
      nextRepeat === "off"
        ? "Repeat off"
        : nextRepeat === "all"
        ? "Repeat queue"
        : "Repeat this song"
    );
  }, [notify, savePrefs]);

  const addToQueue = useCallback(
    (song: Song) => {
      const exists = queueRef.current.some((s) => s.youtubeId === song.youtubeId);
      if (exists) {
        notify("Already in queue");
        return;
      }
      const next = [...queueRef.current, song];
      setQueue(next);
      queueRef.current = next;
      if (indexRef.current < 0) {
        setQueueIndex(0);
        indexRef.current = 0;
        load(song, false);
      }
      notify(`Added to queue — ${shortTitle(song.title, 40)}`);
    },
    [load, notify]
  );

  const playNextInQueue = useCallback(
    (song: Song) => {
      const filtered = queueRef.current.filter((s) => s.youtubeId !== song.youtubeId);
      const at = Math.max(indexRef.current, 0) + 1;
      const next = [...filtered.slice(0, at), song, ...filtered.slice(at)];
      setQueue(next);
      queueRef.current = next;
      notify("Playing next");
    },
    [notify]
  );

  const removeFromQueue = useCallback(
    (index: number) => {
      const q = queueRef.current;
      if (index < 0 || index >= q.length) return;
      const wasCurrent = index === indexRef.current;
      const next = q.filter((_, i) => i !== index);
      setQueue(next);
      queueRef.current = next;

      if (!next.length) {
        setQueueIndex(-1);
        indexRef.current = -1;
        setStatus("idle");
        setCurrentTime(0);
        setDuration(0);
        player.pause();
        return;
      }
      if (index < indexRef.current) {
        const ni = indexRef.current - 1;
        setQueueIndex(ni);
        indexRef.current = ni;
      } else if (wasCurrent) {
        const ni = Math.min(indexRef.current, next.length - 1);
        setQueueIndex(ni);
        indexRef.current = ni;
        load(next[ni], isPlaying);
      }
    },
    [isPlaying, load, player]
  );

  const moveInQueue = useCallback((from: number, to: number) => {
    const q = queueRef.current;
    if (to < 0 || to >= q.length || from === to) return;
    const next = [...q];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setQueue(next);
    queueRef.current = next;

    const cur = indexRef.current;
    let ni = cur;
    if (cur === from) ni = to;
    else if (from < cur && to >= cur) ni = cur - 1;
    else if (from > cur && to <= cur) ni = cur + 1;
    setQueueIndex(ni);
    indexRef.current = ni;
  }, []);

  const clearQueue = useCallback(() => {
    const keep = indexRef.current >= 0 ? queueRef.current[indexRef.current] : null;
    const next = keep ? [keep] : [];
    setQueue(next);
    queueRef.current = next;
    setQueueIndex(keep ? 0 : -1);
    indexRef.current = keep ? 0 : -1;
    notify("Queue cleared");
  }, [notify]);

  const jumpTo = useCallback(
    (index: number) => {
      const q = queueRef.current;
      if (index < 0 || index >= q.length) return;
      setQueueIndex(index);
      indexRef.current = index;
      load(q[index], true);
    },
    [load]
  );

  const toggleFavourite = useCallback(
    (song: Song) => {
      setFavourites((prev) => {
        const exists = prev.some((s) => s.youtubeId === song.youtubeId);
        const next = exists
          ? prev.filter((s) => s.youtubeId !== song.youtubeId)
          : [song, ...prev].slice(0, 200);
        writeJSON(STORAGE.favourites, next);
        notify(exists ? "Removed from favourites" : "Added to favourites ❤️");
        return next;
      });
    },
    [notify]
  );

  const isFavourite = useCallback(
    (song: Song) => favourites.some((s) => s.youtubeId === song.youtubeId),
    [favourites]
  );

  const resumeLast = useCallback(() => {
    if (!resumeTarget) return;
    const song = resumeTarget.song;
    const q = queueRef.current;
    const nextQueue = q.some((s) => s.youtubeId === song.youtubeId) ? q : [song, ...q];
    const index = nextQueue.findIndex((s) => s.youtubeId === song.youtubeId);
    setQueue(nextQueue);
    queueRef.current = nextQueue;
    setQueueIndex(index);
    indexRef.current = index;
    load(song, true, resumeTarget.position);
  }, [load, resumeTarget]);

  /* --------------------------- Keyboard shortcuts ------------------------ */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          if (e.shiftKey) {
            e.preventDefault();
            advance(false);
          }
          break;
        case "ArrowLeft":
          if (e.shiftKey) {
            e.preventDefault();
            previous();
          }
          break;
        case "KeyM":
          toggleMute();
          break;
        case "Escape":
          setFullPlayerOpen(false);
          setQueuePanelOpen(false);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, previous, togglePlay, toggleMute]);

  /* -------------------------------- Value -------------------------------- */

  const canGoNext = queue.length > 0 && (queueIndex < queue.length - 1 || prefs.repeat !== "off");
  const canGoPrevious = queue.length > 0;

  const value = useMemo<PlayerContextValue>(
    () => ({
      current,
      queue,
      queueIndex,
      status,
      isPlaying,
      currentTime,
      duration,
      volume: prefs.volume,
      muted: prefs.muted,
      shuffle: prefs.shuffle,
      repeat: prefs.repeat,
      error,
      canGoNext,
      canGoPrevious,
      fullPlayerOpen,
      queuePanelOpen,
      recentlyPlayed,
      favourites,
      resumeTarget,
      playSong,
      playQueue,
      togglePlay,
      next: () => advance(false),
      previous,
      seekTo,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      addToQueue,
      playNextInQueue,
      removeFromQueue,
      moveInQueue,
      clearQueue,
      jumpTo,
      toggleFavourite,
      isFavourite,
      openFullPlayer: () => setFullPlayerOpen(true),
      closeFullPlayer: () => setFullPlayerOpen(false),
      toggleQueuePanel: () => setQueuePanelOpen((v) => !v),
      setQueuePanelOpen,
      resumeLast,
      notify,
      toastMessage,
    }),
    [
      current,
      queue,
      queueIndex,
      status,
      isPlaying,
      currentTime,
      duration,
      prefs,
      error,
      canGoNext,
      canGoPrevious,
      fullPlayerOpen,
      queuePanelOpen,
      recentlyPlayed,
      favourites,
      resumeTarget,
      playSong,
      playQueue,
      togglePlay,
      advance,
      previous,
      seekTo,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      addToQueue,
      playNextInQueue,
      removeFromQueue,
      moveInQueue,
      clearQueue,
      jumpTo,
      toggleFavourite,
      isFavourite,
      resumeLast,
      notify,
      toastMessage,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
