/** Shared, dependency-free formatting helpers. */

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/**
 * Truncate by code point, never in the middle of a surrogate pair.
 *
 * YouTube titles are full of astral-plane characters (𝐁𝐎𝐋𝐃 text, emoji).
 * A plain String.prototype.slice can cut a surrogate pair in half, which
 * produces a lone surrogate — the server serializes it one way and the browser
 * parses it as U+FFFD, causing a React hydration mismatch. Splitting on code
 * points keeps server and client output byte-identical.
 */
function sliceCodePoints(input: string, max: number): string {
  const chars = Array.from(input);
  if (chars.length <= max) return input;
  return `${chars.slice(0, Math.max(max - 1, 0)).join("").trimEnd()}…`;
}

/**
 * YouTube titles are long and noisy; make them readable without losing meaning.
 * NFKC folds decorative unicode (𝐀𝐋𝐋 → ALL, ｆｕｌｌｗｉｄｔｈ → fullwidth) into
 * plain characters so titles stay legible and searchable.
 */
export function cleanTitle(title: string): string {
  let out = title;
  try {
    out = out.normalize("NFKC");
  } catch {
    /* normalize is universally supported, but never let it break rendering */
  }
  return out
    .replace(
      /\s*[\(\[]\s*(official\s*)?(full\s*)?(hd\s*)?(4k\s*)?(video|audio|song|lyrical|lyrics)[^)\]]*[\)\]]/gi,
      ""
    )
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s*\|\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function shortTitle(title: string, max = 60): string {
  const cleaned = cleanTitle(title);
  const primary = cleaned.split("|")[0].trim() || cleaned;
  return sliceCodePoints(primary, max);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
