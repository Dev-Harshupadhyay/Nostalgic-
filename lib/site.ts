/** Public, non-secret site + creator configuration. */

export const SITE = {
  name: "Nostalgic Music Player",
  tagline: "Old Songs, Trending, Chhath & Bhojpuri",
  title: "Nostalgic Music Player — Old Songs, Trending, Chhath & Bhojpuri",
  description:
    "Nostalgic Music Player by Harsh Dev — listen to old Hindi classics, new and trending tracks, Chhath Puja geet and Bhojpuri favourites, streamed through YouTube.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nostalgic-music.vercel.app",
  locale: "en_IN",
};

export const DEV = {
  name: "Harsh",
  fullName: "Harsh Dev",
  role: "Creator / Developer / Builder",
  focus: "Web Development, UI/UX, Music Projects",
  currentProject: "Nostalgic Music Player",
  about: "Creator & developer behind this music experience.",
  portfolio: "https://new-profotilo-flame.vercel.app/",
  timepass: "https://timepass-premium.vercel.app/",
};

/** UPI details used to build a standard UPI deep link. No payment is ever
 *  confirmed in-app — only the user's UPI app can complete a transaction. */
export const SUPPORT = {
  upiId: "pmharsh@fam",
  payeeName: "Harsh Dev",
  currency: "INR",
  defaultAmount: 25,
  presets: [25, 50, 100],
  note: "Support Dev Harsh",
};

export function buildUpiLink(amount: number): string {
  const params = new URLSearchParams({
    pa: SUPPORT.upiId,
    pn: SUPPORT.payeeName,
    am: amount.toFixed(2),
    cu: SUPPORT.currency,
    tn: SUPPORT.note,
  });
  return `upi://pay?${params.toString()}`;
}

export const PROJECTS = [
  {
    name: "Nostalgic Music Player",
    description: "This music experience — old classics, Chhath, Bhojpuri and trending, powered by YouTube.",
    href: "/",
    external: false,
    tag: "Current project",
  },
  {
    name: "Timepass Premium",
    description: "Another project by Harsh Dev.",
    href: DEV.timepass,
    external: true,
    tag: "Live",
  },
  {
    name: "Harsh Dev — Portfolio",
    description: "Official portfolio of Harsh Dev.",
    href: DEV.portfolio,
    external: true,
    tag: "Portfolio",
  },
] as const;
