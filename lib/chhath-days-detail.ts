import type { Locale } from "@/lib/i18n/dictionaries";

type L10n = Record<Locale, string>;

export type DayDetail = {
  /** One-line summary shown under the title. */
  summary: L10n;
  /** Long narrative, split into paragraphs. */
  paras: L10n[];
  /** What is cooked / carried that day. */
  prasad: L10n[];
  /** Practical points people actually follow. */
  points: { label: L10n; text: L10n }[];
  /** A line of the geet traditionally sung that day. */
  geet: { line: L10n; note: L10n };
};

export const DAY_DETAIL: Record<string, DayDetail> = {
  /* ------------------------------------------------------------------ */
  "nahay-khay": {
    summary: {
      en: "The house is scrubbed, the vrati bathes in the river, and one pure meal begins four days of discipline.",
      hi: "घर की धुलाई, नदी में स्नान, और एक सात्विक भोजन से चार दिन का संयम शुरू होता है।",
      bho: "घर के धोवाई, नदी में असनान, आ एगो सतवा भोजन से चार दिन के संजम सुरू होला।",
    },
    paras: [
      {
        en: "Chhath does not begin at the ghat — it begins in the kitchen. On Nahay Khay the entire house is washed down: floors, walls, vessels, the stove. Anything that touched onion, garlic or meat is scrubbed or set aside for four days. In many homes a fresh clay stove is built just for the prasad.",
        hi: "छठ घाट से नहीं, रसोई से शुरू होता है। नहाय खाय के दिन पूरा घर धोया जाता है — फ़र्श, दीवारें, बर्तन, चूल्हा। जिस चीज़ ने प्याज़, लहसुन या माँस छुआ हो, उसे या तो माँजा जाता है या चार दिन के लिए अलग रख दिया जाता है। कई घरों में प्रसाद के लिए नया मिट्टी का चूल्हा बनाया जाता है।",
        bho: "छठ घाट से ना, रसोई से सुरू होला। नहाय खाय के दिन पूरा घर धोवल जाला — फरस, देवाल, बरतन, चूल्हा। जवन चीज पियाज, लहसुन भा माँस छुअले होखे, ओकरा के या त माँजल जाला या चार दिन खातिर अलगा राख दिहल जाला। कतने घर में परसाद खातिर नया माटी के चूल्हा बनेला।",
      },
      {
        en: "Then the vrati goes to the river — the Ganga if it is near, any clean water body if not. She bathes, and carries water back home in a clean vessel. That water will be used for cooking the prasad. From this moment she does not eat anything cooked by anyone else.",
        hi: "फिर व्रती नदी जाती हैं — गंगा पास हो तो गंगा, वरना कोई भी साफ़ जलाशय। स्नान करके साफ़ बर्तन में पानी घर लाती हैं। उसी पानी से प्रसाद बनेगा। इस पल के बाद वो किसी और के हाथ का बना कुछ नहीं खातीं।",
        bho: "तब बरती नदी जाली — गंगा लगे होखे त गंगा, ना त कवनो साफ जलासय। असनान क के साफ बरतन में पानी घरे लावेली। ओहि पानी से परसाद बनी। एह पल के बाद ऊ केहू दोसरा के हाथ के बनल कुछो ना खाली।",
      },
      {
        en: "The meal itself is deliberately plain: arwa rice, chana dal and lauki or kaddu, cooked without onion, garlic or even salt in some homes. Everyone in the family eats it together, sitting on the floor. It tastes of almost nothing and everyone remembers it for a lifetime.",
        hi: "भोजन जानबूझकर सादा होता है: अरवा चावल, चना दाल और लौकी या कद्दू — बिना प्याज़, बिना लहसुन, कई घरों में बिना नमक के। पूरा परिवार ज़मीन पर बैठकर साथ खाता है। स्वाद लगभग कुछ नहीं होता, और याद ज़िंदगी भर रहती है।",
        bho: "भोजन जान के सादा होला: अरवा चाउर, चना दाल आ लउकी भा कद्दू — बिना पियाज, बिना लहसुन, कतने घर में बिना नून के। पूरा परिवार जमीन पर बइठ के साथे खाला। सवाद लगभग कुछो ना होला, आ इयाद जिनगी भर रहेला।",
      },
      {
        en: "By evening the house smells of wet floor and fresh bamboo. The soop and daura are bought or brought down from the loft, the sugarcane is stacked in a corner, and the wheat for thekua is cleaned — often ground at home so no machine dust touches it.",
        hi: "शाम तक घर से गीले फ़र्श और ताज़े बाँस की महक आती है। सूप और दउरा या तो ख़रीदे जाते हैं या अटारी से उतारे जाते हैं, गन्ना कोने में लगा दिया जाता है, और ठेकुआ का गेहूँ साफ़ किया जाता है — अक्सर घर पर ही पीसा जाता है ताकि मशीन की धूल न लगे।",
        bho: "सांझ ले घर से भीजल फरस आ ताजा बाँस के महक आवेला। सूप आ दउरा या त कीनल जाला या अटारी से उतारल जाला, ईख कोना में लगा दिहल जाला, आ ठेकुआ के गोहूँ साफ कइल जाला — अकसर घरे पीसल जाला जेसे मसीन के धूर ना लागे।",
      },
    ],
    prasad: [
      { en: "Arwa rice (sun-dried, unboiled)", hi: "अरवा चावल", bho: "अरवा चाउर" },
      { en: "Chana dal", hi: "चना दाल", bho: "चना दाल" },
      { en: "Lauki / kaddu ki sabzi", hi: "लौकी / कद्दू की सब्ज़ी", bho: "लउकी / कद्दू के तरकारी" },
      { en: "No onion, no garlic, often no salt", hi: "न प्याज़, न लहसुन, अक्सर बिना नमक", bho: "ना पियाज, ना लहसुन, अकसर बिना नून" },
    ],
    points: [
      {
        label: { en: "Tithi", hi: "तिथि", bho: "तिथि" },
        text: { en: "Kartik Shukla Chaturthi", hi: "कार्तिक शुक्ल चतुर्थी", bho: "कातिक सुकुल चउथ" },
      },
      {
        label: { en: "The rule", hi: "नियम", bho: "नियम" },
        text: {
          en: "One meal only, cooked by the vrati herself, eaten after the bath.",
          hi: "सिर्फ़ एक बार भोजन, व्रती के अपने हाथ का बना, स्नान के बाद।",
          bho: "खाली एक बेर भोजन, बरती के आपन हाथ के बनल, असनान के बाद।",
        },
      },
      {
        label: { en: "From today", hi: "आज से", bho: "आज से" },
        text: {
          en: "The vrati sleeps on the floor — no bed, no mattress, until parana.",
          hi: "व्रती ज़मीन पर सोती हैं — न बिस्तर, न गद्दा, पारण तक।",
          bho: "बरती जमीन पर सुतेली — ना बिछउना, ना गद्दा, पारन तक।",
        },
      },
    ],
    geet: {
      line: {
        en: "Kekra khatir naa, kekra khatir naa…",
        hi: "केकरा खातिर ना, केकरा खातिर ना…",
        bho: "केकरा खातिर ना, केकरा खातिर ना…",
      },
      note: {
        en: "The songs of this day are about preparation — who is all this being done for.",
        hi: "इस दिन के गीत तैयारी के हैं — यह सब किसके लिए किया जा रहा है।",
        bho: "एह दिन के गीत तइयारी के ह — ई सब केकरा खातिर कइल जात बा।",
      },
    },
  },

  /* ------------------------------------------------------------------ */
  kharna: {
    summary: {
      en: "A fast from dawn to dusk, broken with rasiao-kheer — and then the 36 hours without water begin.",
      hi: "सूरज निकलने से डूबने तक उपवास, रसियाव-खीर से पारण — और फिर छत्तीस घंटे बिना पानी के शुरू।",
      bho: "सुरुज निकले से डूबे तक उपास, रसियाव-खीर से पारन — आ फेर छत्तीस घंटा बिना पानी के सुरू।",
    },
    paras: [
      {
        en: "Kharna is the quiet day, and the hardest one emotionally. The vrati fasts the whole day — no food, no water — while cooking for everyone else. The house fills with the smell of jaggery boiling in milk and nobody is allowed to taste it.",
        hi: "खरना शांत दिन है, और भावनात्मक रूप से सबसे कठिन। व्रती पूरे दिन उपवास रखती हैं — न अन्न, न जल — और उसी हालत में सबके लिए पकाती हैं। घर गुड़ और दूध की महक से भर जाता है और किसी को चखने की इजाज़त नहीं।",
        bho: "खरना सांत दिन ह, आ मन से सबसे कठिन। बरती पूरा दिन उपास राखेली — ना अन्न, ना जल — आ ओहि हालत में सबका खातिर पकावेली। घर गुड़ आ दूध के महक से भर जाला आ केहू के चीखे के इजाजत ना।",
      },
      {
        en: "After sunset the prasad is offered to Chhathi Maiya first — rasiao-kheer made of rice, jaggery and milk, with roti and a banana. Only then does the vrati eat, sitting alone in a quiet room. The family waits outside; no one speaks loudly, no one enters.",
        hi: "सूर्यास्त के बाद प्रसाद पहले छठी मैया को अर्पित होता है — चावल, गुड़ और दूध की रसियाव-खीर, रोटी और केला। उसके बाद ही व्रती एक शांत कमरे में अकेले बैठकर खाती हैं। परिवार बाहर इंतज़ार करता है; कोई ज़ोर से नहीं बोलता, कोई अंदर नहीं जाता।",
        bho: "सुरुज डूबला के बाद परसाद पहिले छठी मइया के चढ़ेला — चाउर, गुड़ आ दूध के रसियाव-खीर, रोटी आ केरा। ओकरा बाद ही बरती एगो सांत कोठरी में अकेले बइठ के खाली। परिवार बहरी अगोरेला; केहू जोर से ना बोले, केहू भीतर ना जाव।",
      },
      {
        en: "The moment she finishes and rinses her mouth, the nirjala vrat begins — thirty-six hours with not one drop of water, through a whole night, a whole day, a second night, until the sun rises on the fourth morning. Nothing in the Hindu calendar asks for more.",
        hi: "जैसे ही वो खाकर कुल्ला करती हैं, निर्जला व्रत शुरू हो जाता है — छत्तीस घंटे, पानी की एक बूँद नहीं, एक पूरी रात, एक पूरा दिन, दूसरी रात, चौथी सुबह सूरज उगने तक। हिंदू पंचांग में इससे ज़्यादा कोई व्रत नहीं माँगता।",
        bho: "जइसहीं ऊ खा के कुल्ला करेली, निरजला बरत सुरू हो जाला — छत्तीस घंटा, पानी के एक बूँद ना, एगो पूरा रात, एगो पूरा दिन, दोसर रात, चउथा भोर सुरुज उगे ले। हिंदू पंचांग में एकरा से जादे कवनो बरत ना माँगे।",
      },
      {
        en: "That night nobody really sleeps. Thekua is fried in ghee till past midnight, the soop is washed and dried, sugarcane is cut and tied in pairs, and the geet play softly from a phone in the corner of the kitchen.",
        hi: "उस रात कोई ठीक से नहीं सोता। आधी रात के बाद तक घी में ठेकुआ तला जाता है, सूप धोकर सुखाया जाता है, गन्ना काटकर जोड़े में बाँधा जाता है, और रसोई के कोने में फ़ोन पर धीमे-धीमे गीत बजते रहते हैं।",
        bho: "ओह रात केहू ठीक से ना सुते। आधा रात के बाद ले घीव में ठेकुआ तलल जाला, सूप धो के सुखावल जाला, ईख काट के जोड़ा में बान्हल जाला, आ रसोई के कोना में फोन पर धीरे-धीरे गीत बाजत रहेला।",
      },
    ],
    prasad: [
      { en: "Rasiao-kheer (rice, jaggery, milk)", hi: "रसियाव-खीर (चावल, गुड़, दूध)", bho: "रसियाव-खीर (चाउर, गुड़, दूध)" },
      { en: "Roti made on a clay stove", hi: "मिट्टी के चूल्हे की रोटी", bho: "माटी के चूल्हा के रोटी" },
      { en: "Banana and seasonal fruit", hi: "केला और मौसमी फल", bho: "केरा आ मउसमी फल" },
      { en: "A ghee lamp on the offering", hi: "अर्घ्य पर घी का दीया", bho: "अरघ पर घीव के दीया" },
    ],
    points: [
      {
        label: { en: "Tithi", hi: "तिथि", bho: "तिथि" },
        text: { en: "Kartik Shukla Panchami", hi: "कार्तिक शुक्ल पंचमी", bho: "कातिक सुकुल पंचमी" },
      },
      {
        label: { en: "Fast breaks", hi: "पारण", bho: "पारन" },
        text: {
          en: "After sunset, only after the prasad is offered to Chhathi Maiya.",
          hi: "सूर्यास्त के बाद, छठी मैया को अर्पित करने के बाद ही।",
          bho: "सुरुज डूबला के बाद, छठी मइया के चढ़वला के बाद ही।",
        },
      },
      {
        label: { en: "Then begins", hi: "फिर शुरू", bho: "फेर सुरू" },
        text: {
          en: "The 36-hour nirjala vrat — no food, and not one drop of water.",
          hi: "छत्तीस घंटे का निर्जला व्रत — न अन्न, न पानी की एक बूँद।",
          bho: "छत्तीस घंटा के निरजला बरत — ना अन्न, ना पानी के एक बूँद।",
        },
      },
    ],
    geet: {
      line: {
        en: "Jode jode falwa, chhathi maiya ke ghate…",
        hi: "जोड़े जोड़े फलवा, छठी मइया के घाटे…",
        bho: "जोड़े जोड़े फलवा, छठी मइया के घाटे…",
      },
      note: {
        en: "Kharna songs are about the offering being readied — fruit tied in pairs, the daura being filled.",
        hi: "खरना के गीत अर्घ्य की तैयारी के हैं — जोड़े में बँधे फल, भरता हुआ दउरा।",
        bho: "खरना के गीत अरघ के तइयारी के ह — जोड़ा में बान्हल फल, भरत दउरा।",
      },
    },
  },

  /* ------------------------------------------------------------------ */
  "sandhya-argh": {
    summary: {
      en: "The main day. The whole village walks to the ghat and offers arghya to the setting sun, standing in the water.",
      hi: "मुख्य दिन। पूरा गाँव घाट तक जाता है और पानी में खड़े होकर डूबते सूर्य को अर्घ्य देता है।",
      bho: "मुख्य दिन। पूरा गाँव घाट तक जाला आ पानी में ठाढ़ होके डूबत सुरुज के अरघ देला।",
    },
    paras: [
      {
        en: "By afternoon the daura is packed: thekua on the bottom, then kasar, then the fruit — banana in the whole bunch, coconut, sugarcane, singhada, sweet lime. The daura goes on a man's head, barefoot, and the family walks. Nobody drives if the ghat can be walked to.",
        hi: "दोपहर तक दउरा भर जाता है: सबसे नीचे ठेकुआ, फिर कसार, फिर फल — केले का पूरा घौद, नारियल, गन्ना, सिंघाड़ा, मौसमी। दउरा किसी पुरुष के सिर पर जाता है, नंगे पाँव, और परिवार पैदल चलता है। अगर घाट पैदल जाया जा सके तो कोई गाड़ी नहीं लेता।",
        bho: "दुपहरिया ले दउरा भर जाला: सबसे नीचे ठेकुआ, फेर कसार, फेर फल — केरा के पूरा घउद, नरियर, ईख, सिंघाड़ा, मउसमी। दउरा कवनो मरद के माथा पर जाला, नंगे गोड़, आ परिवार पैदल चलेला। अगर घाट पैदल जाइल जा सके त केहू गाड़ी ना लेव।",
      },
      {
        en: "At the ghat the sugarcane is planted in pairs and bent into an arch over the offering, a lamp is lit beneath it, and the soop is filled. Then the vrati walks into the river — in November, in cold water, often up to the waist — and stands facing the sun.",
        hi: "घाट पर गन्ना जोड़े में गाड़कर अर्घ्य के ऊपर मंडप बनाया जाता है, नीचे दीया जलता है, और सूप भरा जाता है। फिर व्रती नदी में उतरती हैं — नवंबर में, ठंडे पानी में, अक्सर कमर तक — और सूरज की ओर मुँह करके खड़ी हो जाती हैं।",
        bho: "घाट पर ईख जोड़ा में गाड़ के अरघ के ऊपर मंडप बनेला, नीचे दीया जरेला, आ सूप भरल जाला। फेर बरती नदी में उतरेली — नवंबर में, ठंडा पानी में, अकसर कमर ले — आ सुरुज के ओर मुँह क के ठाढ़ हो जाली।",
      },
      {
        en: "As the sun touches the horizon, milk and water are poured from the soop as arghya. This is the moment the whole festival is built around — and it is offered to a sun that is leaving, not arriving. Thank you for the day that is finishing; that is the entire prayer.",
        hi: "जैसे ही सूरज क्षितिज को छूता है, सूप से दूध और जल अर्घ्य के रूप में अर्पित किया जाता है। पूरा पर्व इसी क्षण के इर्द-गिर्द बना है — और यह उस सूरज को दिया जाता है जो जा रहा है, आ नहीं रहा। जो दिन बीत गया उसका धन्यवाद; बस इतनी ही प्रार्थना है।",
        bho: "जइसहीं सुरुज छितिज के छूवेला, सूप से दूध आ जल अरघ के रूप में चढ़ेला। पूरा परब एहि छन के चारो ओर बनल बा — आ ई ओह सुरुज के दिहल जाला जे जात बा, आवत ना। जे दिन बीत गइल ओकर धन्यवाद; बस एतने परारथना ह।",
      },
      {
        en: "Then the diyas are floated. Hundreds of them, from every family, drifting on dark water while the geet rise from every side of the ghat. People who have not met all year meet here, standing in the same river, and go home together in the dark.",
        hi: "फिर दीये बहाए जाते हैं। सैकड़ों — हर परिवार के — काले पानी पर बहते हुए, और घाट के हर कोने से गीत उठते हुए। साल भर से न मिले लोग यहीं मिलते हैं, उसी नदी में खड़े, और अँधेरे में साथ घर लौटते हैं।",
        bho: "फेर दीया बहावल जाला। सैकड़ो — हर परिवार के — करिया पानी पर बहत, आ घाट के हर कोना से गीत उठत। साल भर से ना मिलल लोग इहे मिलेला, ओहि नदी में ठाढ़, आ अन्हार में साथे घर लवटेला।",
      },
    ],
    prasad: [
      { en: "Thekua — the main prasad", hi: "ठेकुआ — मुख्य प्रसाद", bho: "ठेकुआ — मुख्य परसाद" },
      { en: "Kasar / khajuria", hi: "कसार / खजुरिया", bho: "कसार / खजुरिया" },
      { en: "Sugarcane, tied in pairs", hi: "गन्ना, जोड़े में बँधा", bho: "ईख, जोड़ा में बान्हल" },
      { en: "Coconut, banana bunch, singhada", hi: "नारियल, केले का घौद, सिंघाड़ा", bho: "नरियर, केरा के घउद, सिंघाड़ा" },
      { en: "Milk and water for the arghya", hi: "अर्घ्य के लिए दूध और जल", bho: "अरघ खातिर दूध आ जल" },
    ],
    points: [
      {
        label: { en: "Tithi", hi: "तिथि", bho: "तिथि" },
        text: {
          en: "Kartik Shukla Shashthi · Surya Shashthi — the main day",
          hi: "कार्तिक शुक्ल षष्ठी · सूर्य षष्ठी — मुख्य दिन",
          bho: "कातिक सुकुल सस्ठी · सुरुज सस्ठी — मुख्य दिन",
        },
      },
      {
        label: { en: "Arghya time", hi: "अर्घ्य का समय", bho: "अरघ के समय" },
        text: {
          en: "At your own city's sunset. Patna ~5:00 PM, Delhi ~5:27 PM, Kolkata ~4:52 PM, Mumbai ~6:00 PM.",
          hi: "अपने शहर के सूर्यास्त पर। पटना ~5:00 PM, दिल्ली ~5:27 PM, कोलकाता ~4:52 PM, मुंबई ~6:00 PM।",
          bho: "आपन सहर के सुरुज डूबे पर। पटना ~5:00 PM, दिल्ली ~5:27 PM, कलकत्ता ~4:52 PM, मुंबई ~6:00 PM।",
        },
      },
      {
        label: { en: "Remember", hi: "ध्यान रखें", bho: "इयाद राखीं" },
        text: {
          en: "Barefoot from home to the ghat. No one's foot should touch the daura or the soop.",
          hi: "घर से घाट तक नंगे पाँव। दउरा या सूप को किसी का पैर न छुए।",
          bho: "घर से घाट ले नंगे गोड़। दउरा भा सूप के केहू के गोड़ ना छुए।",
        },
      },
    ],
    geet: {
      line: {
        en: "Kaanch hi baans ke bahangiya, bahangi lachkat jaay…",
        hi: "काँच ही बाँस के बहंगिया, बहंगी लचकत जाय…",
        bho: "काँच ही बाँस के बहंगिया, बहंगी लचकत जाय…",
      },
      note: {
        en: "The most recognisable Chhath geet there is — the bending bamboo pole carrying the offering to the ghat.",
        hi: "सबसे पहचाना जाने वाला छठ गीत — बाँस की बहंगी जो अर्घ्य लेकर घाट तक जाती है।",
        bho: "सबसे पहचानल जाए वाला छठ गीत — बाँस के बहंगी जे अरघ लेके घाट ले जाला।",
      },
    },
  },

  /* ------------------------------------------------------------------ */
  "usha-argh": {
    summary: {
      en: "Back at the ghat before dawn. Arghya to the rising sun, and only then does the fast break.",
      hi: "भोर से पहले फिर घाट पर। उगते सूर्य को अर्घ्य, और उसके बाद ही व्रत खुलता है।",
      bho: "भोर से पहिले फेर घाट पर। उगत सुरुज के अरघ, आ ओकरा बाद ही बरत खुलेला।",
    },
    paras: [
      {
        en: "People leave home at three or four in the morning. It is dark, it is cold, and the vrati has now gone about thirty hours without water. The ghat fills again in the dark — torches, lamps, the same families, everyone facing east and waiting.",
        hi: "लोग रात तीन-चार बजे घर से निकलते हैं। अँधेरा है, ठंड है, और व्रती को अब तक लगभग तीस घंटे बिना पानी के हो चुके हैं। घाट अँधेरे में फिर भर जाता है — टॉर्च, दीये, वही परिवार, सब पूरब की ओर मुँह किए इंतज़ार में।",
        bho: "लोग रात तीन-चार बजे घर से निकलेला। अन्हार बा, जाड़ा बा, आ बरती के अब ले लगभग तीस घंटा बिना पानी के हो गइल बा। घाट अन्हार में फेर भर जाला — टॉर्च, दीया, उहे परिवार, सब पूरब ओर मुँह क के अगोरत।",
      },
      {
        en: "There is no impatience in that wait. The geet go on, the water is black, and slowly the sky behind the far bank turns grey, then pink, then orange. The first sliver of the sun comes up and the entire ghat raises its soop at once.",
        hi: "उस इंतज़ार में कोई बेसब्री नहीं होती। गीत चलते रहते हैं, पानी काला रहता है, और धीरे-धीरे उस पार का आसमान स्लेटी, फिर गुलाबी, फिर नारंगी होता जाता है। सूरज की पहली किरण निकलती है और पूरा घाट एक साथ सूप उठा देता है।",
        bho: "ओह अगोरला में कवनो बेसबरी ना होखे। गीत चलत रहेला, पानी करिया रहेला, आ धीरे-धीरे ओह पार के अकास सलेटी, फेर गुलाबी, फेर नारंगी होखत जाला। सुरुज के पहिला किरिन निकलेला आ पूरा घाट एके साथे सूप उठा देला।",
      },
      {
        en: "Arghya is offered to the rising sun, the vrati touches the water to her head, and the vrat is over. She drinks water first — usually from the hand of a child in the family — and eats a piece of thekua and a little ginger. Thirty-six hours end on a crumb of wheat and jaggery.",
        hi: "उगते सूर्य को अर्घ्य दिया जाता है, व्रती जल को सिर से लगाती हैं, और व्रत पूरा होता है। सबसे पहले वो पानी पीती हैं — आमतौर पर घर के किसी बच्चे के हाथ से — और ठेकुआ का एक टुकड़ा और थोड़ा अदरक खाती हैं। छत्तीस घंटे का अंत गेहूँ और गुड़ के एक टुकड़े पर होता है।",
        bho: "उगत सुरुज के अरघ दिहल जाला, बरती जल के माथा से लगावेली, आ बरत पूरा होला। सबसे पहिले ऊ पानी पीयेली — अकसर घर के कवनो बच्चा के हाथ से — आ ठेकुआ के एगो टुकड़ा आ थोड़ा अदरक खाली। छत्तीस घंटा के अंत गोहूँ आ गुड़ के एगो टुकड़ा पर होला।",
      },
      {
        en: "Then the prasad is distributed — to everyone on the ghat, known or unknown, whoever puts out a hand. Nobody asks who you are or where you are from. The daura goes home almost empty, and Chhathi Maiya is sent off for the year.",
        hi: "फिर प्रसाद बँटता है — घाट पर मौजूद हर किसी को, जान-पहचान हो या न हो, जो भी हाथ बढ़ा दे। कोई नहीं पूछता आप कौन हैं, कहाँ के हैं। दउरा घर लगभग ख़ाली लौटता है, और छठी मैया को साल भर के लिए विदा किया जाता है।",
        bho: "फेर परसाद बँटेला — घाट पर मउजूद हर केहू के, जान-पहचान होखे भा ना, जे भी हाथ बढ़ा देव। केहू ना पूछे रउआ के बानी, कहाँ के बानी। दउरा घर लगभग खाली लवटेला, आ छठी मइया के साल भर खातिर बिदा कइल जाला।",
      },
    ],
    prasad: [
      { en: "Thekua from the evening before", hi: "पिछली शाम का ठेकुआ", bho: "पिछला सांझ के ठेकुआ" },
      { en: "Sugarcane juice", hi: "गन्ने का रस", bho: "ईख के रस" },
      { en: "Ginger and water — the first thing after the vrat", hi: "अदरक और जल — व्रत के बाद पहली चीज़", bho: "अदरक आ जल — बरत के बाद पहिला चीज" },
      { en: "Kheer kept from Kharna", hi: "खरना की बची खीर", bho: "खरना के बचल खीर" },
    ],
    points: [
      {
        label: { en: "Tithi", hi: "तिथि", bho: "तिथि" },
        text: { en: "Kartik Shukla Saptami", hi: "कार्तिक शुक्ल सप्तमी", bho: "कातिक सुकुल सतमी" },
      },
      {
        label: { en: "Arghya time", hi: "अर्घ्य का समय", bho: "अरघ के समय" },
        text: {
          en: "At your city's sunrise. Patna ~6:08 AM, Delhi ~6:44 AM, Kolkata ~5:51 AM, Mumbai ~6:47 AM.",
          hi: "अपने शहर के सूर्योदय पर। पटना ~6:08 AM, दिल्ली ~6:44 AM, कोलकाता ~5:51 AM, मुंबई ~6:47 AM।",
          bho: "आपन सहर के सुरुज उगे पर। पटना ~6:08 AM, दिल्ली ~6:44 AM, कलकत्ता ~5:51 AM, मुंबई ~6:47 AM।",
        },
      },
      {
        label: { en: "Paran", hi: "पारण", bho: "पारन" },
        text: {
          en: "The fast breaks only after this arghya — about 36 hours without water.",
          hi: "व्रत इसी अर्घ्य के बाद खुलता है — लगभग छत्तीस घंटे बिना पानी के।",
          bho: "बरत एहि अरघ के बाद खुलेला — लगभग छत्तीस घंटा बिना पानी के।",
        },
      },
    ],
    geet: {
      line: {
        en: "Uga ho Suraj dev, bhaile arghya ke ber…",
        hi: "उगs हो सूरज देव, भइले अरघ के बेर…",
        bho: "उगs हो सुरुज देव, भइले अरघ के बेर…",
      },
      note: {
        en: "A direct call to the sun to rise — the arghya is ready and the ghat is waiting.",
        hi: "सूरज से सीधी पुकार कि उगो — अर्घ्य तैयार है और घाट इंतज़ार में है।",
        bho: "सुरुज से सीधा पुकार कि उगीं — अरघ तइयार बा आ घाट अगोरत बा।",
      },
    },
  },
};
