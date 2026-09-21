import type { Locale } from "@/lib/i18n/dictionaries";

export type L10n = Record<Locale, string>;

/** Long-form explanation of what Chhath is and why it is kept this way. */
export const CHHATH_ABOUT: { heading: L10n; paras: L10n[] } = {
  heading: {
    en: "What Chhath actually is",
    hi: "छठ आख़िर है क्या",
    bho: "छठ आखिर बा का",
  },
  paras: [
    {
      en: "Chhath is a four-day vrat offered to Surya Dev and Chhathi Maiya, kept from Kartik Shukla Chaturthi to Saptami. It is the one festival in the Hindu year where the setting sun is honoured before the rising one — gratitude first for the day that is ending, only then a prayer for the one to come.",
      hi: "छठ चार दिन का व्रत है जो सूर्य देव और छठी मैया को समर्पित है, कार्तिक शुक्ल चतुर्थी से सप्तमी तक। यह साल का इकलौता पर्व है जिसमें डूबते सूर्य को पहले अर्घ्य दिया जाता है — जो दिन बीत गया उसका आभार पहले, फिर आने वाले दिन की प्रार्थना।",
      bho: "छठ चार दिन के बरत ह जे सुरुज देव आ छठी मइया के समरपित बा, कातिक सुकुल चउथ से सतमी तक। ई साल के एकलौता परब ह जेमे डूबत सुरुज के पहिले अरघ दिहल जाला — जे दिन बीत गइल ओकर आभार पहिले, तब आवे वाला दिन के परारथना।",
    },
    {
      en: "There is no idol, no temple and no priest. The parvaitin — usually a woman, though men keep it too — performs every step herself: she cleans, she cooks, she walks to the ghat, she stands in the water and she raises the arghya with her own hands. The deity is not a statue; it is the sun you can see with your eyes.",
      hi: "न कोई मूर्ति, न कोई मंदिर, न कोई पंडित। परवैतिन — आमतौर पर स्त्री, पुरुष भी रखते हैं — हर काम खुद करती है: सफाई खुद, रसोई खुद, घाट तक पैदल खुद, पानी में खड़ी खुद, और अर्घ्य अपने हाथों से। देवता कोई पत्थर की मूरत नहीं — वो सूरज है जो आँखों से दिखता है।",
      bho: "ना कवनो मूरति, ना कवनो मंदिर, ना कवनो पंडित। परवैतिन — अकसर मेहरारू, मरद भी राखेलन — हर काम खुदे करेली: सफाई खुद, रसोई खुद, घाट तक पैदल खुद, पानी में ठाढ़ खुद, आ अरघ अपना हाथ से। देवता कवनो पाथर के मूरत ना — ऊ सुरुज ह जे आँख से लउके।",
    },
    {
      en: "Nobody keeps Chhath casually. Thirty-six hours without a drop of water, standing in a cold river at dawn in November — it is not a ritual you can half-do. That is exactly why it holds Bihar together: it demands everything, and it asks nothing in return except that the family stays well.",
      hi: "छठ कोई हल्के में नहीं करता। छत्तीस घंटे बिना पानी की एक बूँद के, नवंबर की भोर में ठंडी नदी में खड़े रहकर — यह आधा-अधूरा किया जाने वाला अनुष्ठान नहीं है। इसीलिए यह बिहार को जोड़े रखता है: यह सब कुछ माँगता है, और बदले में सिर्फ़ इतना कि घर-परिवार सुखी रहे।",
      bho: "छठ केहू हल्का में ना करे। छत्तीस घंटा बिना पानी के एक बूँद, नवंबर के भोर में ठंडा नदी में ठाढ़ होके — ई आधा-अधूरा कइल जाए वाला काम ना ह। एहि से ई बिहार के जोड़ले बा: ई सब कुछ माँगेला, आ बदला में खाली एतना कि घर-परिवार सुखी रहे।",
    },
    {
      en: "And there is no queue by caste or by money. Everyone stands in the same water, the same soop is raised, the same prasad is shared with whoever is on the ghat. For four days Bihar quietly becomes the most equal place in the country.",
      hi: "और यहाँ न जात की कतार है न पैसे की। सब एक ही पानी में खड़े होते हैं, वही सूप उठता है, वही प्रसाद घाट पर जो भी हो सबमें बँटता है। चार दिन के लिए बिहार चुपचाप देश की सबसे बराबर जगह बन जाता है।",
      bho: "आ इहाँ ना जात के लाइन बा ना पइसा के। सब एके पानी में ठाढ़ होलन, उहे सूप उठेला, उहे परसाद घाट पर जे भी होखे सबमें बँटेला। चार दिन खातिर बिहार चुपचाप देस के सबसे बराबर जगह बन जाला।",
    },
  ],
};

