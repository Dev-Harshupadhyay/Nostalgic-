/**
 * Chhath Puja 2026 — Kartik Shukla Chaturthi to Saptami.
 *
 * Dates cross-checked against multiple 2026 panchang sources: the four days
 * run Friday 13 to Monday 16 November 2026, with the main Sandhya Arghya on
 * Sunday 15 November and the Usha Arghya at dawn on Monday 16 November.
 *
 * Arghya times are *sunset / sunrise*, so they are local to each city — the
 * values below are published approximations for Patna and Delhi, and the UI
 * always tells the user to confirm with their own local panchang on the day.
 */

export type ChhathDay = {
  key: string;
  n: number;
  emoji: string;
  /** Illustration shown on the day's detail page. */
  image: string;
  /** ISO date, Indian Standard Time. */
  date: string;
  weekday: string;
  tithi: string;
  name: { en: string; hi: string; bho: string };
  time?: string;
  what: { en: string; hi: string; bho: string };
};

export const CHHATH_2026: ChhathDay[] = [
  {
    key: "nahay-khay",
    emoji: "🛁",
    image: "/chhath/g5.jpg",
    n: 1,
    date: "2026-11-13",
    weekday: "Friday",
    tithi: "Kartik Shukla Chaturthi",
    name: { en: "Nahay Khay", hi: "नहाय खाय", bho: "नहाय खाय" },
    what: {
      en: "A holy bath, the whole house scrubbed clean, and a single sattvic meal — kaddu-bhaat, chana dal, arwa rice. The four days of purity begin here.",
      hi: "पवित्र स्नान, घर की पूरी सफाई, और दिन में एक ही बार सात्विक भोजन — कद्दू-भात, चना दाल, अरवा चावल। यहीं से चार दिन की पवित्रता शुरू होती है।",
      bho: "गंगा असनान, घर के पूरा सफाई, आ दिन में एके बेर सतवा भोजन — कद्दू-भात, चना दाल, अरवा चाउर। इहे से चार दिन के पवित्रता सुरू होला।",
    },
  },
  {
    key: "kharna",
    emoji: "🍚",
    image: "/chhath/g4.jpg",
    n: 2,
    date: "2026-11-14",
    weekday: "Saturday",
    tithi: "Kartik Shukla Panchami",
    name: { en: "Kharna (Lohanda)", hi: "खरना (लोहंडा)", bho: "खरना (लोहंडा)" },
    what: {
      en: "A fast all day, broken after sunset with jaggery kheer and roti. Anyone who tastes that prasad remembers it for life. Right after it, the 36-hour waterless fast begins.",
      hi: "दिन भर का उपवास, शाम को गुड़ की खीर और रोटी का प्रसाद। जो ये प्रसाद चख ले, वो पूरी ज़िंदगी उसका स्वाद नहीं भूलता। इसके बाद शुरू होता है 36 घंटे का निर्जला व्रत।",
      bho: "दिन भर के उपास, सांझ के गुड़ के खीर आ रोटी के परसाद। जे ई परसाद चीख लेव, ऊ जिनगी भर ना भुलाई। एकरा बाद सुरू होला 36 घंटा के निरजला बरत।",
    },
  },
  {
    key: "sandhya-argh",
    emoji: "🌇",
    image: "/chhath/g1.jpg",
    n: 3,
    date: "2026-11-15",
    weekday: "Sunday",
    tithi: "Kartik Shukla Shashthi · Surya Shashthi",
    name: { en: "Sandhya Arghya", hi: "संध्या अर्घ्य", bho: "सांझ के अरघ" },
    time: "Patna ~5:00 PM · Delhi ~5:27 PM",
    what: {
      en: "The main day. The whole village walks to the ghat. Thekua, banana, coconut and sugarcane in the soop; the vrati stands waist-deep in water and raises arghya to the SETTING sun.",
      hi: "मुख्य दिन। घाट पर पूरा गाँव। सूप में ठेकुआ, केला, नारियल, गन्ना। कमर तक पानी में खड़ी व्रती डूबते सूर्य को अर्घ्य देती हैं।",
      bho: "मुख्य दिन। घाट पर पूरा गाँव। सूप में ठेकुआ, केरा, नरियर, ईख। कमर भर पानी में ठाढ़ बरती डूबत सुरुज के अरघ देली।",
    },
  },
  {
    key: "usha-argh",
    emoji: "🌄",
    image: "/chhath/g3.jpg",
    n: 4,
    date: "2026-11-16",
    weekday: "Monday",
    tithi: "Kartik Shukla Saptami",
    name: { en: "Usha Arghya & Paran", hi: "उषा अर्घ्य और पारण", bho: "भोरे के अरघ आ पारन" },
    time: "Patna ~6:08 AM · Delhi ~6:44 AM",
    what: {
      en: "Reaching the ghat while it is still dark, waiting for the first ray. Arghya to the RISING sun, and only then is the fast broken. The prasad is shared with everyone — no caste, no rich or poor, one ghat.",
      hi: "अँधेरे में ही घाट पहुँचना, पहली किरण का इंतज़ार। उगते सूर्य को अर्घ्य देकर व्रत खुलता है। प्रसाद बाँटने में जात-पात, अमीर-गरीब का कोई भेद नहीं — सब एक ही घाट पर।",
      bho: "अन्हारे में घाट पहुँचल, पहिला किरिन के इंतजार। उगत सुरुज के अरघ देके बरत खुलेला। परसाद बाँटे में जात-पात, अमीर-गरीब के कवनो भेद ना — सब एके घाट पर।",
    },
  },
];

