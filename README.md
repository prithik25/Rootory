<div align="center">

# 🌱 Rootory

### *Track growth. Share knowledge. Connect to markets.*

**Bit N Build 2026 — Track 3: Jan Jeevan**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-rootory--seven.vercel.app-4ade80?style=for-the-badge&logo=vercel)](https://rootory-seven.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-prithik25%2FRootory-24292e?style=for-the-badge&logo=github)](https://github.com/prithik25/Rootory)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## 🏆 Team Máximo\_Claudius

| Member | Role |
|---|---|
| **Prithik Fernandes** | Full-stack development, backend & AI integration |
| **Sanvi Naik Gaonkar** | UI/UX design, frontend implementation |
| **Sharya Mahambre** | Community features, QA & deployment |

---

## 🎯 Problem Statement

> *"Small-scale farmers and home gardeners need to manage several connected activities: tracking plant growth, responding to crop-health problems, learning from other growers, and finding buyers or agricultural supplies. However, information about these activities is often scattered across personal notes, messaging groups, weather apps, and separate marketplaces.*
>
> *This fragmentation makes it difficult to maintain a reliable plant-care history, get advice with the right context, learn from others' growing experiences, and discover relevant local trading opportunities. Growers may also miss nearby pest or disease reports that could prompt earlier inspection of their own plants.*
>
> **How might we help growers connect their plant-care records, community knowledge, and local market opportunities in one accessible platform so they can make better-informed decisions throughout the growing journey?**"

— Bit N Build 2026, Track 3: Jan Jeevan

---

## 💡 Our Solution

Rootory is a **mobile-first, installable PWA** where growers can:

| Pillar | What Rootory delivers |
|---|---|
| 🌱 **Track** | Plant profiles with photo diaries, watering/fertilizer/treatment logs, care reminders, and AI-assisted symptom observations |
| 🤝 **Learn & share** | Community board with progress updates, questions, and harvest stories; likes, comments, and saved posts |
| 📡 **Stay informed** | Gemini-powered symptom assessments with explicit uncertainty; live Open-Meteo weather; geofenced crop-health alerts reviewed by admins |
| 🛒 **Trade** | Produce and growing-supplies marketplace with private seller enquiries, saved listings, and availability management |

---

## 🗺️ Navigation — Exactly the Five Destinations

The app uses **exactly the five main destinations** specified in the problem statement:

| Screen | Primary action | What users see |
|---|---|---|
| **Home** | Log progress | Today's tasks, plant summaries, live weather, community preview |
| **My Plants** | Add plant | Plant cards with photo, stage, day count, and location |
| **Community** | Create post | Progress posts, questions, harvest stories — filtered by type or crop |
| **Market** | Create listing | Produce and growing supplies with enquiry flow |
| **Alerts** | Open related action | Care reminders, reviewed crop reports, weather notices |

On **mobile**: bottom tab navigation. On **desktop**: left sidebar. Profile and settings in the top corner. Each screen has **one obvious primary action**.

---

## ✅ Requirement Checklist

### Problem-Statement Requirements

| Requirement | Status | Implementation |
|---|---|---|
| Plant profiles with timeline | ✅ Built | `PlantForm`, `LogForm`, `ObservationNote`, plant detail view |
| Progress photos, watering, fertilizer, treatment, harvest entries | ✅ Built | 6 log types in `LogForm` |
| "Not assessed" / observation-date state (not silently healthy) | ✅ Built | Timeline shows "Observation" entries; no inferred health state |
| Private plant records by default | ✅ Built | RLS on `private_gardens`; explicit share-to-community button |
| Optional turn private update into community post | ✅ Built | "Share with community" button on every timeline entry |
| 3 post types: Progress update, Question, Harvest story | ✅ Built | `PostForm` type selector |
| Community: photo, crop tag, text, location, comments, likes, reporting | ✅ Built | Full post card with engagement actions |
| Marketplace: Produce and Growing supplies categories | ✅ Built | Category filter + `ListingForm` |
| Listing: photos, title, price, unit, quantity, location, delivery, seller | ✅ Built | Full `ListingForm` fields |
| Primary action "Send enquiry"; seller sees it in account | ✅ Built | `EnquiryForm` + `route_enquiry()` Postgres trigger |
| Seller can edit/remove/mark unavailable | ✅ Built | Edit listing + toggle Available/Unavailable from listing detail |
| Don't expose phone numbers | ✅ Built | Enquiries routed server-side; buyer never sees seller user ID |
| 3 notification categories: Care, Weather, Community | ✅ Built | `Notice` type with `category: "Care" | "Weather" | "Community"` |
| Notifications: timestamp, reason, read/unread, link to plant | ✅ Built | Full notification card with "View plant →" shortcut |
| Local crop alerts: crop + distance + recency matching | ✅ Built | `review_crop_report()` RPC — 10 km radius, 7-day recency |
| Admin screen: review/approve/reject crop reports | ✅ Built | `CropSafety` admin queue; `moderate_content()` for posts/listings |
| Admin permissions server-side only | ✅ Built | `admin_members` table; `is_rootory_admin()` RPC; no client elevation |
| Weather: source + last-updated time; dashboard works if weather fails | ✅ Built | Open-Meteo attribution, forecast time shown; graceful error state |
| AI assessment: visible symptoms, possible causes, what to inspect next, expert referral | ✅ Built | Gemini `gemini-3.6-flash` with Zod-validated structured output |
| No invented soil chemistry or treatment dosages from photos | ✅ Built | System prompt explicitly prohibits this |
| Blurry image → request better photo, not confident answer | ✅ Built | `usableImage: false` flag in AI response schema |
| Rate limits on expensive assessment requests | ✅ Built | `claim_plant_assessment()` RPC: 10/hour per account |
| Browse public posts/listings before sign-in | ✅ Built | Demo workspace with seed data; full UI visible without account |
| Installable PWA | ✅ Built | Service worker, web manifest, iOS apple-touch-icon |
| Offline app shell | ✅ Built | `/sw.js` caches shell; offline banner shown |
| Offline plant records accessible | ✅ Built | IndexedDB (`idb`) persists all data locally |
| Sync status visible | ✅ Built | Footer shows "Saving…" / "Saved to your account" / "Sync needs attention" |
| Authentication & server-side ownership checks | ✅ Built | Supabase Auth + RLS on every table |
| Upload validation + server-side protected keys | ✅ Built | Zod schema validation; GEMINI_API_KEY server-only; 3.1 MB limit |
| Approximate public locations | ✅ Built | Coordinates rounded to ~1 km before storage; locality names only |
| Report/delete controls | ✅ Built | Flag post, delete own post, admin moderation |
| Subscription page with "Register interest" | ✅ Built | Rootory Plus page; interest saved locally |
| Records export | ✅ Built | "Export my records" → `rootory-my-records.json` |
| Public GitHub repository | ✅ Built | https://github.com/prithik25/Rootory |
| README with setup, architecture, limitations, demo instructions | ✅ Built | This document |
| Deployed HTTPS URL | ✅ Live | https://rootory-seven.vercel.app/ |
| Seeded demo accounts + labelled sample content | ✅ Built | Full seed workspace loads without sign-in |

### Submission Assets Status

| Asset | Status |
|---|---|
| Public GitHub repository | ✅ Live |
| Deployed HTTPS URL | ✅ `https://rootory-seven.vercel.app/` |
| Seeded demo + sample content | ✅ Loads without login |
| Clear README | ✅ This document |
| Six-slide PPT | 🔲 Pending |
| Three-minute prototype video | 🔲 Pending |
| All links work without personal login | ✅ Verified |

---

## ✨ What Rootory Delivers — Complete Feature List

### 🏠 Overview Dashboard

- **Live stats** — plants in care, care moments logged, upcoming reminders
- **Today's care list** — reminders due today with one-click completion; completing auto-adds a "Care task" to the plant timeline
- **Plant preview** — two most recent plants with quick links
- **Community preview** — latest community post surfaced inline
- **Live weather** — real-time temperature, humidity, wind speed, rain probability (Open-Meteo)
- **Plant Check shortcut** — home-screen prompt to start an AI observation
- **Offline banner** — appears automatically when network is lost; local editing continues

---

### 🌿 My Plants — Full Plant Management

**Plant profile fields:**
- Plant name, crop/species, category (Vegetable / Herb / Other)
- Planting date → auto-computes "Day N" age
- Growing setting: Pot, Grow bag, Raised bed, Garden bed, Field, Greenhouse
- Quantity, growing location (free text), optional soil type
- Growth stage: Growing / Harvested
- Optional cover photo (Supabase Storage for accounts; base64 for demo)

**Timeline entry types:** Progress · Watering · Fertilizer · Treatment · Observation · Harvest · Care task

**On each timeline entry:**
- Date label (Today / Yesterday / "3 Sep")
- Optional photo
- AI entries rendered as structured cards: Visible Symptoms, Possible Causes, Uncertainty, Inspect Next, Consult Expert
- "Share with community" → pre-populates a post with the entry's text and photo

**Plant detail sidebar:**
- Per-plant reminders ("Up next")
- Soil moisture IoT panel (see below)
- Delete plant — removes plant, all entries, all reminders, all notifications

---

### 👥 Community — The Growing Circle

**3 post types** exactly as specified: Progress update · Question · Harvest story

**Engagement:** Like/unlike (live count) · Comments (persisted to Supabase) · Save/unsave posts · Report post

**Feed filters:** Latest · Progress · Questions · Harvests · Saved · Crop tags (Tomato / Basil / Lettuce / Mixed)

**Full-text search** across crop, body, and author name

**Transparency note shown on every community post:** "Posts and photos you share are visible to other signed-in growers. Community experiences are not verified agronomic advice."

---

### 🛒 Marketplace — From One Grower to Another

**Two categories exactly as specified:** Produce · Growing supplies

**Listing fields:** Title, category, price (₹), unit, quantity, location, delivery method, description, seller name, photo

**Listing management:** Edit, toggle Available/Unavailable from the listing detail modal

**Enquiry flow:**
- Buyer clicks "Send an enquiry" on any available listing
- Free-text message stored in Supabase
- Routed to seller server-side by `route_enquiry()` Postgres trigger — buyer never sees seller's user ID or contact
- "Enquiries" tab shows sent/received with direction labels

**Saved listings** sync to Supabase for account users (`saved_listings` table)

---

### 🔔 Notifications & Crop Safety Alerts

**Three notification categories** exactly as specified:

| Category | Trigger | Example |
|---|---|---|
| **Care** | User-set task | "Check soil moisture in the terrace garden" |
| **Weather** | Forecast-based | "Rain is forecast near your saved location" |
| **Community** | Reviewed crop report | "A nearby grower reported similar tomato symptoms" |

**Geofenced crop alert pipeline:**
1. Grower sets private alert area (coordinates rounded to 1 km precision, locality name only shown publicly)
2. Grower submits a crop report → goes to admin moderation queue
3. Admin reviews and Approves or Rejects
4. Approval triggers `review_crop_report()` Postgres RPC: finds all growers within **10 km** growing the same crop who registered an alert area, and creates in-app notifications for them — **reports older than 7 days are excluded**
5. Notified growers see the alert in their Notifications view

**Admin panel** (signed-in admins only):
- Review queue of all pending crop reports
- Approve (notify nearby growers) or Reject
- Content moderation: remove community posts, mark listings unavailable
- Admin access enforced server-side via `admin_members` table + `is_rootory_admin()` RPC

---

### 🤖 Plant Check — AI-Assisted Symptom Assessment

Powered by **Google Gemini** (`gemini-3.6-flash`). Conservative and transparent by design.

**Workflow:**
1. Select plant (or type any crop name)
2. Upload **close-up photo** of the affected area (only image sent to AI)
3. Optionally add a whole-plant context photo (stored locally, **never sent to Gemini**)
4. Describe observations in free text (up to 1,000 chars)
5. Server: validates session → checks hourly quota → resizes image with Sharp → sends to Gemini

**Structured output (Zod-validated):**

| Field | Description |
|---|---|
| `visibleSymptoms` | What is visible in the image (up to 8 bullets) |
| `possibleCauses` | Plausible causes, explicitly marked uncertain (up to 5) |
| `uncertainty` | What the model cannot determine |
| `inspectNext` | What to inspect next — low-risk, practical steps (up to 8) |
| `consultExpert` | When and where to seek expert help (KVK / agronomist / horticulturist) |
| `usableImage` | `false` if the image is blurry, not a plant, or unusable |

**What the AI never does** (enforced in system prompt):
- Never confirms a diagnosis
- Never provides pesticide names, dosages, or chemical recipes
- Never invents soil chemistry from photos
- Never claims access to historical or real-time data
- Blurry / unusable image → `usableImage: false` + request for a better photo

**Rate limiting:** 10 assessments/account/hour via server-side `claim_plant_assessment()` RPC (HTTP 429 when exhausted)

**After assessment:** Saved to the plant timeline as a structured "Observation" entry, displayed via `ObservationNote` with clearly labelled sections.

---

### 🌦️ Live Weather

Real-time via **Open-Meteo** (free, no vendor lock-in):
- Temperature (°C), humidity (%), wind speed (km/h), rain probability (current hour)
- **Source and last-updated time shown** — exactly as required
- Cities: Pune, Mumbai, Nashik, Bengaluru, Delhi + GPS ("Use my location")
- GPS coordinates rounded to 2 decimal places; never stored or shown to others
- **If weather fails, the rest of the dashboard keeps working** — weather is isolated in its own component

---

### 📡 IoT — Simulated Soil Moisture Sensor

A complete, working hardware integration path:

- **ESP32 + potentiometer** simulated in **Wokwi** (online circuit simulator)
- Sends an integer moisture reading (0–100) over **HTTPS** with TLS (Google Trust Services root CA)
- Next.js API validates a **device key** (64-char hex Bearer token): write-only, plant-scoped, 24-hour expiry, revocable
- Supabase RPC `ingest_sensor_reading()` enforces 5-second throttle, stores reading, auto-prunes
- In-app panel refreshes every 5 seconds; shows latest reading, band label (Low / Moderate / High), timestamps
- **Browser simulation slider** — the full IoT pipeline works in any browser without hardware

---

### ☁️ Cloud Account, Backup & Account Deletion

**Auth:** Email + password · Email OTP (magic link) · Password recovery at `/auth/confirm`

**Auto-sync:** Private garden with **revision-checked conflict detection** · Community posts · Marketplace listings · Enquiries · Saved listings — all through a 700ms debounced serial queue

**Visible sync status** in the page footer: "Saving…" / "Saved to your account" / "Sync needs attention"

**Account deletion (two-step):** Calls `delete_own_account()` RPC → deletes all rows across all tables + all Storage objects → signs out. Complete, irreversible, no orphan data.

---

### 🔍 Global Search & PWA

**Global search:** Searches plants, marketplace listings, and community posts simultaneously from any page.

**PWA:**
- Service worker caches app shell; `/auth/confirm` excluded to prevent stale tokens
- Web manifest with 180×180 iOS icon + standard Android/Chrome sizes
- `apple-touch-icon.png` for correct iPhone home-screen icon
- Works installable on Chrome, Edge, Safari (iOS: Share → Add to Home Screen)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / PWA                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  components/rootory.tsx  (~2,500 lines)              │   │
│  │  Single-page app · hash-based navigation             │   │
│  │  State: IndexedDB (idb) + Supabase cloud sync        │   │
│  └──────────────────────────────────────────────────────┘   │
│  crop-safety · sensor-panel · cloud-account · live-weather  │
│  workflows: PlantForm · LogForm · ReminderForm · PostForm   │
│             ListingForm · EnquiryForm · PlantCheck (AI)     │
└───────────────┬─────────────────────────┬───────────────────┘
                │                         │
      ┌─────────┘               ┌─────────┘
      ▼                         ▼
┌────────────────────┐  ┌──────────────────────┐
│  Next.js API       │  │  Supabase             │
│  /api/plant-health │  │  PostgreSQL + RLS     │
│  /api/weather      │  │  Storage buckets      │
│  /api/iot/moisture │  │  Auth                 │
└────────┬───────────┘  └──────────────────────┘
         │
    ┌────┴──────────────┐
    ▼                   ▼
┌──────────┐   ┌──────────────────┐
│  Gemini  │   │  Open-Meteo      │
│  AI      │   │  Weather API     │
└──────────┘   └──────────────────┘
    ▲
┌──────────────────┐
│  Wokwi / ESP32   │
│  Potentiometer   │
└──────────────────┘
```

**Data persistence flow:**
```
User action → React state → 700ms debounce →
  IndexedDB (always) →
  Supabase backupGarden (revision-checked) →
  syncCommunity (post diff) →
  syncMarketplace (listing + saved_listings diff)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js (App Router) + TypeScript | Server components, API routes, single codebase for web + PWA |
| **Database & Auth** | Supabase (PostgreSQL + RLS + Storage) | Row-level security, auth, real-time, storage — one platform |
| **AI** | Google Gemini `gemini-3.6-flash` | Multimodal, structured JSON output via `responseJsonSchema` |
| **Image processing** | Sharp | Server-side resize, EXIF rotation, size enforcement before AI |
| **Local storage** | idb (IndexedDB) | Account-scoped structured persistence; works offline |
| **Schema validation** | Zod | Shared input/output contracts across all API boundaries |
| **UI primitives** | Radix UI (Dialog) | Accessible modal system |
| **Icons** | Lucide React | Consistent, lightweight SVG set |
| **Weather** | Open-Meteo | Free, no API key, high quality forecast data |
| **IoT simulation** | Wokwi (ESP32) | Professional hardware simulation without physical components |
| **Deployment** | Vercel | Zero-config Next.js, automatic SSL, GitHub integration |
| **Testing** | Vitest + Playwright | 16 tests across 4 suites |
| **CSS** | Custom design tokens | Hand-crafted, mobile-first, accessible |

> Note: The problem statement suggested Tailwind CSS + shadcn/ui. Rootory uses custom CSS design tokens instead — delivering the same mobile-first, accessible result without a framework dependency.

---

## 🗄️ Database (7 Migrations)

| Migration | What it adds |
|---|---|
| `001` | `private_gardens` (JSONB), `plant-images` bucket, revision-checked save RPC |
| `002` | `account_gardens`, `assessment_usage`, `claim_plant_assessment()` quota RPC |
| `003` | `posts`, `comments`, `likes`, `bookmarks`, `community-images` bucket |
| `004` | `marketplace_listings`, `enquiries`, `route_enquiry()` trigger |
| `005` | `grower_locations`, `crop_reports`, `alerts`, `review_crop_report()`, `admin_members`, `moderate_content()` |
| `006` | `simulated_devices`, `simulated_telemetry`, device lifecycle RPCs, throttle, auto-prune |
| `007` | `saved_listings` (cloud bookmark sync), `delete_own_account()` full-wipe RPC |

All tables use **Row-Level Security**. Admin access requires a direct SQL insert into `admin_members` — no app code can self-elevate.

---

## 🚀 Running Locally

### Prerequisites

- Node.js 22.x
- Supabase project (free tier works)
- Google Gemini API key

### Steps

```bash
# 1. Clone
git clone https://github.com/prithik25/Rootory.git
cd Rootory

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env.local
# Fill in:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
# GEMINI_API_KEY=AIza...

# 4. Apply all 7 migrations (Supabase SQL Editor, in filename order)

# 5. Start dev server
npm run dev
# → http://localhost:3000
```

### Supabase Auth Configuration

1. Enable **Email/Password** authentication
2. In email templates, include `{{ .Token }}` alongside `{{ .ConfirmationURL }}`
3. **Site URL** → `https://rootory-seven.vercel.app`
4. **Redirect URL** → `https://rootory-seven.vercel.app/auth/confirm`

### Admin Provisioning

```sql
-- Supabase SQL Editor:
INSERT INTO public.admin_members (user_id) VALUES ('<admin-user-uuid>');
```

### Demo Account

The app loads a fully seeded demo workspace without any login. To test account features, sign up with any email/password at the live URL.

---

## 🧪 Tests & Quality

```bash
npm test          # 16 / 16 passing ✅
npm run typecheck # 0 TypeScript errors ✅
npm run build     # Clean production build ✅
```

Test coverage: data utilities · cloud schema isolation · IndexedDB scoping · AI assessment schema validation

---

## 🔐 Security & Privacy

| Concern | Implementation |
|---|---|
| Private plant records by default | RLS on `private_gardens`; explicit opt-in to share |
| Community sharing disclosed | Warning shown before every post/share action |
| AI prompt injection | System prompt treats all user input as untrusted observations |
| Location precision | Coordinates rounded to ~1 km; locality names only shown publicly |
| IoT device keys | 64-char hex, write-only, plant-scoped, 24hr expiry, revocable |
| Upload validation | 3.1 MB hard limit; Sharp validates JPEG before Gemini |
| Admin elevation | Requires SQL insert; no browser code can self-elevate |
| Enquiry privacy | Buyer never sees seller's user ID; Postgres trigger handles routing |
| Account deletion | `delete_own_account()` RPC wipes all rows + all Storage objects |
| Auth callback security | `/auth/confirm` excluded from service worker cache |

---

## 🌟 Why Rootory Wins

### 1. Offline-First for Real-World Growers
Every action saves locally first, syncs when back online. A grower in a low-connectivity village loses nothing. The sync status is always visible.

### 2. Responsible AI — Not a Chatbot
The AI observation tool never diagnoses. It never recommends chemicals. It always points toward a real human expert. A blurry photo says so. This reflects what a responsible tool for Indian farmers *should* do.

### 3. Geofenced Community Early Warning — Human-Reviewed
The crop disease alert system is the only feature of its kind in a free consumer app: a grower reports an observation, a human admin reviews it, and every nearby farmer growing the same crop gets a private in-app alert. **No false positives reach users without a human in the loop.**

### 4. Real IoT Pipeline
The soil moisture path — ESP32 simulation → HTTPS API → Supabase → live browser refresh — is a complete, working hardware integration. Swapping Wokwi for a real ESP32 is a single hardware change, not a software rewrite.

### 5. Complete Enquiry Flow Without Payments
The problem statement explicitly says "the primary action is Send enquiry." Rootory delivers a complete enquiry system with server-side routing, direction labels, and privacy — without requiring payment infrastructure.

### 6. Privacy Without Compromise
Coordinates are always rounded. Records are private by default. Every share is opt-in. Account deletion is complete and immediate.

---

## ⚠️ Known Limitations

These are disclosed transparently, as the problem statement recommends:

- **Crop scope**: The AI assessment supports any crop but is most reliable for common vegetables and herbs. Unsupported or exotic plants receive a clearly flagged fallback.
- **No real payments or delivery**: The marketplace is an enquiry-and-connect system; no payment processing or delivery is provided.
- **No verified seller badges**: Seller verification requires a completed-order system not in scope for the prototype.
- **Pagination**: Community posts and marketplace listings use a fixed query limit (100/200 rows) rather than infinite scroll — suitable for the prototype scale.
- **IoT is simulated**: The sensor uses a Wokwi ESP32 simulation, not a physical probe. Values are an arbitrary 0–100 scale, not calibrated moisture percentages or watering advice.
- **Language**: English only in the current build.
- **Full multi-account alert verification**: The complete flow (User A reports → Admin approves → User B within 10 km receives alert) requires three real accounts and manual testing.
- **Push notifications**: In-app alerts are implemented. Browser push (Web Push API) is deferred.

---

## 🗺️ Roadmap

- [ ] Web Push notifications for geofenced crop alerts
- [ ] Cursor-based infinite scroll pagination
- [ ] Custom SMTP for reliable email delivery (Resend / SendGrid)
- [ ] Physical ESP32 + capacitive soil moisture probe calibration guide
- [ ] Rootory Plus — multi-plot team accounts for nurseries and farmer groups
- [ ] KVK (Krishi Vigyan Kendra) integration for verified agronomist connections
- [ ] Language support (Marathi / Kannada)

---

## 📄 Licence

Built for **Bit N Build 2026** by Team **Máximo\_Claudius**. All rights reserved during the hackathon evaluation period.

---

<div align="center">

*Made for the way you grow. 🌱*

**[rootory-seven.vercel.app](https://rootory-seven.vercel.app/)** · **[github.com/prithik25/Rootory](https://github.com/prithik25/Rootory)**

</div>
