# Deploy karne ka tareeka (Vercel)

Ye ek baar ka setup hai. Iske baad har `git push` par Vercel khud deploy karega.

## 1. Repo import karo

1. https://vercel.com/new khol
2. GitHub se login karo (wahi account jisme `Dev-Harshupadhyay` hai)
3. Agar repo list mein na dikhe → **Adjust GitHub App Permissions** → `Nostalgic-` ko access do
4. `Nostalgic-` ke saamne **Import** dabao

## 2. Settings (sab default chhod do)

Vercel khud detect kar lega:

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Build Command | `next build` (default) |
| Output Directory | (default, khaali) |
| Install Command | `npm install` (default) |
| Node Version | 20.x |

Kuch bhi manually change karne ki zaroorat nahi.

## 3. Environment Variables

Import screen par hi **Environment Variables** section mein ye daalo:

| Name | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://<tumhara-project>.vercel.app` | Production, Preview, Development |

- Pehli baar URL pata nahi hoga — koi baat nahi. Deploy hone do, Vercel jo URL de wo copy karke
  **Settings → Environment Variables** mein daal do, phir **Deployments → ... → Redeploy**.
- Ye sirf SEO metadata, sitemap aur Open Graph image ke liye hai. Galat hone par site chalegi,
  bas share karne par preview card ka link galat aayega.

**`YOUTUBE_API_KEY` optional hai.** Nahi daaloge toh app keyless search use karegi (abhi bhi wahi chal rahi hai).
Daalna ho toh:

| Name | Value |
|---|---|
| `YOUTUBE_API_KEY` | (YouTube Data API v3 key) |

⚠️ Iske aage `NEXT_PUBLIC_` **kabhi mat lagana** — wo key browser mein leak kar dega.

## 4. Deploy

**Deploy** dabao. ~2 minute mein live.

---

## Autodeploy ab kaise chalega

Import hone ke baad:

- `main` branch pe push → **Production** deploy
- kisi aur branch / PR pe push → **Preview** deploy (alag URL)

Manually trigger karna ho toh: Vercel dashboard → Deployments → `...` → **Redeploy**.

---

## Deploy ke baad ye check karna

1. **Search aur Live Song tab** — sabse important. Vercel ke server datacenter IPs se chalte hain,
   aur YouTube in IPs pe keyless scraping ko kabhi-kabhi rate-limit ya block kar deta hai.
   Agar results khaali aayein ya "Music service is temporarily unavailable" dikhe, toh ye hi wajah hai.
   **Fix:** `YOUTUBE_API_KEY` add kar do — code khud official API tier pe switch ho jaata hai
   (`lib/youtube.server.ts` mein 3-tier fallback already hai).
   Local pe ye problem nahi aati, isliye sirf production pe hi pata chalegi.

2. **Playback** — asli phone pe ek gaana chala ke dekho. Lock screen pe play/pause/next aane chahiye.

3. **Welcome dialog** — pehli baar naam poochhega. Dobara test karna ho toh browser ka
   site data clear karo, ya console mein:
   ```js
   Object.keys(localStorage).filter(k => k.startsWith("nostalgic:")).forEach(k => localStorage.removeItem(k))
   ```

---

## Custom domain (optional)

Settings → Domains → domain add karo → DNS records jo Vercel bataye wo apne registrar pe daal do.
Uske baad `NEXT_PUBLIC_SITE_URL` bhi naye domain pe update kar dena.
