"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";

/**
 * Client-side bridge to YouTube's official IFrame Player API.
 *
 * The iframe mounts inside the visible player surface supplied by the UI.
 * It is never moved off-screen, reduced to a pixel, or used as an audio-only
 * backend. The host itself stays in React; YouTube owns only its child iframe.
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

let apiPromise: Promise<void> | null = null;

function loadIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("YouTube player took too long to load")), 20000);
    const previous = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      window.clearTimeout(timeout);
      resolve();
    };

    let script = document.getElementById("yt-iframe-api") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "yt-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => {
        window.clearTimeout(timeout);
        script?.remove();
        reject(new Error("Failed to load the YouTube player"));
      };
      document.head.appendChild(script);
    }
  });

  apiPromise.catch(() => {
    apiPromise = null;
  });
  return apiPromise;
}

function mapState(code: number): YTState {
  switch (code) {
    case 1: return "playing";
    case 2: return "paused";
    case 3: return "buffering";
    case 5: return "cued";
    case 0: return "ended";
    default: return "unstarted";
  }
}

export function useYouTubePlayer(
  handlers: Handlers,
  initialVolume = 80,
  hostRef: RefObject<HTMLDivElement | null>,
  enabled: boolean
): YouTubePlayerApi {
  const [ready, setReady] = useState(false);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const readyRef = useRef(false);
  const volumeRef = useRef(initialVolume);
  const handlersRef = useRef(handlers);
  const pendingRef = useRef<{ videoId: string; autoplay: boolean; startAt?: number } | null>(null);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

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
    if (!enabled) {
      pendingRef.current = null;
      readyRef.current = false;
      setReady(false);
      try {
        playerRef.current?.destroy();
      } catch {
        /* already destroyed */
      }
      playerRef.current = null;
      hostRef.current?.replaceChildren();
      return;
    }

    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    // Keep the React-owned host stable; the API replaces only this disposable child.
    host.replaceChildren();
    const mount = document.createElement("div");
    mount.id = `nostalgic-yt-mount-${Math.random().toString(36).slice(2, 9)}`;
    mount.style.width = "100%";
    mount.style.height = "100%";
    host.appendChild(mount);

    loadIframeApi()
      .then(() => {
        if (cancelled || !window.YT?.Player) return;
        playerRef.current = new window.YT.Player(mount, {
          width: "640",
          height: "390",
          playerVars: {
            autoplay: 0,
            controls: 1,
            disablekb: 0,
            enablejsapi: 1,
            fs: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: { target: YTPlayerInstance }) => {
              if (cancelled) return;
              readyRef.current = true;
              setReady(true);
              try {
                event.target.setVolume(volumeRef.current);
              } catch {
                /* volume is optional */
              }
              handlersRef.current.onReady?.();
              flushPending();
            },
            onStateChange: (event: { data: number }) => {
              const state = mapState(event.data);
              handlersRef.current.onStateChange?.(state);
              if (state === "ended") handlersRef.current.onEnded?.();
            },
            onError: (event: { data: number }) => handlersRef.current.onError?.(event.data),
          },
        });
      })
      .catch((err: Error) => {
        if (!cancelled) handlersRef.current.onApiFailure?.(err.message);
      });

    return () => {
      cancelled = true;
      readyRef.current = false;
      try {
        playerRef.current?.destroy();
      } catch {
        /* iframe can already be gone */
      }
      playerRef.current = null;
      host.replaceChildren();
    };
  }, [enabled, flushPending, hostRef]);

  const safe = useCallback(<T,>(fn: (player: YTPlayerInstance) => T, fallback: T): T => {
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
  const setVolume = useCallback((volume: number) => {
    volumeRef.current = Math.max(0, Math.min(100, volume));
    safe((p) => p.setVolume(volumeRef.current), undefined);
  }, [safe]);
  const mute = useCallback(() => safe((p) => p.mute(), undefined), [safe]);
  const unMute = useCallback(() => safe((p) => p.unMute(), undefined), [safe]);
  const isMuted = useCallback(() => safe((p) => p.isMuted(), false), [safe]);
  const getCurrentTime = useCallback(() => safe((p) => p.getCurrentTime() || 0, 0), [safe]);
  const getDuration = useCallback(() => safe((p) => p.getDuration() || 0, 0), [safe]);
  const getPlayerState = useCallback(() => safe((p) => p.getPlayerState(), -1), [safe]);
  const loadVideo = useCallback((videoId: string, opts?: { autoplay?: boolean; startAt?: number }) => {
    pendingRef.current = {
      videoId,
      autoplay: opts?.autoplay ?? true,
      startAt: opts?.startAt,
    };
    flushPending();
  }, [flushPending]);

  return useMemo(() => ({
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
  }), [ready, play, pause, seekTo, setVolume, mute, unMute, isMuted, getCurrentTime, getDuration, getPlayerState, loadVideo]);
}
