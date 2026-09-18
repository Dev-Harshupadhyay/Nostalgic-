import Link from "next/link";
import { Sparkle } from "@/components/ui/Icons";

const FEATURES = [
  {
    emoji: "🎧",
    title: "Audio-first playback",
    body: "Songs stream as audio through YouTube's official player. A spinning record shows what's playing — no video window, no distractions.",
  },
  {
    emoji: "🕰️",
    title: "Five moods, one place",
    body: "Old Songs for the memories, Singles for a single mood, Trending for what's new, Chhath for tradition and Bhojpuri for desi vibes.",
  },
  {
    emoji: "📻",
    title: "A real player",
    body: "Live timer, drag-to-seek timeline, queue, shuffle, repeat, volume and favourites — everything stays in sync with the actual playback.",
  },
  {
    emoji: "🔎",
    title: "Search the real thing",
    body: "Every result comes from an actual YouTube search — real titles, real channels, real durations. Nothing is made up.",
  },
];

/** Short "what is this site" block shown on the home page, below the hero. */
export default function Introduction() {
  return (
    <section aria-labelledby="intro-heading" className="px-1">
      <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(232,163,61,0.22),transparent_70%)] blur-3xl"
        />

        <p className="eyebrow flex items-center gap-2">
          <Sparkle size={13} className="text-[color:var(--color-amber)]" />
          Welcome
        </p>

        <h2 id="intro-heading" className="mt-2 text-xl font-extrabold sm:text-2xl">
          What is <span className="warm-text">Nostalgic Music Player</span>?
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/62">
          A free music player built around the songs Indian households grew up with. Pick a
          decade, a festival or a language and press play — the tracks stream straight from
          YouTube, so there is nothing to download and nothing to sign up for.
        </p>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <li key={f.title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-white/90">
                <span aria-hidden className="text-base">
                  {f.emoji}
                </span>
                {f.title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-white/52">{f.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link href="/old-songs" className="btn btn-ghost px-4 py-2 text-[0.82rem]">
            🎵 Browse Old Songs
          </Link>
          <Link href="/chhath" className="btn btn-ghost px-4 py-2 text-[0.82rem]">
            🪔 Chhath Puja
          </Link>
          <Link href="/search" className="btn btn-ghost px-4 py-2 text-[0.82rem]">
            🔎 Search a song
          </Link>
        </div>
      </div>
    </section>
  );
}
