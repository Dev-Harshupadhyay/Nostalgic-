/** Public, non-secret site + creator configuration. */

export const SITE = {
  name: "Nostalgic Music Player",
  tagline: "Old Songs, Trending, Chhath & Bhojpuri",
  title: "Nostalgic Music Player — Old Songs, Trending, Chhath & Bhojpuri",
  description:
    "Nostalgic Music Player by Harsh Dev — listen to old Hindi classics, new and trending tracks, Chhath Puja geet and Bhojpuri favourites, streamed through YouTube.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nostalgic-xwa6.onrender.com",
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

function upiQuery(amount: number): string {
  return new URLSearchParams({
    pa: SUPPORT.upiId,
    pn: SUPPORT.payeeName,
    am: amount.toFixed(2),
    cu: SUPPORT.currency,
    tn: SUPPORT.note,
  }).toString();
}

/** Generic UPI intent — the OS shows every installed UPI app. */
export function buildUpiLink(amount: number): string {
  return `upi://pay?${upiQuery(amount)}`;
}

export type UpiApp = "any" | "gpay" | "phonepe" | "paytm";

/**
 * App-specific UPI deep links.
 *
 * Each major UPI app registers its own scheme, so linking to it opens that app
 * directly instead of showing the Android chooser. The payment payload is
 * identical in every case — only the scheme differs. If the app is not
 * installed the link simply does nothing, which is why the UI always keeps the
 * generic "Any UPI app" option and a copyable UPI ID as fallbacks.
 */
export function buildAppUpiLink(app: UpiApp, amount: number): string {
  const q = upiQuery(amount);
  switch (app) {
    case "gpay":
      return `tez://upi/pay?${q}`;
    case "phonepe":
      return `phonepe://pay?${q}`;
    case "paytm":
      return `paytmmp://pay?${q}`;
    default:
      return `upi://pay?${q}`;
  }
}

/**
 * Android intent URL that targets a specific app package and falls back to the
 * Play Store when it is missing. Used on Android where it is the most reliable
 * way to reach one particular UPI app.
 */
export function buildAndroidIntent(app: Exclude<UpiApp, "any">, amount: number): string {
  const pkg = {
    gpay: "com.google.android.apps.nbu.paisa.user",
    phonepe: "com.phonepe.app",
    paytm: "net.one97.paytm",
  }[app];
  return `intent://pay?${upiQuery(amount)}#Intent;scheme=upi;package=${pkg};end`;
}

export const UPI_APPS: { id: Exclude<UpiApp, "any">; label: string; hue: string }[] = [
  { id: "gpay", label: "GPay", hue: "#4285F4" },
  { id: "phonepe", label: "PhonePe", hue: "#5f259f" },
  { id: "paytm", label: "Paytm", hue: "#00BAF2" },
];

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
