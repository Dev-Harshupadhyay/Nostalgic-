"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Clean abstraction over the YouTube IFrame Player API.
 *
 * Design notes
 * ------------
 * - Exactly ONE iframe is created for the whole app lifetime. It lives in a
 *   hidden 1x1 container appended to <body>, because this player is audio-only:
 *   the video surface is never shown, a spinning vinyl represents the track.
 * - Handlers are kept in refs, so the YouTube listeners are registered once and
 *   never duplicated, no matter how often the consumer re-renders.
 * - Everything is torn down on unmount: listeners, the player instance and the
 *   container node.
 */

export type YTState = "unstarted" | "ended" | "playing" | "paused" | "buffering" | "cued";

type YTPlayerInstance = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  loadVideoById: (opts: { videoId: string; startSeconds?: number }) => void;
  cueVideoById: (opts: { videoId: string; startSeconds?: number }) => void;
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
      Player: new (el: HTMLElement | string, opts: Record<string, unknown>) => YTPlayerInstance;
      PlayerState: Record<string, number>;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export type YouTubePlayerApi = {
  /** True once the iframe player has finished initialising. */
  ready: boolean;
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  loadVideo: (videoId: string, opts?: { autoplay?: boolean; startAt?: number }) => void;
};

type Handlers = {
  onReady?: () => void;
  onStateChange?: (state: YTState) => void;
  onEnded?: () => void;
  onError?: (code: number) => void;
  onApiFailure?: (message: string) => void;
};

/* --------------------------- API script loading --------------------------- */

let apiPromise: Promise<void> | null = null;

function loadIframeApi(): Promise<void> {
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

function mapState(code: number): YTState {
  switch (code) {
    case 1:
      return "playing";
    case 2:
      return "paused";
    case 3:
      return "buffering";
    case 5:
      return "cued";
    case 0:
      return "ended";
    default:
      return "unstarted";
  }
}

/* --------------------------------- Hook ---------------------------------- */

export function useYouTubePlayer(handlers: Handlers, initialVolume = 80): YouTubePlayerApi {
  const [ready, setReady] = useState(false);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const readyRef = useRef(false);
  const volumeRef = useRef(initialVolume);

  /* Handlers in a ref: listeners are attached once, callers stay free to pass
     fresh closures on every render without re-registering anything. */
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  /* A load requested before the player finished booting. */
  const pendingRef = useRef<{ videoId: string; autoplay: boolean; startAt?: number } | null>(null);

  const flushPending = useCallback(() => {
    const pending = pendingRef.current;
    const player = playerRef.current;
    if (!pending || !player || !readyRef.current) return;
    pendingRef.current = null;
    try {
      const opts = { videoId: pending.videoId, startSeconds: pending.startAt };
      if (pending.autoplay) player.loadVideoById(opts);
      else player.cueVideoById(opts);
    } catch {
      handlersRef.current.onError?.(-1);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Audio-only: the iframe is required for playback but is never shown.
    const host = document.createElement("div");
    host.id = "nostalgic-yt-host";
    host.setAttribute("aria-hidden", "true");
    Object.assign(host.style, {
      position: "fixed",
      left: "-9999px",
      top: "0",
      width: "1px",
      height: "1px",
      overflow: "hidden",
      pointerEvents: "none",
      opacity: "0",
    } satisfies Partial<CSSStyleDeclaration>);

    const mount = document.createElement("div");
    mount.id = "nostalgic-yt-frame";
    host.appendChild(mount);
    document.body.appendChild(host);

    loadIframeApi()
      .then(() => {
        if (cancelled || !window.YT) return;
        playerRef.current = new window.YT.Player(mount, {
          width: "1",
          height: "1",
          playerVars: {
            playsinline: 1,
            rel: 0,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            iv_load_policy: 3,
            origin: window.location.origin,
          },
          events: {
            onReady: (e: { target: YTPlayerInstance }) => {
              if (cancelled) return;
              readyRef.current = true;
              setReady(true);
              try {
                e.target.setVolume(volumeRef.current);
              } catch {
                /* non-fatal */
              }
              handlersRef.current.onReady?.();
              flushPending();
            },
            onStateChange: (e: { data: number }) => {
              const state = mapState(e.data);
              handlersRef.current.onStateChange?.(state);
              if (state === "ended") handlersRef.current.onEnded?.();
            },
            onError: (e: { data: number }) => {
              handlersRef.current.onError?.(e.data);
            },
          },
        });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        handlersRef.current.onApiFailure?.(err.message);
      });

    return () => {
      cancelled = true;
      readyRef.current = false;
      try {
        playerRef.current?.destroy();
      } catch {
        /* the iframe may already be gone */
      }
      playerRef.current = null;
      host.remove();
    };
  }, [flushPending]);

  /* ------------------------------ Public API ----------------------------- */

  const safe = useCallback(<T,>(fn: (p: YTPlayerInstance) => T, fallback: T): T => {
    const player = playerRef.current;
    if (!player || !readyRef.current) return fallback;
    try {
      return fn(player);
    } catch {
      return fallback;
    }
  }, []);

  const play = useCallback(() => safe((p) => p.playVideo(), undefined), [safe]);
  const pause = useCallback(() => safe((p) => p.pauseVideo(), undefined), [safe]);
  const seekTo = useCallback(
    (seconds: number) => safe((p) => p.seekTo(Math.max(0, seconds), true), undefined),
    [safe]
  );
  const setVolume = useCallback(
    (volume: number) => {
      volumeRef.current = volume;
      safe((p) => p.setVolume(volume), undefined);
    },
    [safe]
  );
  const mute = useCallback(() => safe((p) => p.mute(), undefined), [safe]);
  const unMute = useCallback(() => safe((p) => p.unMute(), undefined), [safe]);
  const isMuted = useCallback(() => safe((p) => p.isMuted(), false), [safe]);
  const getCurrentTime = useCallback(() => safe((p) => p.getCurrentTime() ?? 0, 0), [safe]);
  const getDuration = useCallback(() => safe((p) => p.getDuration() ?? 0, 0), [safe]);
  const getPlayerState = useCallback(() => safe((p) => p.getPlayerState(), -1), [safe]);

  const loadVideo = useCallback(
    (videoId: string, opts?: { autoplay?: boolean; startAt?: number }) => {
      pendingRef.current = {
        videoId,
        autoplay: opts?.autoplay ?? true,
        startAt: opts?.startAt,
      };
      flushPending();
    },
    [flushPending]
  );

  return {
    ready,
    play,
    pause,
    seekTo,
    setVolume,
    mute,
    unMute,
    isMuted,
    getCurrentTime,
    getDuration,
    getPlayerState,
    loadVideo,
  };
}
