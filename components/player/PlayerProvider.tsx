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

/* ------------------------------ YT typings ------------------------------ */

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  loadVideoById: (id: string) => void;
  cueVideoById: (id: string) => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (v: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getDuration: () => number;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement | string, opts: Record<string, unknown>) => YTPlayer;
      PlayerState: Record<string, number>;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const STORAGE_KEYS = {
  recent: "nostalgic:recent",
  favourites: "nostalgic:favourites",
  resume: "nostalgic:resume",
  volume: "nostalgic:volume",
};

const MAX_RECENT = 24;

/* ------------------------------- Context -------------------------------- */

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
  seekRatio: (ratio: number) => void;
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
  registerHost: (el: HTMLElement | null) => void;
  notify: (message: string) => void;
  toastMessage: { id: number; text: string } | null;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}

/* ------------------------------ Utilities ------------------------------- */

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
    /* storage may be full or blocked — non-fatal */
  }
}

let apiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new Error("YouTube player took too long to load")),
      20000
    );
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      window.clearTimeout(timeout);
      resolve();
    };
    if (!document.getElementById("yt-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      tag.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error("Failed to load the YouTube player"));
      };
      document.head.appendChild(tag);
    }
  });
  apiPromise.catch(() => {
    apiPromise = null;
  });
  return apiPromise;
}

function shuffled<T>(items: T[], keepFirst?: number): T[] {
  const arr = [...items];
  const head = keepFirst != null ? arr.splice(keepFirst, 1) : [];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return [...head, ...arr];
}