/** Prasad and samagri — deliberately humble, all of it locally grown. */
export const CHHATH_SAMAGRI: { name: L10n; note: L10n }[] = [
  {
    name: { en: "Thekua", hi: "ठेकुआ", bho: "ठेकुआ" },
    note: {
      en: "Wheat flour, jaggery and ghee, pressed in a wooden mould and fried at home. The taste of Chhath itself.",
      hi: "आटा, गुड़ और घी, लकड़ी के साँचे में दबाकर घर पर तला हुआ। छठ का स्वाद यही है।",
      bho: "आटा, गुड़ आ घीव, लकड़ी के साँचा में दबा के घरे तलल। छठ के सवाद इहे ह।",
    },
  },
  {
    name: { en: "Soop & Daura", hi: "सूप और दउरा", bho: "सूप आ दउरा" },
    note: {
      en: "Bamboo, woven by hand. Nothing plastic, nothing bought from a mall — the basket itself is part of the offering.",
      hi: "बाँस का, हाथ से बुना हुआ। न प्लास्टिक, न मॉल का सामान — टोकरी खुद अर्पण का हिस्सा है।",
      bho: "बाँस के, हाथ से बुनल। ना पलास्टिक, ना माल के समान — टोकरी खुदे अरपन के हिस्सा ह।",
    },
  },
  {
    name: { en: "Sugarcane", hi: "गन्ना", bho: "ईख" },
    note: {
      en: "Tied in pairs into an arch over the offering. Kartik is when it ripens — the festival eats what the season gives.",
      hi: "जोड़े में बाँधकर अर्घ्य के ऊपर मंडप बनाया जाता है। कार्तिक में ही पकता है — पर्व वही खाता है जो मौसम देता है।",
      bho: "जोड़ा में बाँध के अरघ के ऊपर मंडप बनेला। कातिक में ही पाकेला — परब उहे खाला जे मउसम देला।",
    },
  },
  {
    name: { en: "Rasiao-kheer", hi: "रसियाव-खीर", bho: "रसियाव-खीर" },
    note: {
      en: "Rice cooked in jaggery and milk on Kharna evening — the last food before thirty-six hours of nothing.",
      hi: "खरना की शाम गुड़ और दूध में पका चावल — छत्तीस घंटे के उपवास से पहले का आख़िरी भोजन।",
      bho: "खरना के सांझ गुड़ आ दूध में पाकल चाउर — छत्तीस घंटा के उपास से पहिले के आखिरी भोजन।",
    },
  },
  {
    name: { en: "Coconut & fruit", hi: "नारियल और फल", bho: "नरियर आ फल" },
    note: {
      en: "Banana in the bunch, coconut, singhada, sweet lime — seasonal, local, nothing imported.",
      hi: "केले का घौद, नारियल, सिंघाड़ा, मौसमी — मौसमी, स्थानीय, कुछ भी बाहर का नहीं।",
      bho: "केरा के घउद, नरियर, सिंघाड़ा, मउसमी — मउसमी, लोकल, कुछो बाहर के ना।",
    },
  },
  {
    name: { en: "Mitti ka diya", hi: "मिट्टी का दीया", bho: "माटी के दीया" },
    note: {
      en: "Lit on the soop and floated on the water. By the end of the arghya the whole river is a sheet of small flames.",
      hi: "सूप पर जलाया और पानी में बहाया जाता है। अर्घ्य ख़त्म होते-होते पूरी नदी छोटी-छोटी लौ की चादर बन जाती है।",
      bho: "सूप पर जरावल आ पानी में बहावल जाला। अरघ खतम होत-होत पूरा नदी छोट-छोट लौ के चादर बन जाला।",
    },
  },
];

