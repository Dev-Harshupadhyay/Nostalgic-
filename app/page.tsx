import Link from "next/link";
import Hero from "@/components/home/Hero";
import Introduction from "@/components/home/Introduction";
import SongShelf from "@/components/music/SongShelf";
import SupportCard from "@/components/support/SupportCard";
import { RecentlyPlayed, ContinueListening } from "@/components/home/RecentlyPlayed";
import { catalog } from "@/lib/catalog";
import { ChevronRight } from "@/components/ui/Icons";

const FEATURED = [
  { href: "/old-songs", title: "Old Songs", sub: "Memories", emoji: "🎵" },
  { href: "/singles", title: "Singles", sub: "One song, one mood", emoji: "💿" },
  { href: "/trending", title: "New & Trending", sub: "What's new", emoji: "🔥" },
  { href: "/chhath", title: "Chhath Puja", sub: "Traditional vibes", emoji: "🪔" },
  { href: "/bhojpuri", title: "Bhojpuri", sub: "Desi vibes", emoji: "🎤" },
  { href: "/search", title: "Search", sub: "Find any song", emoji: "🔎" },
];

export default function HomePage() {
  const starter = [
    ...catalog.oldSongs.slice(0, 10),
    ...catalog.singleSongs.slice(0, 6),
    ...catalog.trending.slice(0, 6),
  ];

  return (
    <>
      <Hero starterQueue={starter} />

      <div className="mx-auto max-w-[1400px] space-y-12 px-4 pb-6 sm:px-6">
        {/* Featured playlists / shortcuts */}
        <section aria-labelledby="featured-heading" className="px-1">
          <h2 id="featured-heading" className="mb-3 text-[1.05rem] font-bold sm:text-lg">
            Featured Playlists
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {FEATURED.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="card group flex items-center gap-2.5 p-3"
              >
                <span aria-hidden className="text-xl">
                  {f.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-1 block text-[0.82rem] font-bold text-white/90">
                    {f.title}
                  </span>
                  <span className="line-1 block text-[0.66rem] text-white/42">{f.sub}</span>
                </span>
                <ChevronRight
                  size={15}
                  className="shrink-0 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-[color:var(--color-amber)]"
                />
              </Link>
            ))}
          </div>
        </section>

        <Introduction />

        <ContinueListening />
        <RecentlyPlayed />

        <SongShelf
          title="Old-School Vibes"
          subtitle="Curated classics that never get old"
          songs={catalog.oldSongs.slice(0, 18)}
        />

        <SongShelf
          title="New & Trending"
          subtitle="Live results from YouTube search"
          songs={catalog.trending.slice(0, 18)}
          discover={{ group: "trending", category: "Trending Now" }}
        />

        <SongShelf
          title="Chhath Special"
          subtitle="Chhath Puja geet and bhajan"
          songs={catalog.chhathPuja.slice(0, 18)}
        />

        <SongShelf
          title="Bhojpuri Hits"
          subtitle="Desi vibes, straight from the heartland"
          songs={catalog.bhojpuri.slice(0, 18)}
        />

        <SongShelf
          title="Singles"
          subtitle="One song, one mood"
          songs={catalog.singleSongs.slice(0, 18)}
          compact
        />

        <SupportCard />
      </div>
    </>
  );
}
