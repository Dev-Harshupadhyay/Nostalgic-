# Deploy

**Live site: https://nostalgic-xwa6.onrender.com**
Host: **Render** (free tier). Har `main` push par apne aap deploy ho jata hai.

---

## Render (current host)

### Settings

| Setting | Value |
|---|---|
| Environment | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Branch | `main` |
| Node Version | 20 |

### Environment Variables

| Name | Value | Zaroori? |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://nostalgic-xwa6.onrender.com` | SEO/share preview ke liye |
| `YOUTUBE_API_KEY` | (YouTube Data API v3 key) | **Optional** — abhi zaroorat nahi |

`YOUTUBE_API_KEY` ke aage `NEXT_PUBLIC_` **kabhi mat lagana** — wo key browser mein leak kar dega.

**Note:** keyless search Render ke datacenter IPs se theek chal raha hai (verified: 20 results,
`source: youtube-public`). Agar kabhi aage YouTube block kare aur results khaali aayein, tab
`YOUTUBE_API_KEY` add kar dena — `lib/youtube.server.ts` khud official API tier pe switch ho jayega.

### Free tier ki ek baat

15 minute tak koi visitor na aaye toh app **so jaata hai**. Uske baad pehli request ~50 second
leti hai, phir normal. Kisi ko demo dena ho toh ek minute pehle site khol ke jaga lena.

---

## ⚠️ Vercel pe kyun nahi chala (yaad rakhne ke liye)

Vercel pe project import kiya tha, deploy ban bhi rahe the — par `Initializing` / `Queued` pe hi
atke rehte the, kabhi build nahi hote the. Dashboard mein error ye tha:

```
⚠️ GitHub user not found
   Commit Author   dev.harshupadhyay@users.noreply.github.com
   GitHub User     Harsh Dev
   Vercel Account  Unavailable
```

**Wajah:** Vercel **Hobby (free) plan** pe commit author ka email Vercel account se match hona
chahiye. Match na ho toh build silently block ho jaata hai — na error mail, na dashboard pe saaf
message. Kuch commits `noreply` email se the, isliye sab ruk gaye. Blocked deployments queue mein
jam bhi gaye the (Hobby pe ek waqt mein sirf 1 build chalta hai).

**Isiliye** ab commits `harsh48227@gmail.com` se hote hain. Kabhi Vercel pe wapas jaana ho toh:

```bash
git config user.email "harsh48227@gmail.com"
```

Render mein ye restriction hai hi nahi — koi bhi author ho, deploy ho jaata hai.

---

## Deploy ke baad check karne layak

1. `/live` tab — koi gaana search karke dekho, turant bajna chahiye
2. Welcome dialog — pehli baar naam poochhta hai
   Dobara test karna ho toh console mein:
   ```js
   Object.keys(localStorage).filter(k => k.startsWith("nostalgic:")).forEach(k => localStorage.removeItem(k))
   ```
3. `My Playlist` tab — public YouTube playlist paste karke full list fetch/play check karo; private list par Public karne wala error aana chahiye
4. Telegram notice — onboarding ke baad sirf ek baar dikhe, QR/button official channel khole, aur 5 seconds mein close ho
5. Support section — mobile pe UPI deep link khulta hai, desktop pe QR popup
6. Asli phone pe ek gaana chala ke lock screen ke play/pause/next check karna

---

## Custom domain

Render dashboard → Settings → Custom Domains → domain add karo → jo DNS records Render bataye
wo registrar pe daal do. Uske baad `NEXT_PUBLIC_SITE_URL` bhi naye domain pe update kar dena.
