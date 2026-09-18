/** Merge legacy data/tracks.json picks into seed-catalog.json,
 *  verifying each title/artist live via YouTube oEmbed (no invented data). */
import fs from "node:fs";

const legacy = JSON.parse(fs.readFileSync("data/tracks.json", "utf8"));
const catalog = JSON.parse(fs.readFileSync("data/seed-catalog.json", "utf8"));
const seen = new Set(Object.values(catalog).flat().map((s) => s.youtubeId));

async function oembed(id) {
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${id}&format=json`
    );
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

const jobs = [];
for (const pl of legacy.playlists ?? [])
  for (const t of pl.tracks ?? []) jobs.push({ id: t.videoId, group: "oldSongs", category: "Evergreen" });
for (const t of legacy.singles ?? []) jobs.push({ id: t.videoId, group: "singleSongs", category: "Singles" });
for (const t of legacy.bhakti ?? []) jobs.push({ id: t.videoId, group: "bhojpuri", category: "Bhojpuri Bhakti" });
for (const t of legacy.bhojpuri ?? []) jobs.push({ id: t.videoId, group: "bhojpuri", category: "Bhojpuri Hits" });

let added = 0, dead = 0;
for (const j of jobs) {
  if (seen.has(j.id)) continue;
  const meta = await oembed(j.id);
  if (!meta) { dead++; console.log("unavailable, skipped:", j.id); continue; }
  seen.add(j.id);
  added++;
  catalog[j.group].push({
    id: `${j.group}-${j.id}`,
    youtubeId: j.id,
    title: meta.title,
    artist: meta.author_name ?? "",
    thumbnail: `https://i.ytimg.com/vi/${j.id}/hqdefault.jpg`,
    category: j.category,
    language: j.group === "bhojpuri" ? "Bhojpuri" : "Hindi",
    source: "youtube",
  });
  await new Promise((r) => setTimeout(r, 200));
}
fs.writeFileSync("data/seed-catalog.json", JSON.stringify(catalog, null, 2));
console.log("added", added, "skipped(unavailable)", dead);
console.log(Object.entries(catalog).map(([k, v]) => `${k}:${v.length}`).join(" "));