/** The stories behind the vrat. */
export const CHHATH_KATHA: { title: L10n; text: L10n }[] = [
  {
    title: { en: "Karna", hi: "कर्ण", bho: "करन" },
    text: {
      en: "Surya's son, king of Anga — today's Bhagalpur. He is said to have stood in water every day offering arghya to his father, and to have given away whatever was asked of him afterwards. Chhath is often traced back to him.",
      hi: "सूर्य पुत्र, अंग देश के राजा — आज का भागलपुर। कहा जाता है कि वे रोज़ पानी में खड़े होकर अपने पिता को अर्घ्य देते थे, और उसके बाद जो माँगा जाए दान कर देते थे। छठ की जड़ें अक्सर उन्हीं से जोड़ी जाती हैं।",
      bho: "सुरुज के बेटा, अंग देस के राजा — आज के भागलपुर। कहल जाला कि ऊ रोज पानी में ठाढ़ होके आपन बाबूजी के अरघ देत रहलन, आ ओकरा बाद जे माँगल जाव दान कर देत रहलन। छठ के जड़ अकसर ओहि से जोड़ल जाला।",
    },
  },
  {
    title: { en: "Draupadi & the Pandavas", hi: "द्रौपदी और पांडव", bho: "दरोपदी आ पांडव" },
    text: {
      en: "In exile, Draupadi is said to have kept this vrat on the advice of Dhaumya rishi, for the health of the Pandavas and the return of their kingdom.",
      hi: "वनवास में द्रौपदी ने धौम्य ऋषि के कहने पर यह व्रत रखा — पांडवों के स्वास्थ्य और राज्य की वापसी के लिए।",
      bho: "बनवास में दरोपदी धउम्य रिसि के कहला पर ई बरत रखली — पांडव लोग के सेहत आ राज वापसी खातिर।",
    },
  },
  {
    title: { en: "Sita at Munger", hi: "मुंगेर में सीता", bho: "मुंगेर में सीता" },
    text: {
      en: "After returning from Lanka, Sita is believed to have kept the Chhath vrat at Munger on the Ganga. The Sita Charan temple there is still tied to that memory.",
      hi: "लंका से लौटने के बाद सीता ने मुंगेर में गंगा किनारे छठ व्रत रखा — ऐसी मान्यता है। वहाँ का सीता चरण मंदिर आज भी इसी स्मृति से जुड़ा है।",
      bho: "लंका से लवटला के बाद सीता मुंगेर में गंगा किनारे छठ बरत रखली — अइसन मानल जाला। ओहिजा के सीता चरन मंदिर आजो एहि याद से जुड़ल बा।",
    },
  },
  {
    title: { en: "Priyavrat & Malini", hi: "प्रियव्रत और मालिनी", bho: "परियबरत आ मालिनी" },
    text: {
      en: "King Priyavrat's child was born lifeless. Shashthi Devi — Chhathi Maiya, Brahma's manas-putri — gave the child life, and asked that she be worshipped on the sixth day. That is where the name Chhath comes from.",
      hi: "राजा प्रियव्रत की संतान मृत पैदा हुई। षष्ठी देवी — छठी मैया, ब्रह्मा की मानस पुत्री — ने बच्चे को जीवन दिया और कहा कि छठे दिन उनकी पूजा हो। नाम 'छठ' यहीं से आया।",
      bho: "राजा परियबरत के संतान मुअल पैदा भइल। सस्ठी देवी — छठी मइया, बरम्हा के मानस पुत्री — बच्चा के जिनगी दिहली आ कहली कि छठवाँ दिन ओनकर पूजा होखे। नाम 'छठ' इहे से आइल।",
    },
  },
];

