import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "@/components/ui/Icons";

const WORLDS = [
  {
    href: "/old-songs",
    id: "old",
    image: "/images/old-songs.jpg",
    eyebrow: "VINYL · RADIO · GOLDEN YEARS",
    title: "Old Songs",
    description: "Era-led nostalgia, sorted by the memories you came for.",
    cta: "Explore the old songs",
  },
  {
    href: "/evergreen",
    id: "evergreen",
    image: "/images/evergreen.jpg",
    eyebrow: "TIMELESS · ALL-ERA CLASSICS",
    title: "Evergreen",
    description: "Sada-bahar melodies that keep finding new listeners.",
    cta: "Find a timeless favourite",
  },
  {
    href: "/chhath",
    id: "chhath",
    image: "/images/chhath-bhakti.jpg",
    eyebrow: "BHAKTI · PARAMPARA · CHHATH GEET",
    title: "Chhath Bhakti",
    description: "A respectful devotional home for Chhath geet and bhajan.",
    cta: "Enter Chhath Bhakti",
  },
] as const;

export default function MusicWorlds() {
  return (
    <section className="music-worlds" aria-labelledby="music-worlds-title">
      <div className="music-worlds-heading">
        <div>
          <p className="eyebrow">Choose your music world</p>
          <h2 id="music-worlds-title">Har category ki apni duniya.</h2>
          <p>Old Songs, Evergreen aur Chhath Bhakti—clear, curated, and easy to explore.</p>
        </div>
        <span className="music-worlds-note">ONE NOSTALGIC PLAYER · DIFFERENT MUSIC MOODS</span>
      </div>

      <div className="music-worlds-grid">
        {WORLDS.map((world) => (
          <Link key={world.id} href={world.href} className={`music-world-card world-${world.id}`}>
            <div className={`music-world-art music-world-art-${world.id}`} aria-hidden="true">
              <Image
                src={world.image}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="music-world-art-image"
              />
            </div>
            <div className="music-world-copy">
              <span className="music-world-eyebrow">{world.eyebrow}</span>
              <h3>{world.title}</h3>
              <p>{world.description}</p>
              <span className="music-world-cta">{world.cta}<ChevronRight size={16} /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
