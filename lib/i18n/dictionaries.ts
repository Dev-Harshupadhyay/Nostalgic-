/**
 * Translation dictionaries.
 *
 * English is the source of truth: every other locale is typed against it, so
 * adding a key without translating it is a compile error rather than a silent
 * fallback at runtime. Tamil and Telugu are intentionally not shipped yet —
 * half-translated UI is worse than none.
 */

export const LOCALES = ["en", "hi", "bho"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_META: Record<Locale, { label: string; native: string; flag: string }> = {
  en: { label: "English", native: "English", flag: "🌐" },
  hi: { label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  bho: { label: "Bhojpuri", native: "भोजपुरी", flag: "🪔" },
};

const en = {
  nav: {
    home: "Home",
    evergreen: "Evergreen",
    favourites: "Favourites",
    oldSongs: "Old Songs",
    singles: "Singles",
    trending: "New & Trending",
    chhath: "Chhath Puja",
    bhojpuri: "Bhojpuri",
    live: "Live Song",
    search: "Search",
    support: "Support Dev Harsh",
    developer: "About Developer",
    language: "Language",
    menu: "Menu",
    tagline: "Your memories, one song at a time.",
  },
  hint: {
    home: "Overview & featured",
    evergreen: "2000s solid hits",
    favourites: "Your saved playlist",
    oldSongs: "Memories",
    singles: "One song, one mood",
    trending: "What's new",
    chhath: "Traditional vibes",
    bhojpuri: "Desi vibes",
    live: "Play live from YouTube",
    search: "Find any song",
  },
  common: {
    playAll: "Play all",
    shuffle: "Shuffle",
    songs: "songs",
    song: "song",
    addToQueue: "Add to queue",
    close: "Close",
    copy: "Copy",
    copied: "Copied",
  },
  evergreen: {
    eyebrow: "Timeless collection",
    title: "Evergreen",
    lead: "The solid hits of the 2000s and the melodies that never age — play once and the whole day is sorted.",
  },
  favourites: {
    eyebrow: "Your playlist · saved on this device",
    title: "Favourites",
    lead: "Your {count} — hit play and the whole list keeps going, one after another.",
    emptyTitle: "No favourites yet",
    emptyText:
      "Tap the heart on any song poster and it will be saved here as your own playlist. Everything stays on your device.",
    saved: "Saved songs",
    grid: "Grid",
    list: "List",
    queueAll: "Add all to queue",
  },
  chhath: {
    eyebrow: "The soul of Bihar",
    title: "Chhath Puja",
    countdownTitle: "Chhath Puja 2026",
    daysLeft: "to go",
    liveNow: "Chhath is on — the ghats are full",
    today: "Today",
    gallery: "Gallery",
    galleryLead: "The ghat, the soop, the diyas — the picture of Chhath.",
    fourDays: "The four days of the great festival",
  },
  support: {
    eyebrow: "Support the developer",
    payWith: "Pay with",
    anyApp: "Any UPI app",
    copyUpi: "Copy UPI ID",
    later: "Not now, let me listen",
  },
};

export type Dictionary = typeof en;

const hi: Dictionary = {
  nav: {
    home: "होम",
    evergreen: "सदाबहार",
    favourites: "पसंदीदा",
    oldSongs: "पुराने गाने",
    singles: "सिंगल्स",
    trending: "नया और ट्रेंडिंग",
    chhath: "छठ पूजा",
    bhojpuri: "भोजपुरी",
    live: "लाइव गाना",
    search: "खोजें",
    support: "हर्ष को सपोर्ट करें",
    developer: "डेवलपर के बारे में",
    language: "भाषा",
    menu: "मेन्यू",
    tagline: "आपकी यादें, एक बार में एक गाना।",
  },
  hint: {
    home: "झलक और चुनिंदा",
    evergreen: "2000 के सॉलिड हिट",
    favourites: "आपकी सेव की हुई प्लेलिस्ट",
    oldSongs: "यादें",
    singles: "एक गाना, एक मूड",
    trending: "क्या नया है",
    chhath: "पारंपरिक रंग",
    bhojpuri: "देसी रंग",
    live: "यूट्यूब से लाइव चलाएं",
    search: "कोई भी गाना खोजें",
  },
  common: {
    playAll: "सभी चलाएं",
    shuffle: "शफ़ल",
    songs: "गाने",
    song: "गाना",
    addToQueue: "क्यू में जोड़ें",
    close: "बंद करें",
    copy: "कॉपी",
    copied: "कॉपी हो गया",
  },
  evergreen: {
    eyebrow: "कालजयी संग्रह",
    title: "सदाबहार",
    lead: "2000 के दशक के सॉलिड हिट और वो धुनें जो कभी पुरानी नहीं होतीं — एक बार चलाओ, पूरा दिन सेट है।",
  },
  favourites: {
    eyebrow: "आपकी प्लेलिस्ट · इसी डिवाइस में सेव",
    title: "पसंदीदा",
    lead: "आपके दिल के {count} — प्ले दबाइए, पूरी लिस्ट एक के बाद एक चलती रहेगी।",
    emptyTitle: "अभी कोई पसंदीदा नहीं",
    emptyText:
      "किसी भी गाने के पोस्टर पर दिल दबाइए — वो यहाँ आपकी अपनी प्लेलिस्ट में सेव हो जाएगा। सब कुछ आपके डिवाइस में ही रहता है।",
    saved: "सेव किए गाने",
    grid: "ग्रिड",
    list: "लिस्ट",
    queueAll: "सब क्यू में डालें",
  },
  chhath: {
    eyebrow: "बिहार की आत्मा",
    title: "छठ पूजा",
    countdownTitle: "छठ पूजा 2026",
    daysLeft: "बाकी",
    liveNow: "छठ चल रहा है — घाट भरे हुए हैं",
    today: "आज",
    gallery: "गैलरी",
    galleryLead: "घाट, सूप, दीये — छठ की तस्वीर।",
    fourDays: "चार दिन का महापर्व",
  },
  support: {
    eyebrow: "डेवलपर को सपोर्ट करें",
    payWith: "इससे भुगतान करें",
    anyApp: "कोई भी UPI ऐप",
    copyUpi: "UPI ID कॉपी करें",
    later: "अभी नहीं, गाने सुनने दो",
  },
};

const bho: Dictionary = {
  nav: {
    home: "घर",
    evergreen: "सदाबहार",
    favourites: "मनपसंद",
    oldSongs: "पुरनका गाना",
    singles: "सिंगल",
    trending: "नया आ ट्रेंडिंग",
    chhath: "छठ पूजा",
    bhojpuri: "भोजपुरी",
    live: "लाइव गाना",
    search: "खोजीं",
    support: "हर्ष के सपोर्ट करीं",
    developer: "डेवलपर के बारे में",
    language: "भाषा",
    menu: "मेनू",
    tagline: "रउआ के इयाद, एक बेर में एगो गाना।",
  },
  hint: {
    home: "झलक आ चुनल",
    evergreen: "2000 के सॉलिड हिट",
    favourites: "रउआ के सेव कइल प्लेलिस्ट",
    oldSongs: "इयाद",
    singles: "एगो गाना, एगो मूड",
    trending: "का नया बा",
    chhath: "परंपरा के रंग",
    bhojpuri: "देसी रंग",
    live: "यूट्यूब से लाइव बजाईं",
    search: "कवनो गाना खोजीं",
  },
  common: {
    playAll: "सब बजाईं",
    shuffle: "शफ़ल",
    songs: "गाना",
    song: "गाना",
    addToQueue: "कतार में जोड़ीं",
    close: "बंद करीं",
    copy: "कॉपी",
    copied: "कॉपी हो गइल",
  },
  evergreen: {
    eyebrow: "जे कबो पुरान ना होखे",
    title: "सदाबहार",
    lead: "2000 वाला सॉलिड गाना आ ऊ धुन जे कबो पुरान ना होखे — एक बेर बजाईं, पूरा दिन बन जाई।",
  },
  favourites: {
    eyebrow: "रउआ के प्लेलिस्ट · एही फोन में सेव",
    title: "मनपसंद",
    lead: "रउआ मन के {count} — प्ले दबाईं, पूरा लिस्ट एक के बाद एक बजत रही।",
    emptyTitle: "अबहीं कवनो मनपसंद नइखे",
    emptyText:
      "कवनो गाना के पोस्टर पर दिल दबाईं — ऊ इहाँ रउआ के अपना प्लेलिस्ट में सेव हो जाई। सब कुछ रउआ के फोन में रहेला।",
    saved: "सेव कइल गाना",
    grid: "ग्रिड",
    list: "लिस्ट",
    queueAll: "सब कतार में डालीं",
  },
  chhath: {
    eyebrow: "बिहार के परान",
    title: "छठ पूजा",
    countdownTitle: "छठ पूजा 2026",
    daysLeft: "बाकी",
    liveNow: "छठ चलत बा — घाट भरल बा",
    today: "आज",
    gallery: "गैलरी",
    galleryLead: "घाट, सूप, दीया — छठ के तस्वीर।",
    fourDays: "चार दिन के महापरब",
  },
  support: {
    eyebrow: "डेवलपर के सपोर्ट करीं",
    payWith: "एह से भुगतान करीं",
    anyApp: "कवनो UPI ऐप",
    copyUpi: "UPI ID कॉपी करीं",
    later: "अबहीं ना, गाना सुने दीं",
  },
};

export const DICTIONARIES: Record<Locale, Dictionary> = { en, hi, bho };
