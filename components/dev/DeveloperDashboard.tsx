"use client";

import Link from "next/link";
import { DEV, PROJECTS } from "@/lib/site";
import { ExternalLink, Sparkle } from "@/components/ui/Icons";

const FACTS = [
  { label: "Developer", value: DEV.fullName },
  { label: "Role", value: DEV.role },
  { label: "Focus", value: DEV.focus },
  { label: "Current Project", value: DEV.currentProject },
];

export default function DeveloperDashboard() {
  return (
    <section
      aria-labelledby="dev-heading"
      className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(79,179,165,0.22),transparent_70%)] blur-2xl"
      />

      <div className="flex flex-wrap items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#ffd390] via-[#e8a33d] to-[#c9662b] text-2xl font-black text-[#150c05]">
          H
        </span>
        <div className="min-w-0">
          <p className="eyebrow">Developer dashboard</p>
          <h2 id="dev-heading" className="text-xl font-extrabold sm:text-2xl">
            {DEV.fullName}
          </h2>
          <p className="mt-1 text-sm text-white/58">{DEV.about}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {FACTS.map((f) => (
          <div key={f.label} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
            <dt className="text-[0.62rem] uppercase tracking-[0.18em] text-white/38">{f.label}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-white/88">{f.value}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-7 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-white/55">
        <Sparkle size={15} className="text-[color:var(--color-amber)]" />
        Projects
      </h3>

      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {PROJECTS.map((p) => {
          const inner = (
            <>
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-bold text-white/92">{p.name}</h4>
                {p.external ? (
                  <ExternalLink
                    size={15}
                    className="mt-0.5 shrink-0 text-white/40 transition group-hover:text-[color:var(--color-amber)]"
                  />
                ) : null}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-white/52">{p.description}</p>
              <span className="mt-3 inline-block rounded-full bg-[color:var(--color-amber)]/12 px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-[color:var(--color-amber)]">
                {p.tag}
              </span>
            </>
          );

          return (
            <li key={p.name}>
              {p.external ? (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className="card group block h-full p-4"
                >
                  {inner}
                </a>
              ) : (
                <Link href={p.href} className="card group block h-full p-4">
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={DEV.portfolio}
          target="_blank"
          rel="noopener noreferrer external"
          className="btn btn-ghost px-4 py-2 text-sm"
        >
          Harsh Dev — Portfolio
          <ExternalLink size={14} />
        </a>
        <a
          href={DEV.timepass}
          target="_blank"
          rel="noopener noreferrer external"
          className="btn btn-ghost px-4 py-2 text-sm"
        >
          Timepass Premium
          <ExternalLink size={14} />
        </a>
        <Link href="/support" className="btn btn-glow px-4 py-2 text-sm">
          Support Developer ❤️
        </Link>
      </div>
    </section>
  );
}
