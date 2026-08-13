"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { track as vercelTrack } from "@vercel/analytics";

/* ============================== Types ============================== */

type Track = {
  id: string;
  videoId?: string;
  title?: string;
  artist?: string;
  film?: string;
  year?: number;
  duration?: number;
};

type Playlist = { id: string; name: string; tracks: Track[] };

type TabId = "playlists" | "singles" | "bhakti" | "bhojpuri";

type TabBg = { url: string; tint: string };

type TracksData = {
  playlists: Playlist[];
  singles: Track[];
  bhakti: Track[];
  bhojpuri: Track[];
  tabBackgrounds: Record<TabId, TabBg>;
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

/* ============================ Constants ============================ */

const TAB_META: Record<TabId, { label: string; devLabel: string; gold: boolean }> = {
  playlists: { label: "Playlists", devLabel: "पुरानी यादें", gold: false },
  singles: { label: "Single Songs", devLabel: "पुरानी यादें", gold: false },
  bhakti: { label: "Bhakti Song", devLabel: "भक्ति गीत", gold: true },
  bhojpuri: { label: "Bhojpuri Song", devLabel: "भोजपुरी गीत", gold: true },
};

const TAB_ORDER: TabId[] = ["playlists", "singles", "bhakti", "bhojpuri"];
const DESKTOP_MOUNT_ID = "yt-mount-desktop";
const MOBILE_MOUNT_ID = "yt-mount-mobile";

/* ============================= Helpers =============================== */

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getQueue(data: TracksData, tab: TabId, playlistId: string): Track[] {
  if (tab === "playlists") {
    const pl = data.playlists.find((p) => p.id === playlistId) ?? data.playlists[0];
    return pl?.tracks ?? [];
  }
  return data[tab];
}

function loadYouTubeAPI(): Promise<any> {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };
    if (!document.getElementById("yt-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
}

/* ======================= Subcomponents ======================= */

function ClockDisplay() {
  const [time, setTime] = useState("");
  const [tick, setTick] = useState(true);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const update = () => {
      setTime(fmt.format(new Date()));
      setTick((t) => !t);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;
  const [clock, meridiem] = time.split(" ");
  const [h, m] = clock.split(":");

  return (
    <div className="glass rounded-full px-3 py-1.5 text-xs font-medium tabular-nums text-white/90">
      {h}
      <span className={tick ? "blink" : ""}>:</span>
      {m} <span className="text-white/60">{meridiem}</span>
    </div>
  );
}

function CreditLink() {
  return (
    <a
      href="https://new-profotilo-flame.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      className="glass rounded-full px-3 py-1.5 text-xs font-medium text-white/80 transition hover:text-white"
    >
      Made by <span className="font-semibold text-[color:var(--color-accent)]">Harsh</span>
    </a>
  );
}

function TabsRow({
  active,
  onChange,
  data,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
  data: TracksData;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2" id="tabsRow">
      {TAB_ORDER.map((tabId) => {
        const meta = TAB_META[tabId];
        const isActive = active === tabId;
        return (
          <button
            key={tabId}
            type="button"
            data-tab={tabId}
            onClick={() => onChange(tabId)}
            className={`tab-btn ${isActive ? "active" : ""}`}
          >
            {meta.gold ? (
              <span className="tab-thumb">
                <img
                  src={data.tabBackgrounds[tabId]?.url}
                  alt={meta.label}
                  onError={(e) => {
                    e.currentTarget.remove();
                  }}
                />
              </span>
            ) : null}
            <span className={`tab-label ${meta.gold ? "gold-text" : ""}`}>{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SeekBar({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (ratio: number) => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragRatio, setDragRatio] = useState<number | null>(null);

  const ratioFromEvent = (e: React.PointerEvent) => {
    const rail = railRef.current;
    if (!rail) return 0;
    const rect = rail.getBoundingClientRect();
    const r = (e.clientX - rect.left) / rect.width;
    return Math.min(1, Math.max(0, r));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    setDragRatio(ratioFromEvent(e));
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragRatio(ratioFromEvent(e));
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    const r = ratioFromEvent(e);
    setDragging(false);
    setDragRatio(null);
    onSeek(r);
  };

  const shownRatio = dragging && dragRatio !== null ? dragRatio : duration > 0 ? currentTime / duration : 0;

  return (
    <div
      className="seek-hit touch-none relative flex h-6 w-full cursor-pointer items-center"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div ref={railRef} className="seek-rail relative h-[3px] w-full overflow-visible rounded-full">
        <div
          className="seek-fill absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${shownRatio * 100}%` }}
        />
        <div
          className="seek-knob absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow"
          style={{ left: `${shownRatio * 100}%` }}
        />
      </div>
    </div>
  );
}

function TransportControls({
  isPlaying,
  onPrev,
  onToggle,
  onNext,
  size = "md",
}: {
  isPlaying: boolean;
  onPrev: () => void;
  onToggle: () => void;
  onNext: () => void;
  size?: "md" | "lg";
}) {
  const playBtnClass =
    size === "lg"
      ? "flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gradient-to-b from-[color:var(--color-accent)] to-[color:var(--color-accent-dim)] ring-1 ring-white/25 shadow-[0_10px_24px_-6px_var(--color-accent)]"
      : "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[color:var(--color-accent)] to-[color:var(--color-accent-dim)] ring-1 ring-white/25 shadow-[0_8px_18px_-6px_var(--color-accent)]";

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Previous track"
        onClick={onPrev}
        className="flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition hover:text-white active:scale-95"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6L18 6v12z"/></svg>
      </button>
      <button type="button" aria-label={isPlaying ? "Pause" : "Play"} onClick={onToggle} className={playBtnClass}>
        {isPlaying ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>
      <button
        type="button"
        aria-label="Next track"
        onClick={onNext}
        className="flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition hover:text-white active:scale-95"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zM4.5 6L13 12l-8.5 6z"/></svg>
      </button>
    </div>
  );
}

function QueueDrawer({
  open,
  onClose,
  tracks,
  currentIndex,
  onSelect,
  heading,
}: {
  open: boolean;
  onClose: () => void;
  tracks: Track[];
  currentIndex: number;
  onSelect: (i: number) => void;
  heading: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button aria-label="Close queue" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="glass relative z-10 max-h-[70vh] w-full max-w-md overflow-y-auto rounded-t-3xl sm:rounded-3xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-black/20 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-sm font-semibold text-white">{heading}</p>
            <p className="text-xs text-white/60">{tracks.length} songs</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20"
          >
            ✕
          </button>
        </div>
        <ul className="divide-y divide-white/5 px-2 py-2">
          {tracks.map((t, i) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(i);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  i === currentIndex ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <span className="w-5 text-center text-xs tabular-nums text-white/50">
                  {i === currentIndex ? "♪" : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">{t.title || `Track ${i + 1}`}</span>
                  <span className="block truncate text-xs text-white/60">{t.artist || "YouTube Audio"}</span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-white/50">{formatTime(t.duration || 0)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function QueueButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Show playlist queue"
      className="flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3 text-xs font-medium text-white/85 ring-1 ring-white/15 transition hover:bg-white/15 active:scale-95"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z" />
      </svg>
      {count}
    </button>
  );
}

/* ============================ Main component ============================ */

export default function MusicPlayer({ data }: { data: TracksData }) {
  const [activeTab, setActiveTab] = useState<TabId>("playlists");
  const [activePlaylistId, setActivePlaylistId] = useState(data.playlists[0]?.id ?? "");
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queueOpen, setQueueOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const [ytTitle, setYtTitle] = useState("");
  const [ytArtist, setYtArtist] = useState("");

  const ytPlayerRef = useRef<any>(null);
  const progressTimerRef = useRef<number | null>(null);

  const queue = getQueue(data, activeTab, activePlaylistId);
  const currentTrack = queue[trackIndex] ?? queue[0];
  const bg = data.tabBackgrounds[activeTab];

  const updateVideoMeta = (playerInstance: any) => {
    if (playerInstance && typeof playerInstance.getVideoData === "function") {
      const info = playerInstance.getVideoData();
      if (info?.title) setYtTitle(info.title);
      if (info?.author) setYtArtist(info.author);
    }
  };

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    if (isPlaying) {
      progressTimerRef.current = window.setInterval(() => {
        const p = ytPlayerRef.current;
        if (p && typeof p.getCurrentTime === "function") {
          setCurrentTime(p.getCurrentTime());
        }
      }, 500);
    }
    return () => {
      if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    };
  }, [isPlaying]);

  const handleEnded = useCallback(() => {
    setTrackIndex((i) => (i + 1 < queue.length ? i + 1 : 0));
  }, [queue.length]);

  const handleErrorSkip = useCallback(
    (errorCode: number, videoId: string) => {
      vercelTrack("youtube_playback_error", { code: errorCode, videoId });
      setTrackIndex((i) => (i + 1 < queue.length ? i + 1 : 0));
    },
    [queue.length]
  );

  useEffect(() => {
    let cancelled = false;
    const mountId = isDesktop ? DESKTOP_MOUNT_ID : MOBILE_MOUNT_ID;

    loadYouTubeAPI().then((YT) => {
      if (cancelled) return;
      const mountEl = document.getElementById(mountId);
      if (!mountEl) return;

      const savedTime = ytPlayerRef.current?.getCurrentTime?.() ?? 0;
      const wasPlaying = isPlaying;

      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }

      ytPlayerRef.current = new YT.Player(mountId, {
        videoId: currentTrack?.videoId || currentTrack?.id,
        playerVars: {
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (e: any) => {
            setPlayerReady(true);
            setDuration(e.target.getDuration() || currentTrack?.duration || 0);
            updateVideoMeta(e.target);
            if (savedTime > 0) e.target.seekTo(savedTime, true);
            if (wasPlaying) e.target.playVideo();
          },
          onStateChange: (e: any) => {
            const YTState = window.YT.PlayerState;
            if (e.data === YTState.PLAYING) {
              setIsPlaying(true);
              setDuration(e.target.getDuration());
              updateVideoMeta(e.target);
            } else if (e.data === YTState.PAUSED) {
              setIsPlaying(false);
            } else if (e.data === YTState.ENDED) {
              setIsPlaying(false);
              handleEnded();
            }
          },
          onError: (e: any) => {
            handleErrorSkip(e.data, currentTrack?.videoId || currentTrack?.id || "");
          },
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [isDesktop]);

  useEffect(() => {
    const p = ytPlayerRef.current;
    const vidId = currentTrack?.videoId || currentTrack?.id;
    if (!p || !playerReady || !vidId) return;
    setCurrentTime(0);
    setDuration(currentTrack?.duration || 0);
    setYtTitle("");
    setYtArtist("");
    if (isPlaying) {
      p.loadVideoById(vidId);
    } else {
      p.cueVideoById(vidId);
    }
  }, [currentTrack?.id, currentTrack?.videoId]);

  const togglePlay = () => {
    const p = ytPlayerRef.current;
    if (!p) return;
    if (isPlaying) {
      p.pauseVideo();
    } else {
      p.playVideo();
    }
  };

  const goPrev = () => setTrackIndex((i) => (i - 1 >= 0 ? i - 1 : queue.length - 1));
  const goNext = () => setTrackIndex((i) => (i + 1 < queue.length ? i + 1 : 0));

  const handleSeek = (ratio: number) => {
    const p = ytPlayerRef.current;
    if (!p || !duration) return;
    const t = ratio * duration;
    p.seekTo(t, true);
    setCurrentTime(t);
  };

  const changeTab = (tab: TabId) => {
    setActiveTab(tab);
    setTrackIndex(0);
    if (tab === "playlists") setActivePlaylistId(data.playlists[0]?.id ?? "");
  };

  const changePlaylist = (id: string) => {
    setActivePlaylistId(id);
    setTrackIndex(0);
  };

  const heading = TAB_META[activeTab].devLabel;
  const headingGold = TAB_META[activeTab].gold;

  const displayTitle = ytTitle || currentTrack?.title || "Loading...";
  const displayArtist = ytArtist || currentTrack?.artist || "YouTube";

  return (
    <>
      <div
        className="hero-bg"
        style={
          {
            "--bg-url": `url(${bg?.url})`,
            "--bg-tint": bg?.tint,
          } as React.CSSProperties
        }
      />
      <div className="hero-overlay -z-20" />
      <div className="grain-overlay -z-10" />

      <div className="safe-t safe-l fixed z-30">
        <ClockDisplay />
      </div>
      <div className="safe-t safe-r fixed z-30">
        <CreditLink />
      </div>

      <section className="hero relative z-20 mt-24 flex w-full flex-col items-center gap-4 px-4 text-center sm:mt-20">
        <h1
          id="heroTitle"
          className={`font-display text-3xl font-bold tracking-tight sm:text-4xl ${headingGold ? "gold-text" : "text-white"}`}
        >
          {heading}
        </h1>
        <TabsRow active={activeTab} onChange={changeTab} data={data} />

        {activeTab === "playlists" && data.playlists.length > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {data.playlists.map((pl) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => changePlaylist(pl.id)}
                className={`rounded-full px-3 py-1 text-[11px] transition ${
                  pl.id === activePlaylistId
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {pl.name}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <div className="flex-1" />

      {/* ===================== DESKTOP PLAYER ===================== */}
      <div className="safe-b relative z-20 mb-4 hidden w-full max-w-xl px-4 sm:flex">
        <div className="glass flex w-full items-center gap-4 rounded-full p-3 pr-5">
          <div className="relative h-20 w-20 shrink-0 self-start">
            <div
              id={DESKTOP_MOUNT_ID}
              data-playing={isPlaying}
              className="vinyl-spin h-20 w-20 overflow-hidden rounded-full bg-black [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:scale-[1.7]"
            />
            <span className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 ring-2 ring-white/40" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-[15px] font-semibold text-white">{displayTitle}</p>
              <QueueButton count={queue.length} onClick={() => setQueueOpen(true)} />
            </div>
            <p className="truncate text-[12.5px] text-white/70">{displayArtist}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <SeekBar currentTime={currentTime} duration={duration} onSeek={handleSeek} />
            </div>
            <div className="flex justify-between text-[10.5px] tabular-nums text-white/50">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <TransportControls isPlaying={isPlaying} onPrev={goPrev} onToggle={togglePlay} onNext={goNext} />
        </div>
      </div>

      {/* ===================== MOBILE PLAYER ===================== */}
      <div className="safe-b relative z-20 mb-4 flex w-full max-w-xl px-4 sm:hidden">
        <div className="glass w-full rounded-[26px] p-4">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 shrink-0 self-start">
              <div
                id={MOBILE_MOUNT_ID}
                data-playing={isPlaying}
                className="vinyl-spin h-16 w-16 overflow-hidden rounded-full bg-black [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:scale-[1.7]"
              />
              <span className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 ring-2 ring-white/40" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[15px] font-semibold text-white">{displayTitle}</p>
                <QueueButton count={queue.length} onClick={() => setQueueOpen(true)} />
              </div>
              <p className="truncate text-[12.5px] text-white/70">{displayArtist}</p>
            </div>
          </div>

          <div className="mt-3">
            <SeekBar currentTime={currentTime} duration={duration} onSeek={handleSeek} />
          </div>

          <div className="mt-1 flex items-center justify-between">
            <span className="w-16 text-[10.5px] tabular-nums text-white/50">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <TransportControls isPlaying={isPlaying} onPrev={goPrev} onToggle={togglePlay} onNext={goNext} size="lg" />
            <span className="w-16" />
          </div>
        </div>
      </div>

      <QueueDrawer
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        tracks={queue}
        currentIndex={trackIndex}
        onSelect={setTrackIndex}
        heading={heading}
      />
    </>
  );
}
