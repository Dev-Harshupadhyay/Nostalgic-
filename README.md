# 🎧 Nostalgic Music Player

**Your memories, one song at a time.**

A premium nostalgic Indian music platform — old Hindi classics, singles, new & trending,
Chhath Puja geet and Bhojpuri favourites, all streamed through the official YouTube player.

Built with ❤️ by [Harsh](https://new-profotilo-flame.vercel.app/).

---

## Features

| Area | What it does |
| --- | --- |
| 🏠 **Home** | Hero, featured shortcuts, Recently Played, Continue Listening, curated shelves |
| 🎵 **Old Songs** | 90s Hits · 2000s Hits · Evergreen · Old Bollywood · Romantic Classics · Sad Classics · Retro Hits |
| 💿 **Singles** | Individual song cards, one song at a time |
| 🔥 **New & Trending** | Live YouTube search results (never fabricated rankings) |
| 🪔 **Chhath Puja** | Chhath Geet · Traditional · Popular · Bhajan · Special · Latest |
| 🎤 **Bhojpuri** | Hits · Classics · New · Folk · Bhakti · Popular Artists |
| 🔎 **Search** | Debounced global search with skeleton, empty and error states |
| ❤️ **Support Dev Harsh** | ₹25 default, ₹50 / ₹100 / custom amount, real UPI deep link |
| 🛠️ **Developer Dashboard** | About, projects, portfolio and Timepass Premium links |

### Player

- One YouTube IFrame instance, **mounted once for the app's lifetime** — switching songs,
  opening the full player or navigating between tabs never recreates it, so playback
  never restarts or flashes.
- Mini player (sticky, desktop + mobile), full player, queue panel / bottom sheet.
- Play · pause · seek · volume · mute · shuffle · repeat (off/all/one) · next · previous ·
  favourite · share · auto-next.
- Queue: play, remove, reorder, clear, jump-to.
- Recently played, favourites and a resume point persist in `localStorage`.
- Media Session API for Android lock-screen controls.
- Keyboard shortcuts: `Space` play/pause, `Shift+→/←` next/previous, `M` mute, `Esc` close.

---

## Music data

Everything in [`data/seed-catalog.json`](data/seed-catalog.json) was harvested from **real
YouTube search results** — titles, channel names, durations and thumbnails are exactly what
YouTube returned.

**Nothing is invented.** No fake singers, no fake view counts, no fabricated "trending"
rankings. Where a ranking cannot be verified, results are simply presented as search or
curated results.

Normalized model (`lib/types.ts`):

```ts
type Song = {
  id: string;
  youtubeId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
  category: string;
  language?: string;
  year?: string;
  source: "youtube";
};
```

Regenerate the catalog at any time:

```bash
node scripts/seed-catalog.mjs   # rebuilds data/seed-catalog.json from live YouTube search
```

---

## YouTube integration

```
Search query → /api/youtube/search → YouTube (API key or public) → normalize → Song[] → React UI
```

Two server-side strategies, in order:

1. **Official YouTube Data API v3** — used automatically when `YOUTUBE_API_KEY` is set.
2. **Keyless public search** — parses YouTube's own results page server-side.
3. **Bundled catalog** — last-resort fallback, clearly reported as `source: "catalog"`.

> The API key is read **only** on the server (`lib/youtube.server.ts` is `server-only`) and is
> never prefixed with `NEXT_PUBLIC_`, so it can never reach the browser bundle.

### Endpoints

| Route | Purpose |
| --- | --- |
| `GET /api/youtube/search?q=&max=&category=` | Global search |
| `GET /api/youtube/discover?group=&category=` | Refresh one category with live results |

---

## Support / payments

The support card builds a standard **UPI deep link** (`upi://pay?pa=…&am=…`) so the user's own
GPay / PhonePe / Paytm app opens with the amount pre-filled.

This site **never processes, stores or confirms a payment** — only the user's UPI app or bank
can do that. No success screen is ever faked. The architecture is ready to plug a real gateway
in later if needed.

---

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm start
```

### Environment variables

Copy `.env.example` to `.env.local`:

```bash
YOUTUBE_API_KEY=            # optional — server-side only, never NEXT_PUBLIC_
NEXT_PUBLIC_SITE_URL=       # canonical URL for SEO / sitemap / Open Graph
```

The app works fully without an API key.

---

## Tech

- **Next.js 15** (App Router) · **React 19** · **TypeScript** (strict) · **Tailwind CSS 4**
- Zero UI dependencies — icons, animations and the player are hand-built
- `@vercel/analytics` + `@vercel/speed-insights`

## Design system

Dark cinematic base, film grain, subtle scanlines, warm nostalgic gradients, glassmorphism,
album-art glow, equalizer bars, retro media-player details — all defined in `app/globals.css`.

Component classes live in Tailwind's `components` layer so plain utilities always win.

## Accessibility & performance

- Semantic HTML, one `<h1>` per page, ARIA labels on every control, `aria-live` toasts
- Keyboard navigation, visible focus rings, focus-trapped dialogs, skip-to-content link
- Full `prefers-reduced-motion` support
- Lazy images, debounced search, memoized cards, IntersectionObserver-driven discovery,
  cleaned-up player listeners, no memory leaks
- Verified with no horizontal overflow from **320px → 1920px**

## SEO

Per-route metadata, canonical URLs, Open Graph + Twitter cards, generated OG image,
SVG favicon, `robots.txt`, `sitemap.xml` and JSON-LD (`WebSite`, `Person`, `SearchAction`).

---

## Project structure

```
app/
  api/youtube/{search,discover}/route.ts   server-side YouTube layer
  {old-songs,singles,trending,chhath,bhojpuri,search,support,developer}/page.tsx
  layout.tsx  page.tsx  globals.css  sitemap.ts  robots.ts  opengraph-image.tsx
components/
  player/    PlayerProvider · MiniPlayer · FullPlayer · PlayerControls · ProgressBar · QueuePanel
  music/     SongCard · SongRow · SongShelf · CategorySection
  layout/    Header · Footer · PageHeader · WelcomeToast
  support/   SupportCard
  dev/       DeveloperDashboard
  ui/        GlowButton · Icons
lib/         catalog.ts · youtube.server.ts · types.ts · format.ts · site.ts
data/        seed-catalog.json
scripts/     seed-catalog.mjs · merge-legacy.mjs
```

---

## Developer

**Harsh Dev** — Creator / Developer / Builder
Focus: Web Development, UI/UX, Music Projects

- 🌐 [Harsh Dev — Portfolio](https://new-profotilo-flame.vercel.app/)
- 🎬 [Timepass Premium](https://timepass-premium.vercel.app/) — another project by Harsh Dev

---

Made with ❤️ by Harsh · © 2026 Harsh Dev · Music Player
