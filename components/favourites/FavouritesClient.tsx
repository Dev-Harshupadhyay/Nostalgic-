"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import GlowButton from "@/components/ui/GlowButton";
import SongCard from "@/components/music/SongCard";
import { usePlayer } from "@/components/player/PlayerProvider";
import { shortTitle } from "@/lib/format";
import { Play, Pause, Heart, Plus, Close } from "@/components/ui/Icons";
import { useI18n } from "@/components/i18n/LocaleProvider";

type View = "grid" | "list";

/**
 * Favourites = the user's own playlist.
 *
 * Every heart tap is persisted to localStorage by PlayerProvider
 * (key: "nostalgic:favourites"), so the list survives reloads without any
 * account or server. Playing from here loads the whole favourites list as the
 * queue, so songs continue one after another automatically.
 */
export default function FavouritesClient() {
  const {
    favourites,
    playQueue,
    current,
    isPlaying,
    togglePlay,
    addToQueue,
    toggleFavourite,
  } = usePlayer();

  const { t } = useI18n();
  const [view, setView] = useState<View>("grid");

  const totalLabel = useMemo(
    () => `${favourites.length} ${favourites.length === 1 ? t.common.song : t.common.songs}`,
    [favourites.length, t]
  );

  const playAll = () => favourites.length && playQueue(favourites, 0);

  const shuffleAll = () => {
    if (!favourites.length) return;
    const list = [...favourites];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    playQueue(list, 0);
  };

  const queueAll = () => favourites.forEach((s) => addToQueue(s));

  /* ---------------------------- Empty state ---------------------------- */
  if (favourites.length === 0) {
    return (
      <div className="fav-empty fade-up">
        <div aria-hidden className="fav-empty-heart">
          <Heart size={40} />
        </div>
        <h2 className="eg-title mt-4 text-xl font-extrabold sm:text-2xl">
          {t.favourites.emptyTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/55">
{t.favourites.emptyText}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/evergreen" className="btn btn-glow px-5 py-2.5 text-sm">
            ✨ Evergreen dekho
          </Link>
          <Link href="/old-songs" className="btn btn-ghost px-5 py-2.5 text-sm">
            🎵 Old Songs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ------------------------------ Hero ------------------------------ */}
      <section className="fav-hero fade-up">
        <div aria-hidden className="fav-hero-aura" />

        <div className="fav-stack" aria-hidden>
          {favourites.slice(0, 3).map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.youtubeId}
              src={s.thumbnail}
              alt=""
              className="fav-stack-img"
              style={{ ["--i" as string]: i }}
            />
          ))}
          <span className="fav-stack-heart">❤️</span>
        </div>

        <div className="relative min-w-0">
          <p className="eyebrow">{t.favourites.eyebrow}</p>
          <h1 className="eg-title mt-1.5 text-[1.9rem] font-extrabold tracking-tight sm:text-[2.6rem]">
            {t.favourites.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/58">
{t.favourites.lead.replace("{count}", totalLabel)}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <GlowButton size="lg" aura onClick={playAll} aria-label="Play all favourites">
              <Play size={16} /> {t.common.playAll}
            </GlowButton>
            <button type="button" onClick={shuffleAll} className="btn btn-ghost px-4 py-2.5 text-sm">
              🔀 {t.common.shuffle}
            </button>
            <button type="button" onClick={queueAll} className="btn btn-ghost px-4 py-2.5 text-sm">
              <Plus size={14} /> {t.favourites.queueAll}
            </button>
            <span className="eg-chip">{totalLabel}</span>
          </div>
        </div>
      </section>

      {/* ---------------------------- View switch ---------------------------- */}
      <div className="mt-8 flex items-center justify-between gap-3 px-1">
        <h2 className="text-[1.05rem] font-bold tracking-tight">{t.favourites.saved}</h2>
        <div className="fav-switch" role="group" aria-label="Layout">
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-pressed={view === "grid"}
            className={view === "grid" ? "is-on" : ""}
          >
            {t.favourites.grid}
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            className={view === "list" ? "is-on" : ""}
          >
            {t.favourites.list}
          </button>
        </div>
      </div>

      {/* ------------------------------ Songs ------------------------------ */}
      {view === "grid" ? (
        <div className="fav-grid mt-4">
          {favourites.map((song, i) => (
            <div
              key={song.youtubeId}
              className="stagger-in"
              style={{ animationDelay: `${Math.min(i, 14) * 45}ms` }}
            >
              <SongCard song={song} contextQueue={favourites} priority={i < 6} />
            </div>
          ))}
        </div>
      ) : (
        <ol className="mt-4 space-y-1.5">
          {favourites.map((song, i) => {
            const active = current?.youtubeId === song.youtubeId;
            const playingThis = active && isPlaying;
            return (
              <li
                key={song.youtubeId}
                className="stagger-in"
                style={{ animationDelay: `${Math.min(i, 14) * 40}ms` }}
              >
                <div className={`fav-row ${active ? "is-active" : ""}`}>
                  <span className="fav-row-n tabular-nums">{i + 1}</span>

                  <button
                    type="button"
                    onClick={() => (active ? togglePlay() : playQueue(favourites, i))}
                    className="fav-row-main"
                    aria-label={playingThis ? `Pause ${song.title}` : `Play ${song.title}`}
                  >
                    <span className="fav-row-art">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={song.thumbnail} alt="" loading="lazy" />
                      <span className="fav-row-play">
                        {playingThis ? <Pause size={15} /> : <Play size={15} />}
                      </span>
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="fav-row-title line-1">{shortTitle(song.title, 62)}</span>
                      <span className="fav-row-sub line-1">
                        {song.artist || "YouTube"}
                        {song.duration ? ` · ${song.duration}` : ""}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addToQueue(song)}
                    aria-label={`Add ${shortTitle(song.title, 30)} to queue`}
                    className="fav-row-ic"
                  >
                    <Plus size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFavourite(song)}
                    aria-label={`Remove ${shortTitle(song.title, 30)} from favourites`}
                    className="fav-row-ic is-danger"
                  >
                    <Close size={15} />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
