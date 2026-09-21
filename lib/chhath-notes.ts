import type { Locale } from "@/lib/i18n/dictionaries";

type L10n = Record<Locale, string>;

/** Hero copy for the Chhath page, in every shipped language. */
export const CHHATH_INTRO: { lead: L10n; body: L10n } = {
  lead: {
    en: "Probably the only festival in the world where the setting sun is honoured with the same devotion as the rising one.",
    hi: "दुनिया का शायद इकलौता पर्व जहाँ डूबते हुए सूरज को भी उतनी ही श्रद्धा से अर्घ्य दिया जाता है जितनी उगते हुए को।",
    bho: "दुनिया के सायद एकलौता परब जहाँ डूबत सुरुज के भी ओतने सरधा से अरघ दिहल जाला जतना उगत के।",
  },
  body: {
    en: "Chhath is not just a festival — it is Bihar's identity. Four days kept without a priest, without an idol, without any show. Only river water, a bamboo soop, the smell of thekua, and a mother's thirty-six hours without a drop of water. Whoever is far from home, their heart is at home during Chhath.",
    hi: "छठ सिर्फ़ एक त्योहार नहीं — यह बिहार की पहचान है। चार दिन का यह महापर्व बिना किसी पंडित, बिना किसी मूर्ति, बिना किसी दिखावे के होता है। सिर्फ़ नदी का पानी, बाँस का सूप, ठेकुआ की ख़ुशबू और माँ का छत्तीस घंटे का निर्जला व्रत। जो भी परदेस में है, छठ के दिनों में उसका दिल घर ही होता है।",
    bho: "छठ खाली एक तेवहार ना — ई बिहार के पहचान ह। चार दिन के ई महापरब बिना कवनो पंडित, बिना कवनो मूरति, बिना कवनो देखावा के होला। खाली नदी के पानी, बाँस के सूप, ठेकुआ के महक आ माई के छत्तीस घंटा के निरजला बरत। जे भी परदेस में बा, छठ के दिन में ओकर मन घरे रहेला।",
  },
};

export const CHHATH_FACTS: { k: string; v: L10n }[] = [
  { k: "4", v: { en: "days of the great festival", hi: "दिन का महापर्व", bho: "दिन के महापरब" } },
  { k: "36", v: { en: "hours without water", hi: "घंटे निर्जला व्रत", bho: "घंटा निरजला बरत" } },
  { k: "2", v: { en: "arghya — setting & rising sun", hi: "अर्घ्य — डूबते और उगते सूर्य को", bho: "अरघ — डूबत आ उगत सुरुज के" } },
  { k: "0", v: { en: "priest, idol or show", hi: "पंडित, मूर्ति या दिखावा", bho: "पंडित, मूरति भा देखावा" } },
];

export const CHHATH_QUOTE: L10n = {
  en: "\u201cIn Chhath nobody is big and nobody is small. Everyone stands at the same ghat, in the same water, before the same sun.\u201d",
  hi: "\u201cछठ में न कोई बड़ा है न छोटा। सभी एक ही घाट पर, एक ही पानी में, एक ही सूरज के सामने खड़े होते हैं।\u201d",
  bho: "\u201cछठ में ना केहू बड़ बा ना छोट। सब एके घाट पर, एके पानी में, एके सुरुज के सामने ठाढ़ होलन।\u201d",
};

export const CHHATH_QUOTE_BY: L10n = {
  en: "\u2014 Bihar's truest tradition",
  hi: "\u2014 बिहार की सबसे सच्ची परंपरा",
  bho: "\u2014 बिहार के सबसे सच्चा परंपरा",
};

