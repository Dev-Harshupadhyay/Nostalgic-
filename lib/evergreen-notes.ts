import type { Locale } from "@/lib/i18n/dictionaries";

type L10n = Record<Locale, string>;

export type EvergreenNote = { tagline: L10n; story: L10n; era: L10n };

/** A written note for each Evergreen category, in every shipped language. */
export const EVERGREEN_NOTES: Record<string, EvergreenNote> = {
  "2000s Solid Hits": {
    era: { en: "2000 \u2013 2010", hi: "2000 \u2013 2010", bho: "2000 \u2013 2010" },
    tagline: {
      en: "When every song became a memory",
      hi: "वो दौर जब हर गाना एक याद बन जाता था",
      bho: "ऊ दउर जब हर गाना एगो इयाद बन जात रहे",
    },
    story: {
      en: "CD players, Nokia ringtones and songs downloaded at the cyber cafe \u2014 2000s Bollywood was at its peak. Rahman, Pritam, KK, Shreya, Atif\u2026 every album was an event. These are the solid hits that still play at weddings and on road trips.",
      hi: "सीडी प्लेयर, नोकिया की रिंगटोन और साइबर कैफ़े से डाउनलोड किए गए गाने \u2014 2000 का बॉलीवुड अपने चरम पर था। रहमान, प्रीतम, केके, श्रेया, आतिफ़\u2026 हर एल्बम एक इवेंट होता था। ये वही सॉलिड हिट हैं जो आज भी शादी से लेकर रोड ट्रिप तक हर जगह बजते हैं।",
      bho: "सीडी पलेयर, नोकिया के रिंगटोन आ साइबर कैफे से डाउनलोड कइल गाना \u2014 2000 के बॉलीवुड आपन चरम पर रहे। रहमान, परीतम, केके, सरेया, आतिफ\u2026 हर एलबम एगो इवेंट होखे। इहे ऊ सॉलिड हिट ह जे आजो बियाह से लेके रोड ट्रिप तक हर जगह बाजेला।",
    },
  },
  "Evergreen Melodies": {
    era: { en: "Every era", hi: "हर दौर", bho: "हर दउर" },
    tagline: { en: "The ones that never age", hi: "जो कभी पुराने नहीं होते", bho: "जे कबो पुरान ना होखे" },
    story: {
      en: "Some tunes do not get old with time \u2014 they only get deeper. From Lata, Rafi and Kishore to Udit and Alka, these are the melodies that played on your grandmother\u2019s radio and still sound just as true in your headphones.",
      hi: "कुछ धुनें वक़्त के साथ पुरानी नहीं होतीं \u2014 बस और गहरी हो जाती हैं। लता, रफ़ी, किशोर से लेकर उदित और अलका तक, ये वो धुनें हैं जो दादी के रेडियो पर भी बजती थीं और आज आपके हेडफ़ोन में भी उतनी ही सच्ची लगती हैं।",
      bho: "कुछ धुन बखत के साथे पुरान ना होखे \u2014 बस अउर गहिर हो जाला। लता, रफी, किसोर से लेके उदित आ अलका तक, ई ऊ धुन ह जे दादी के रेडियो पर भी बाजत रहे आ आज रउआ हेडफोन में भी ओतने सच्चा लागेला।",
    },
  },
  "Romantic Evergreen": {
    era: { en: "Love, always", hi: "मोहब्बत, हमेशा", bho: "पिरीत, हरदम" },
    tagline: {
      en: "First-love feeling, in one play button",
      hi: "पहला प्यार वाली फ़ीलिंग, एक प्ले बटन में",
      bho: "पहिला पिरीत वाला फीलिंग, एगो पले बटन में",
    },
    story: {
      en: "Everyone has one song that brings a particular person to mind. This collection is for that \u2014 a rainy evening, sitting on the roof, or 2 a.m. with no sleep coming. It lightens the chest a little.",
      hi: "हर किसी के पास एक गाना होता है जो किसी ख़ास इंसान की याद दिला देता है। ये कलेक्शन उसी के लिए है \u2014 बारिश वाली शाम, छत पर बैठे हुए, या रात के 2 बजे बिना सोए। सुनते ही दिल थोड़ा हल्का हो जाता है।",
      bho: "हर केहू लगे एगो गाना होला जे कवनो खास आदमी के इयाद दिला देला। ई कलेकसन ओकरे खातिर बा \u2014 बरखा वाला सांझ, छत पर बइठल, भा रात के 2 बजे बिना सुतले। सुनते मन थोड़ा हल्का हो जाला।",
    },
  },
  "Retro Gold": {
    era: { en: "70s \u2013 80s", hi: "70 \u2013 80 का दशक", bho: "70 \u2013 80 के दसक" },
    tagline: { en: "Vinyl, cassette and pure swag", hi: "विनाइल, कैसेट और ठेठ स्वैग", bho: "विनाइल, कैसेट आ ठेठ सवैग" },
    story: {
      en: "Disco lights, bell-bottoms and an orchestra nobody records any more. Retro Bollywood has its own intoxication \u2014 from RD Burman\u2019s beats to Kishore\u2019s voice, every track carries the smell of an era that still feels fresh.",
      hi: "डिस्को लाइट्स, बेल-बॉटम और वो ऑर्केस्ट्रा जो अब नहीं बनता। रेट्रो बॉलीवुड का अपना ही नशा है \u2014 आरडी बर्मन की बीट्स से लेकर किशोर की आवाज़ तक, हर ट्रैक में एक ज़माने की ख़ुशबू है जो आज भी ताज़ा है।",
      bho: "डिसको लाइट, बेल-बॉटम आ ऊ ऑरकेस्ट्रा जे अब ना बनेला। रेट्रो बॉलीवुड के आपन नसा बा \u2014 आरडी बरमन के बीट से लेके किसोर के आवाज तक, हर ट्रैक में एगो जमाना के महक बा जे आजो ताजा बा।",
    },
  },
  "Golden Oldies": {
    era: { en: "50s \u2013 60s", hi: "50 \u2013 60 का दशक", bho: "50 \u2013 60 के दसक" },
    tagline: { en: "Where it all began", hi: "जहाँ से सब शुरू हुआ", bho: "जहाँ से सब सुरू भइल" },
    story: {
      en: "Colour on a black-and-white screen. Sitar, tabla and real voices with no auto-tune \u2014 this is the foundation the whole of Hindi film music stands on. Listen once and it is hard to stop.",
      hi: "ब्लैक एंड व्हाइट परदे पर रंगीन एहसास। सितार, तबला और बिना ऑटो-ट्यून की असली आवाज़ें \u2014 ये वो नींव है जिस पर पूरा हिंदी सिनेमा का संगीत खड़ा है। एक बार सुन लो, फिर छोड़ना मुश्किल है।",
      bho: "करिया-उजर परदा पर रंगीन एहसास। सितार, तबला आ बिना ऑटो-टून के असली आवाज \u2014 ई ऊ नींव ह जेकरा पर पूरा हिंदी सिनेमा के संगीत ठाढ़ बा। एक बेर सुन लीं, फेर छोड़ल मुसकिल बा।",
    },
  },
};
