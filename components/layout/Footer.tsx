import Link from "next/link";
import { DEV } from "@/lib/site";
import { ExternalLink } from "@/components/ui/Icons";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/old-songs", label: "Old Songs" },
  { href: "/singles", label: "Singles" },
  { href: "/trending", label: "Trending" },
  { href: "/chhath", label: "Chhath" },
  { href: "/bhojpuri", label: "Bhojpuri" },
];

const EXTERNAL_LINKS = [
  { href: DEV.portfolio, label: "Portfolio" },
  { href: DEV.timepass, label: "Timepass Premium" },
];

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-white/8 bg-black/28">
      <div className="mx-auto max-w-[1400px] px-4 py-9 sm:px-6">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-base font-extrabold">
              Made with <span aria-hidden className="text-[color:var(--color-rose)]">❤️</span> by{" "}
              <a
                href={DEV.portfolio}
                target="_blank"
                rel="noopener noreferrer external"
                className="warm-text underline decoration-[color:var(--color-amber)]/35 underline-offset-4 transition hover:decoration-[color:var(--color-amber)]"
              >
                Harsh
              </a>
            </p>
            <p className="mt-1.5 text-xs text-white/42">
              © 2026 {DEV.fullName} · Music Player
            </p>
            <p className="mt-3 text-xs leading-relaxed text-white/35">
              All music is streamed from YouTube through the official embedded player. Nothing is
              downloaded or re-hosted here.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-8 gap-y-6">
            <div>
              <h2 className="eyebrow mb-2.5">Browse</h2>
              <ul className="space-y-1.5">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[0.82rem] text-white/58 transition hover:text-[color:var(--color-amber)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="eyebrow mb-2.5">Developer</h2>
              <ul className="space-y-1.5">
                {EXTERNAL_LINKS.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer external"
                      className="inline-flex items-center gap-1.5 text-[0.82rem] text-white/58 transition hover:text-[color:var(--color-amber)]"
                    >
                      {l.label}
                      <ExternalLink size={12} />
                    </a>
                  </li>
                ))}
                <li>
                  <Link
                    href="/developer"
                    className="text-[0.82rem] text-white/58 transition hover:text-[color:var(--color-amber)]"
                  >
                    About Developer
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="text-[0.82rem] font-semibold text-[color:var(--color-amber)] transition hover:text-white"
                  >
                    Support Developer ❤️
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
}