/** A written note for each song category. */
export const CHHATH_NOTES: Record<string, { tagline: L10n; story: L10n }> = {
  "Chhath Geet": {
    tagline: {
      en: "The ones that bring home rushing back",
      hi: "जो सुनते ही घर याद आ जाए",
      bho: "जे सुनते घर इयाद आ जाव",
    },
    story: {
      en: "\u201cKelva ke paat par\u201d, \u201cMarbo re sugwa\u201d, \u201cUgi he Suraj dev\u201d \u2014 these were never made in a studio. They came down from mothers and grandmothers, generation to generation. Sharda Sinha\u2019s voice became the sound of Chhath itself.",
      hi: "\u201cकेलवा के पात पर\u201d, \u201cमारबो रे सुगवा\u201d, \u201cउगी हे सूरज देव\u201d \u2014 ये गीत किसी स्टूडियो में नहीं बने। ये माँओं और दादियों की आवाज़ से पीढ़ी दर पीढ़ी चले आ रहे हैं। शारदा सिन्हा की आवाज़ तो छठ की पहचान ही बन गई।",
      bho: "\u201cकेलवा के पात पर\u201d, \u201cमारबो रे सुगवा\u201d, \u201cउगी हे सुरुज देव\u201d \u2014 ई गीत कवनो सटूडियो में ना बनल। ई माई आ दादी के आवाज से पीढ़ी दर पीढ़ी चलल आवत बा। सारदा सिन्हा के आवाज त छठ के पहचाने बन गइल।",
    },
  },
  "Traditional Chhath": {
    tagline: {
      en: "Unchanged for centuries",
      hi: "बिना किसी बदलाव के, सदियों से वही",
      bho: "बिना कवनो बदलाव के, सदियन से उहे",
    },
    story: {
      en: "No remix, no beat. Only a dholak, jhaal and voices together. When every woman at the ghat sings them at once, it sounds like all of Bihar is in one key.",
      hi: "न कोई रीमिक्स, न कोई बीट। सिर्फ़ ढोलक, झाल और सामूहिक आवाज़। घाट पर जब सारी औरतें एक साथ ये गीत गाती हैं, तो लगता है पूरा बिहार एक ही सुर में गा रहा हो।",
      bho: "ना कवनो रीमिक्स, ना कवनो बीट। खाली ढोलक, झाल आ सामूहिक आवाज। घाट पर जब सब मेहरारू एक साथे ई गीत गावेली, त लागेला पूरा बिहार एके सुर में गावत बा।",
    },
  },
  "Popular Chhath Songs": {
    tagline: {
      en: "Playing in every lane, every ghat",
      hi: "हर घाट, हर गाँव में बजने वाले",
      bho: "हर घाट, हर गाँव में बाजे वाला",
    },
    story: {
      en: "The moment Chhath arrives these start playing in every lane, every chowk, every courtyard. For anyone living away, these songs are the road home.",
      hi: "छठ आते ही ये गाने हर गली, हर चौक, हर घर के आँगन में बजने लगते हैं। परदेस में रहने वालों के लिए तो यही गाने घर का रास्ता हैं।",
      bho: "छठ आवते ई गाना हर गली, हर चउक, हर घर के अँगना में बाजे लागेला। परदेस में रहे वाला खातिर त इहे गाना घर के रस्ता ह।",
    },
  },
  "Chhath Bhajan": {
    tagline: {
      en: "At Chhathi Maiya\u2019s feet",
      hi: "छठी मैया के चरणों में",
      bho: "छठी मइया के गोड़ लागे",
    },
    story: {
      en: "Prayers to Surya Dev and Chhathi Maiya. No complicated mantra \u2014 a plain request in plain language: let the house be at peace, let the children thrive, let the courtyard stay full.",
      hi: "सूर्य देव और छठी मैया की आराधना। कोई जटिल मंत्र नहीं \u2014 सीधी-सादी भाषा में माँग: घर में सुख रहे, बच्चे खुश रहें, आँगन भरा रहे।",
      bho: "सुरुज देव आ छठी मइया के अराधना। कवनो कठिन मंतर ना \u2014 सीधा-सादा भासा में माँग: घर में सुख रहे, बच्चा खुस रहस, अँगना भरल रहे।",
    },
  },
  "Chhath Special": {
    tagline: { en: "Special for this year", hi: "इस साल के लिए ख़ास", bho: "एह साल खातिर खास" },
    story: {
      en: "The same old faith in new voices. Tradition does not change \u2014 new voices simply keep joining it.",
      hi: "नए कलाकारों की आवाज़ में वही पुरानी आस्था। परंपरा बदलती नहीं, बस नई आवाज़ें उसमें जुड़ती जाती हैं।",
      bho: "नया कलाकार के आवाज में उहे पुरान आस्था। परंपरा बदलेले ना, बस नया आवाज ओहमे जुड़त जाला।",
    },
  },
  "Latest Chhath Songs": {
    tagline: { en: "New voices, the same old faith", hi: "नई आवाज़ें, वही पुरानी आस्था", bho: "नया आवाज, उहे पुरान आस्था" },
    story: {
      en: "Every year new geet arrive before Chhath \u2014 but the words are the same, the feeling is the same. That is what a living tradition looks like.",
      hi: "हर साल छठ से पहले नए गीत आते हैं \u2014 लेकिन शब्द वही, भाव वही। यही है परंपरा का ज़िंदा होना।",
      bho: "हर साल छठ से पहिले नया गीत आवेला \u2014 बाकिर सबद उहे, भाव उहे। इहे ह परंपरा के जिंदा होखल।",
    },
  },
};
