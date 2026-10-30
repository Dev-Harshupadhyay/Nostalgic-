import Link from "next/link";
import Hero from "@/components/home/Hero";
import MusicWorlds from "@/components/home/MusicWorlds";
import Introduction from "@/components/home/Introduction";
import SongShelf from "@/components/music/SongShelf";
import SupportSpotlight from "@/components/support/SupportSpotlight";
import { RecentlyPlayed, ContinueListening } from "@/components/home/RecentlyPlayed";
import { catalog } from "@/lib/catalog";

const QUICK_LINKS = [
  { href: "/favourites", title: "Favourites", sub: "Your saved songs", emoji: "♥" },
  { href: "/playlist", title: "My Playlist", sub: "Public YouTube lists", emoji: "▤" },
  { href: "/trending", title: "New & Trending", sub: "Fresh discoveries", emoji: "↗" },
  { href: "/search", title: "Search", sub: "Find a song", emoji: "⌕" },
];

const DISCOVERY_CHIPS = [
  { href: "/old-songs", label: "Golden Era" },
  { href: "/old-songs", label: "Retro Hindi" },
  { href: "/evergreen", label: "Evergreen" },
  { href: "/chhath", label: "Chhath Bhakti" },
  { href: "/bhojpuri", label: "Bhojpuri" },
  { href: "/trending", label: "New & Trending" },
];

export default function HomePage() {
  // Keep the first play action within one category instead of mixing unrelated worlds.
  const starter = catalog.oldSongs.slice(0, 14);

  return (
    <>
      <Hero starterQueue={starter} />

      <nav className="home-discovery-row mx-auto max-w-[1400px]" aria-label="Explore music categories">
        <span className="home-discovery-label">QUICK DISCOVERY</span>
        {DISCOVERY_CHIPS.map((chip, i) => (
          <Link key={`${chip.href}-${chip.label}`} href={chip.href} className={`home-discovery-chip ${i === 5 ? "is-featured" : ""}`}>
            {chip.label}
          </Link>
        ))}
        <Link href="/search" className="home-discovery-browse">Browse all <span aria-hidden>→</span></Link>
      </nav>

      <div className="mx-auto max-w-[1400px] space-y-9 px-4 pb-6 sm:px-6">
        <MusicWorlds />

        <SongShelf
          title="New & Trending"
          subtitle="Fresh discoveries from YouTube"
          songs={catalog.trending.slice(0, 18)}
          discover={{ group: "trending", category: "Trending Now" }}
        />
        <SongShelf
          title="Old Songs · Golden Memories"
          subtitle="Era-led classics, kept separate from the Evergreen collection"
          songs={catalog.oldSongs.filter((song) => song.category.toLowerCase() !== "evergreen").slice(0, 18)}
        />
        <SongShelf
          title="Evergreen · Sada-bahar"
          subtitle="Timeless picks across moods and eras"
          songs={catalog.evergreen.slice(0, 18)}
        />
        <SongShelf
          title="Chhath Bhakti"
          subtitle="Dedicated Chhath geet and devotional collections"
          songs={catalog.chhathPuja.slice(0, 18)}
        />

        <ContinueListening />
        <RecentlyPlayed />

        <section aria-labelledby="quick-links-heading" className="quick-links-section">
          <div className="quick-links-heading">
            <div>
              <p className="eyebrow">Your space</p>
              <h2 id="quick-links-heading">Pick up where you left off.</h2>
            </div>
            <span>Shortcuts stay simple; music worlds stay separate.</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {QUICK_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="quick-link-card">
                <span className="quick-link-icon" aria-hidden>{item.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="line-1 block text-sm font-bold text-white/90">{item.title}</span>
                  <span className="line-1 mt-0.5 block text-[0.68rem] text-white/45">{item.sub}</span>
                </span>
                <span className="quick-link-arrow" aria-hidden>↗</span>
              </Link>
            ))}
          </div>
        </section>

        <Introduction />
        <SongShelf
          title="Bhojpuri Hits"
          subtitle="Folk roots, modern sounds and regional favourites"
          songs={catalog.bhojpuri.slice(0, 18)}
        />
        <SongShelf title="Singles" subtitle="One song, one mood" songs={catalog.singleSongs.slice(0, 18)} compact />
        <SupportSpotlight />
      </div>
    </>
  );
}