/** Midnight IST (UTC+5:30) for a given ISO date. */
function istMidnight(iso: string): number {
  return new Date(`${iso}T00:00:00+05:30`).getTime();
}

export const CHHATH_START = istMidnight(CHHATH_2026[0].date);
/** End of the last day. */
export const CHHATH_END = istMidnight(CHHATH_2026[3].date) + 24 * 3600 * 1000;

export type ChhathStatus =
  | { phase: "before"; days: number; hours: number; minutes: number; seconds: number }
  | { phase: "during"; dayIndex: number }
  | { phase: "after" };

export function chhathStatus(now: number): ChhathStatus {
  if (now >= CHHATH_END) return { phase: "after" };

  if (now >= CHHATH_START) {
    const dayIndex = CHHATH_2026.findIndex((d, i) => {
      const start = istMidnight(d.date);
      const end = start + 24 * 3600 * 1000;
      return now >= start && now < end;
    });
    return { phase: "during", dayIndex: Math.max(dayIndex, 0) };
  }

  let diff = Math.max(CHHATH_START - now, 0);
  const days = Math.floor(diff / 86_400_000);
  diff -= days * 86_400_000;
  const hours = Math.floor(diff / 3_600_000);
  diff -= hours * 3_600_000;
  const minutes = Math.floor(diff / 60_000);
  const seconds = Math.floor((diff - minutes * 60_000) / 1000);
  return { phase: "before", days, hours, minutes, seconds };
}

/** Photo-style gallery — original flat-vector artwork, no third-party photos. */
export const CHHATH_GALLERY = [
  {
    src: "/chhath/g1.jpg",
    title: { en: "Sandhya Arghya", hi: "संध्या अर्घ्य", bho: "सांझ के अरघ" },
    caption: {
      en: "Waist-deep in the river, soop raised to the setting sun.",
      hi: "कमर तक पानी में, सूप उठाए डूबते सूर्य की ओर।",
      bho: "कमर भर पानी में, सूप उठा के डूबत सुरुज के ओर।",
    },
  },
  {
    src: "/chhath/g2.jpg",
    title: { en: "The soop", hi: "सूप", bho: "सूप" },
    caption: {
      en: "Thekua, banana, coconut, sugarcane — everything humble, everything local.",
      hi: "ठेकुआ, केला, नारियल, गन्ना — सब सादा, सब अपने यहाँ का।",
      bho: "ठेकुआ, केरा, नरियर, ईख — सब सादा, सब अपना इहाँ के।",
    },
  },
  {
    src: "/chhath/g3.jpg",
    title: { en: "Usha Arghya", hi: "उषा अर्घ्य", bho: "भोरे के अरघ" },
    caption: {
      en: "Diyas on dark water, waiting for the first ray of the day.",
      hi: "काले पानी पर दीये, दिन की पहली किरण का इंतज़ार।",
      bho: "करिया पानी पर दीया, दिन के पहिला किरिन के इंतजार।",
    },
  },
  {
    src: "/chhath/g4.jpg",
    title: { en: "Thekua", hi: "ठेकुआ", bho: "ठेकुआ" },
    caption: {
      en: "Wheat, jaggery and ghee — made at home, by hand, in complete purity.",
      hi: "आटा, गुड़ और घी — घर में, हाथ से, पूरी पवित्रता के साथ।",
      bho: "आटा, गुड़ आ घीव — घरे में, हाथ से, पूरा पवित्रता से।",
    },
  },
  {
    src: "/chhath/g5.jpg",
    title: { en: "Nahay Khay", hi: "नहाय खाय", bho: "नहाय खाय" },
    caption: {
      en: "The courtyard scrubbed, the clay stove lit, kaddu-bhaat on the fire.",
      hi: "आँगन की सफाई, मिट्टी का चूल्हा, और कद्दू-भात चढ़ा हुआ।",
      bho: "अँगना के सफाई, माटी के चूल्हा, आ कद्दू-भात चढ़ल।",
    },
  },
  {
    src: "/chhath/g6.jpg",
    title: { en: "Surya & Chhathi Maiya", hi: "सूर्य और छठी मैया", bho: "सुरुज आ छठी मइया" },
    caption: {
      en: "No idol, no priest — the deity is the one you can see in the sky.",
      hi: "न कोई मूर्ति, न कोई पंडित — देवता वही जो आसमान में दिखता है।",
      bho: "ना कवनो मूरति, ना कवनो पंडित — देवता उहे जे अकास में लउके।",
    },
  },
];
