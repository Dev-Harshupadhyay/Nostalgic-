/**
 * Written notes for the Chhath Puja page.
 *
 * Chhath is the heart of Bihar's culture — the page should read like someone
 * from there is telling you about it, not like a song index.
 */

export const CHHATH_INTRO = {
  eyebrow: "Bihar ki aatma",
  title: "Chhath Puja",
  lead:
    "Duniya ka shayad ekmatra parv jahan doobte hue sooraj ko bhi utni hi shraddha se argh diya jaata hai jitni ugte hue ko.",
  body:
    "Chhath sirf ek tyohaar nahi — ye Bihar ki pehchaan hai. Char din ka ye mahaparv bina kisi pandit, bina kisi murti, bina kisi dikhawe ke hota hai. Sirf nadi ka paani, baans ka soop, thekua ki khushbu aur maa ki 36 ghante ki nirjala vrat. Jo bhi pardes me hai, Chhath ke dinon me uska dil ghar hi hota hai.",
};

export const CHHATH_RITUALS = [
  {
    day: "Pehla din",
    name: "Nahay Khay",
    text:
      "Ghar ki safai, Ganga snan, aur ek hi waqt ka satvik bhojan — kaddu-bhaat, chana dal, arwa chawal. Yahin se char din ki pavitrata shuru hoti hai.",
  },
  {
    day: "Doosra din",
    name: "Kharna",
    text:
      "Din bhar ka upvaas, shaam ko gud ki kheer aur roti ka prasad. Jo ye prasad chakh le, wo poori zindagi uska swad nahi bhoolta. Iske baad shuru hota hai 36 ghante ka nirjala vrat.",
  },
  {
    day: "Teesra din",
    name: "Sandhya Argh",
    text:
      "Ghat par poora gaon. Soop me thekua, kela, nariyal, gannna. Kamar tak paani me khadi vratis doobte Suryadev ko argh deti hain — Chhathi Maiya ke geet, shankh aur dhoop ka dhuaan.",
  },
  {
    day: "Chautha din",
    name: "Usha Argh & Paran",
    text:
      "Andhere me hi ghat par pahunchna, pehli kiran ka intezaar. Ugte sooraj ko argh dekar vrat khulta hai. Prasad baantne me jaat-paat, ameer-gareeb ka koi bhed nahi — sab ek hi ghat par.",
  },
];

export const CHHATH_NOTES: Record<string, { tagline: string; story: string }> = {
  "Chhath Geet": {
    tagline: "Jo sunte hi ghar yaad aa jaaye",
    story:
      "\"Kelva ke paat par\", \"Marbo re sugwa\", \"Ugi he Suraj dev\" — ye geet kisi studio me nahi bane, ye maaon aur daadiyon ki awaaz se peedhi dar peedhi chale aa rahe hain. Sharda Sinha ki awaaz to Chhath ki pehchaan hi ban gayi.",
  },
  "Traditional Chhath": {
    tagline: "Bina kisi badlav ke, sadiyon se wahi",
    story:
      "Na koi remix, na koi beat. Sirf dholak, jhaal aur samuhik awaaz. Ghat par jab saari auratein ek saath ye geet gaati hain, to lagta hai poora Bihar ek hi surr me gaa raha ho.",
  },
  "Popular Chhath Songs": {
    tagline: "Har ghat, har gaon me bajne wale",
    story:
      "Chhath aate hi ye gaane har gali, har chowk, har ghar ke aangan me baj'ne lagte hain. Pardes me rehne walon ke liye to yahi gaane ghar ka rasta hain.",
  },
  "Chhath Bhajan": {
    tagline: "Chhathi Maiya ke charnon me",
    story:
      "Suryadev aur Chhathi Maiya ki aaradhana. Koi jatil mantra nahi — sidhi saadi bhasha me maang: ghar me sukh rahe, bachche khush rahein, aangan bhara rahe.",
  },
  "Chhath Special": {
    tagline: "Is saal ke liye khaas",
    story:
      "Naye kalakaaron ki awaaz me wahi purani aastha. Parampara badalti nahi, bas nayi awaazein usme judti jaati hain.",
  },
  "Latest Chhath Songs": {
    tagline: "Nayi awaazein, wahi purani aastha",
    story:
      "Har saal Chhath se pehle naye geet aate hain — lekin shabd wahi, bhaav wahi. Ye hai parampara ka zinda hona.",
  },
};

export const CHHATH_FACTS = [
  { k: "4", v: "din ka mahaparv" },
  { k: "36", v: "ghante nirjala vrat" },
  { k: "2", v: "argh — doobte aur ugte sooraj ko" },
  { k: "0", v: "pandit, murti ya dikhawa" },
];