/** Practical rules people actually follow. */
export const CHHATH_NIYAM: { do: L10n[]; dont: L10n[] } = {
  do: [
    {
      en: "Keep the kitchen and the puja space scrubbed; cook the prasad on a fresh clay or dedicated stove.",
      hi: "रसोई और पूजा की जगह चमकाकर रखें; प्रसाद मिट्टी के नए या अलग रखे चूल्हे पर बनाएँ।",
      bho: "रसोई आ पूजा के जगह चमका के राखीं; परसाद माटी के नया भा अलगे राखल चूल्हा पर बनाईं।",
    },
    {
      en: "Sleep on the floor for the four days — the vrat is as much about humility as about hunger.",
      hi: "चारों दिन ज़मीन पर सोएँ — व्रत जितना भूख का है उतना ही विनम्रता का।",
      bho: "चारो दिन जमीन पर सुतीं — बरत जतना भूख के ह ओतने नम्रता के।",
    },
    {
      en: "Carry the daura on the head to the ghat, barefoot, and let no one's foot touch the offering.",
      hi: "दउरा सिर पर रखकर नंगे पाँव घाट तक ले जाएँ, और अर्घ्य की सामग्री को किसी का पैर न छुए।",
      bho: "दउरा माथा पर राख के नंगे गोड़ घाट तक ले जाईं, आ अरघ के समान के केहू के गोड़ ना छुए।",
    },
    {
      en: "Share the prasad with everyone at the ghat — that sharing is the whole point.",
      hi: "घाट पर मौजूद हर किसी को प्रसाद बाँटें — यही बाँटना असली बात है।",
      bho: "घाट पर मउजूद हर केहू के परसाद बाँटीं — इहे बाँटल असली बात ह।",
    },
  ],
  dont: [
    {
      en: "No onion, garlic or salt in the prasad; no non-veg anywhere in the house for all four days.",
      hi: "प्रसाद में प्याज़, लहसुन, नमक नहीं; चारों दिन घर में कहीं भी माँस-मछली नहीं।",
      bho: "परसाद में पियाज, लहसुन, नून ना; चारो दिन घर में कहीं माँस-मछरी ना।",
    },
    {
      en: "Don't taste the prasad while cooking it — it goes to Chhathi Maiya first.",
      hi: "प्रसाद बनाते समय उसे चखें नहीं — वो पहले छठी मैया को जाता है।",
      bho: "परसाद बनावत घरी ओकरा के चीखीं मत — ऊ पहिले छठी मइया के जाला।",
    },
    {
      en: "Don't wear leather or footwear near the offerings, and don't take the soop into a dirty place.",
      hi: "अर्घ्य के पास चमड़ा या जूता-चप्पल नहीं, और सूप को अशुद्ध जगह न ले जाएँ।",
      bho: "अरघ के लगे चमड़ा भा जूता-चप्पल ना, आ सूप के गंदा जगह ना ले जाईं।",
    },
    {
      en: "Don't leave plastic or thermocol at the ghat — the river is part of the puja, not a dustbin.",
      hi: "घाट पर प्लास्टिक या थर्मोकोल न छोड़ें — नदी पूजा का हिस्सा है, कूड़ेदान नहीं।",
      bho: "घाट पर पलास्टिक भा थर्मोकोल ना छोड़ीं — नदी पूजा के हिस्सा ह, कूड़ादान ना।",
    },
  ],
};
