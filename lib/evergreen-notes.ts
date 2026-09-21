/**
 * Short, human-written notes for each Evergreen category.
 * Shown under the shelf heading so the page reads like a story, not a list.
 */
export type EvergreenNote = {
  tagline: string;
  story: string;
  era: string;
};

export const EVERGREEN_NOTES: Record<string, EvergreenNote> = {
  "2000s Solid Hits": {
    era: "2000 – 2010",
    tagline: "Woh daur jab har gaana ek yaad ban jaata tha",
    story:
      "CD player, Nokia ki ringtone aur cyber cafe se download kiye gaye gaane — 2000s ka Bollywood apne peak par tha. Rahman, Pritam, KK, Shreya, Atif… har album ek event hota tha. Ye wahi solid hits hain jo aaj bhi shaadi se lekar road trip tak har jagah bajte hain.",
  },
  "Evergreen Melodies": {
    era: "Har daur",
    tagline: "Jo kabhi purane nahi hote",
    story:
      "Kuch dhunein waqt ke saath purani nahi hoti — bas aur gehri ho jaati hain. Lata, Rafi, Kishore se lekar Udit aur Alka tak, ye wo melodies hain jo dadi ke radio par bhi bajti thi aur aaj aapke headphones me bhi utni hi sachi lagti hain.",
  },
  "Romantic Evergreen": {
    era: "Love, always",
    tagline: "Pehla pyaar wali feeling, ek play button me",
    story:
      "Har kisi ke paas ek gaana hota hai jo kisi khaas insaan ki yaad dila deta hai. Ye collection usi ke liye hai — barish wali shaam, chhat par baithe hue, ya raat ke 2 baje bina soye. Sun'te hi dil thoda halka ho jaata hai.",
  },
  "Retro Gold": {
    era: "70s – 80s",
    tagline: "Vinyl, cassette aur pure swag",
    story:
      "Disco lights, bell-bottom aur wo orchestra jo ab nahi banta. Retro Bollywood ka apna hi nasha hai — RD Burman ki beats se lekar Kishore ki awaaz tak, har track me ek zamaane ki khushbu hai jo aaj bhi taazi hai.",
  },
  "Golden Oldies": {
    era: "50s – 60s",
    tagline: "Jahan se sab shuru hua",
    story:
      "Black & white parde par rangeen ehsaas. Sitar, tabla aur bina auto-tune ki asli awaazein — ye wo neev hai jispe poora Hindi cinema ka sangeet khada hai. Ek baar sun lo, phir chhodna mushkil hai.",
  },
};