/* ------------------------------- Provider ------------------------------- */

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [error, setError] = useState<string | null>(null);
  const [fullPlayerOpen, setFullPlayerOpen] = useState(false);
  const [queuePanelOpen, setQueuePanelOpen] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [favourites, setFavourites] = useState<Song[]>([]);
  const [resumeTarget, setResumeTarget] = useState<{ song: Song; position: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ id: number; text: string } | null>(null);

  const playerRef = useRef<YTPlayer | null>(null);
  const holderRef = useRef<HTMLDivElement | null>(null); // persistent off-DOM-safe container
  const hostRef = useRef<HTMLElement | null>(null); // where the iframe is visually parented
  const readyRef = useRef(false);
  const pendingRef = useRef<{ song: Song; autoplay: boolean; startAt?: number } | null>(null);
  const currentIdRef = useRef<string | null>(null);
  const userInteractedRef = useRef(false);
  const queueRef = useRef<Song[]>([]);
  const indexRef = useRef(-1);
  const repeatRef = useRef<RepeatMode>("off");
  const shuffleRef = useRef(false);

  const current = queueIndex >= 0 ? queue[queueIndex] ?? null : null;
  const isPlaying = status === "playing" || status === "buffering";

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  useEffect(() => {
    indexRef.current = queueIndex;
  }, [queueIndex]);
  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);
  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  const notify = useCallback((text: string) => {
    setToastMessage({ id: Date.now() + Math.random(), text });
  }, []);

  /* ---------------------- Restore persisted state ---------------------- */

  useEffect(() => {
    setRecentlyPlayed(readJSON<Song[]>(STORAGE_KEYS.recent, []));
    setFavourites(readJSON<Song[]>(STORAGE_KEYS.favourites, []));
    const savedVolume = readJSON<number | null>(STORAGE_KEYS.volume, null);
    if (typeof savedVolume === "number") setVolumeState(savedVolume);
    const resume = readJSON<{ song: Song; position: number } | null>(STORAGE_KEYS.resume, null);
    if (resume?.song?.youtubeId) setResumeTarget(resume);
  }, []);

  /* --------------------------- Player bootstrap ------------------------- */

  const applyPending = useCallback(() => {
    const pending = pendingRef.current;
    const player = playerRef.current;
    if (!pending || !player || !readyRef.current) return;
    pendingRef.current = null;
    currentIdRef.current = pending.song.youtubeId;
    setError(null);
    setStatus("loading");
    setCurrentTime(pending.startAt ?? 0);
    setDuration(0);
    try {
      if (pending.autoplay) player.loadVideoById(pending.song.youtubeId);
      else player.cueVideoById(pending.song.youtubeId);
      if (pending.startAt) {
        window.setTimeout(() => {
          try {
            player.seekTo(pending.startAt!, true);
          } catch {
            /* ignore */
          }
        }, 400);
      }
    } catch {
      setStatus("error");
      setError("This song could not be loaded. Try another one.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // A stable holder div that lives for the app's lifetime. We move this node
    // between mount points (mini player / full player) instead of recreating
    // the iframe, so playback never restarts on navigation.
    const holder = document.createElement("div");
    holder.id = "nostalgic-yt-holder";
    holder.style.width = "100%";
    holder.style.height = "100%";
    holderRef.current = holder;

    const inner = document.createElement("div");
    inner.id = "nostalgic-yt-frame";
    holder.appendChild(inner);

    if (hostRef.current) hostRef.current.appendChild(holder);
    else {
      holder.style.position = "fixed";
      holder.style.left = "-9999px";
      holder.style.top = "0";
      holder.style.width = "1px";
      holder.style.height = "1px";
      document.body.appendChild(holder);
    }

    loadYouTubeApi()
      .then(() => {
        if (cancelled || !window.YT) return;
        playerRef.current = new window.YT.Player(inner, {
          width: "100%",
          height: "100%",
          playerVars: {
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            origin: typeof window !== "undefined" ? window.location.origin : undefined,
          },
          events: {
            onReady: (e: { target: YTPlayer }) => {
              readyRef.current = true;
              try {
                e.target.setVolume(volume);
              } catch {
                /* ignore */
              }
              applyPending();
            },
            onStateChange: (e: { data: number }) => {
              const S = window.YT?.PlayerState ?? {};
              const player = playerRef.current;
              if (e.data === S.PLAYING) {
                setStatus("playing");
                setError(null);
                if (player) setDuration(player.getDuration() || 0);
              } else if (e.data === S.PAUSED) setStatus("paused");
              else if (e.data === S.BUFFERING) setStatus("buffering");
              else if (e.data === S.CUED) setStatus("paused");
              else if (e.data === S.ENDED) {
                setStatus("ended");
                handleEnded();
              }
            },
            onError: () => {
              setStatus("error");
              setError("This song is unavailable on YouTube. Skipping to the next one.");
              window.setTimeout(() => {
                if (queueRef.current.length > 1) goNext(true);
              }, 1400);
            },
          },
        });
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        setError("Music service is temporarily unavailable. Please try again.");
      });

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
      readyRef.current = false;
      holder.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Lets the mini/full player claim the persistent iframe node. */
  const registerHost = useCallback((el: HTMLElement | null) => {
    hostRef.current = el;
    const holder = holderRef.current;
    if (!holder) return;
    if (el) {
      holder.style.position = "";
      holder.style.left = "";
      holder.style.top = "";
      holder.style.width = "100%";
      holder.style.height = "100%";
      if (holder.parentElement !== el) el.appendChild(holder);
    } else if (holder.parentElement !== document.body) {
      holder.style.position = "fixed";
      holder.style.left = "-9999px";
      holder.style.top = "0";
      holder.style.width = "1px";
      holder.style.height = "1px";
      document.body.appendChild(holder);
    }
  }, []);

  /* ------------------------------ Progress ------------------------------ */

  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (ts - last > 400) {
        last = ts;
        const player = playerRef.current;
        if (player && readyRef.current) {
          try {
            const t = player.getCurrentTime();
            const d = player.getDuration();
            if (Number.isFinite(t)) setCurrentTime(t);
            if (Number.isFinite(d) && d > 0) setDuration(d);
          } catch {
            /* transient */
          }
        }
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [isPlaying]);

  /* Persist resume point (throttled to whole seconds). */
  useEffect(() => {
    if (!current || currentTime < 3) return;
    const id = window.setTimeout(() => {
      writeJSON(STORAGE_KEYS.resume, { song: current, position: Math.floor(currentTime) });
    }, 1500);
    return () => window.clearTimeout(id);
  }, [current, currentTime]);

  /* Media Session (lock-screen controls on Android). */
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
      /* not supported */
    }
  }, [current, isPlaying]);

  /* ----------------------------- Transport ----------------------------- */

  const pushRecent = useCallback((song: Song) => {
    setRecentlyPlayed((prev) => {
      const next = [song, ...prev.filter((s) => s.youtubeId !== song.youtubeId)].slice(
        0,
        MAX_RECENT
      );
      writeJSON(STORAGE_KEYS.recent, next);
      return next;
    });
  }, []);

  const load = useCallback(
    (song: Song, autoplay: boolean, startAt?: number) => {
      pendingRef.current = { song, autoplay, startAt };
      pushRecent(song);
      if (readyRef.current && playerRef.current) applyPending();
      else setStatus("loading");
    },
    [applyPending, pushRecent]
  );

  const goNext = useCallback(
    (auto = false) => {
      const q = queueRef.current;
      const i = indexRef.current;
      if (!q.length) return;
      if (auto && repeatRef.current === "one") {
        const player = playerRef.current;
        try {
          player?.seekTo(0, true);
          player?.playVideo();
        } catch {
          /* ignore */
        }
        return;
      }
      let nextIndex = i + 1;
      if (nextIndex >= q.length) {
        if (repeatRef.current === "all" || !auto) nextIndex = 0;
        else {
          setStatus("paused");
          return;
        }
      }
      setQueueIndex(nextIndex);
      load(q[nextIndex], true);
    },
    [load]
  );

  function handleEnded() {
    goNext(true);
  }

  const playQueue = useCallback(
    (songs: Song[], startIndex = 0) => {
      if (!songs.length) return;
      userInteractedRef.current = true;
      const ordered = shuffleRef.current ? shuffled(songs, startIndex) : songs;
      const index = shuffleRef.current ? 0 : startIndex;
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
      userInteractedRef.current = true;
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
    const player = playerRef.current;
    if (!player || !readyRef.current) return;
    userInteractedRef.current = true;
    try {
      if (isPlaying) player.pauseVideo();
      else player.playVideo();
    } catch {
      /* ignore */
    }
  }, [isPlaying]);

  const previous = useCallback(() => {
    const player = playerRef.current;
    const q = queueRef.current;
    const i = indexRef.current;
    if (!q.length) return;
    // Standard behaviour: restart the track if we're past 4 seconds.
    if (player && readyRef.current && player.getCurrentTime() > 4) {
      try {
        player.seekTo(0, true);
        return;
      } catch {
        /* fall through */
      }
    }
    const prevIndex = i - 1 < 0 ? q.length - 1 : i - 1;
    setQueueIndex(prevIndex);
    load(q[prevIndex], true);
  }, [load]);

  const seekTo = useCallback((seconds: number) => {
    const player = playerRef.current;
    if (!player || !readyRef.current) return;
    try {
      player.seekTo(seconds, true);
      setCurrentTime(seconds);
    } catch {
      /* ignore */
    }
  }, []);

  const seekRatio = useCallback(
    (ratio: number) => {
      if (!duration) return;
      seekTo(Math.min(Math.max(ratio, 0), 1) * duration);
    },
    [duration, seekTo]
  );

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(v)));
    setVolumeState(clamped);
    writeJSON(STORAGE_KEYS.volume, clamped);
    const player = playerRef.current;
    try {
      player?.setVolume(clamped);
      if (clamped === 0) {
        player?.mute();
        setMuted(true);
      } else if (player?.isMuted()) {
        player.unMute();
        setMuted(false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player || !readyRef.current) return;
    try {
      if (player.isMuted()) {
        player.unMute();
        setMuted(false);
      } else {
        player.mute();
        setMuted(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => {
      const next = !prev;
      if (next) {
        const q = queueRef.current;
        const i = indexRef.current;
        if (q.length > 1 && i >= 0) {
          const reordered = shuffled(q, i);
          setQueue(reordered);
          queueRef.current = reordered;
          setQueueIndex(0);
          indexRef.current = 0;
        }
      }
      return next;
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeat((prev) => (prev === "off" ? "all" : prev === "all" ? "one" : "off"));
  }, []);

  const addToQueue = useCallback(
    (song: Song) => {
      setQueue((prev) => {
        if (prev.some((s) => s.youtubeId === song.youtubeId)) return prev;
        const next = [...prev, song];
        queueRef.current = next;
        if (indexRef.current < 0) {
          setQueueIndex(0);
          indexRef.current = 0;
          load(song, false);
        }
        return next;
      });
      notify(`Added to queue — ${shortTitle(song.title, 40)}`);
    },
    [load, notify]
  );

  const playNextInQueue = useCallback(
    (song: Song) => {
      setQueue((prev) => {
        const filtered = prev.filter((s) => s.youtubeId !== song.youtubeId);
        const at = Math.max(indexRef.current, 0) + 1;
        const next = [...filtered.slice(0, at), song, ...filtered.slice(at)];
        queueRef.current = next;
        return next;
      });
      notify("Playing next");
    },
    [notify]
  );

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => {
      const next = prev.filter((_, i) => i !== index);
      queueRef.current = next;
      if (index < indexRef.current) {
        const ni = indexRef.current - 1;
        setQueueIndex(ni);
        indexRef.current = ni;
      } else if (index === indexRef.current) {
        const ni = Math.min(indexRef.current, next.length - 1);
        setQueueIndex(ni);
        indexRef.current = ni;
      }
      return next;
    });
  }, []);

  const moveInQueue = useCallback((from: number, to: number) => {
    setQueue((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      queueRef.current = next;
      const cur = indexRef.current;
      let ni = cur;
      if (cur === from) ni = to;
      else if (from < cur && to >= cur) ni = cur - 1;
      else if (from > cur && to <= cur) ni = cur + 1;
      setQueueIndex(ni);
      indexRef.current = ni;
      return next;
    });
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
        writeJSON(STORAGE_KEYS.favourites, next);
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
    userInteractedRef.current = true;
    const song = resumeTarget.song;
    const nextQueue = queueRef.current.some((s) => s.youtubeId === song.youtubeId)
      ? queueRef.current
      : [song, ...queueRef.current];
    const index = nextQueue.findIndex((s) => s.youtubeId === song.youtubeId);
    setQueue(nextQueue);
    queueRef.current = nextQueue;
    setQueueIndex(index);
    indexRef.current = index;
    load(song, true, resumeTarget.position);
  }, [load, resumeTarget]);

  /* --------------------------- Keyboard shortcuts ----------------------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight" && e.shiftKey) {
        e.preventDefault();
        goNext(false);
      } else if (e.code === "ArrowLeft" && e.shiftKey) {
        e.preventDefault();
        previous();
      } else if (e.code === "KeyM") {
        toggleMute();
      } else if (e.code === "Escape") {
        setFullPlayerOpen(false);
        setQueuePanelOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, previous, togglePlay, toggleMute]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      current,
      queue,
      queueIndex,
      status,
      isPlaying,
      currentTime,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      error,
      fullPlayerOpen,
      queuePanelOpen,
      recentlyPlayed,
      favourites,
      resumeTarget,
      playSong,
      playQueue,
      togglePlay,
      next: () => goNext(false),
      previous,
      seekTo,
      seekRatio,
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
      registerHost,
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
      volume,
      muted,
      shuffle,
      repeat,
      error,
      fullPlayerOpen,
      queuePanelOpen,
      recentlyPlayed,
      favourites,
      resumeTarget,
      playSong,
      playQueue,
      togglePlay,
      goNext,
      previous,
      seekTo,
      seekRatio,
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
      registerHost,
      notify,
      toastMessage,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
