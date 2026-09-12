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

## 🌾 The Problem We're Solving

India has over **100 million home gardeners and small-scale growers** — from urban terrace farmers in Pune to rural kitchen-garden keepers in Nashik. They face three critical, interconnected problems:

1. **Isolation of knowledge** — A grower who spots an unusual leaf spot on their tomatoes has no quick, safe way to get a second opinion or alert their neighbours growing the same crop.

2. **No trusted local marketplace** — Surplus produce rots because there is no simple, free, local channel to connect sellers and buyers in the same neighbourhood.

3. **Fragmented tools** — Existing agricultural apps are either too complex for a home grower or designed exclusively for large-scale commercial farming. Nothing bridges the gap between a balcony herb gardener and a small-plot vegetable farmer.

**Rootory** is the growing companion built for *this* gap — a private plant diary, a community board, a local marketplace, and a crop-safety alert network, all in one offline-capable app.

---

## ✨ What Rootory Does — Complete Feature List

### 🏠 Overview Dashboard

The homepage gives every grower an instant snapshot of their growing world:

- **Live stats panel** — plants in care, care moments logged, upcoming reminders count
- **Today's care list** — reminders due today with one-click completion; completing auto-adds a "Care task" entry to the plant's timeline
- **Growing-in-your-space preview** — the two most recent plants, with quick links to their timelines
- **Community preview** — the latest community post surfaced inline
- **Live weather card** — real-time temperature, humidity, wind speed, and rain probability
- **Plant Check shortcut** — prominent prompt to start an AI-assisted observation from the home screen
- **Offline indicator** — appears automatically when the device loses network; device-local editing continues

---

### 🌿 My Plants — Full Plant Management

Each plant is a complete, private growing record.

**Plant Profile:**
- Plant name, crop/species, category (Vegetable / Herb / Other)
- Planting date → auto-computes current "Day N" age
- Growing setting: Pot, Grow bag, Raised bed, Garden bed, Field, or Greenhouse
- Quantity (e.g. "3 plants" or "0.5 acre"), growing location, soil type (optional)
- Growth stage: Growing or Harvested
- Optional cover photo (Supabase Storage for account users; base64 for demo)

**Plant List View:**
- Filter by category (All / Vegetables / Herbs / Other)
- Search by plant name or crop
- Cards show: photo, category, location, day-count badge, growth stage

**Plant Detail View:**
- Hero section with full photo, crop/category labels, all metadata chips, and action buttons
- **Log Progress** → opens progress form linked to this plant
- **Plant Check** → opens AI assessment pre-linked to this plant
- **Edit** → updates all plant details in-place

**Growing Timeline (chronological diary):**
- Entry types: Progress, Watering, Fertilizer, Treatment, Observation, Harvest, Care task completions
- Each entry: type icon, date label ("Today" / "Yesterday" / "3 Sep"), note, optional photo
- **AI observation entries** rendered as structured cards: Visible Symptoms, Possible Causes, Uncertainty, What to Inspect Next, When to Consult an Expert
- **Share with community** button on any entry — pre-populates a community post with the entry's text and photo
- Delete individual entries
- "Whole-plant photo" context entries (from Plant Check) stored separately, clearly labelled

**Per-plant care reminders** in an "Up next" panel; add directly from the plant view.

**IoT Sensor Panel** — see *Simulated Soil Moisture Sensor* below.

**Delete Plant** — removes the plant, all timeline entries, all reminders, and all notifications in one step.

---

### 👥 Community — The Growing Circle

A real-time shared community board for signed-in growers; local-only demo for guests.

**Posting:**
- Body text (up to 1,500 chars), crop tag, post type (Progress update / Question / Harvest story), location name, optional photo
- Photos upload to Supabase Storage (`community-images` bucket)

**Feed:**
- Filter tabs: Latest · Progress · Questions · Harvests · Saved
- Full-text search: crop, body text, author name
- Quick-filter crop tags: Tomato, Basil, Lettuce, Mixed

**Engagement:**
- ❤️ Like / unlike with live count
- 💬 Comments — view and add inline; persist to Supabase for account users
- 🔖 Save / unsave posts (visible under "Saved" filter)
- ⋯ Options: delete your own post, or report a post

**Admin content moderation:** Remove posts or disable marketplace listings from the Crop Safety panel.

---

### 🛒 Marketplace — From One Grower to Another

A local, no-payment produce and supplies exchange.

**Creating a listing:**
- Title, category (Produce / Growing supplies), price in ₹, unit, quantity, location, delivery method, description, seller name, optional photo
- Shared publicly to all signed-in growers; local demo for guests

**Browsing:**
- Filter tabs: Explore all · Produce · Growing supplies · Saved · My listings · Enquiries
- Text search + location filter dropdown

**Listing detail:**
- Full description, availability, collection method, seller info
- Your own listings: Edit or toggle Available / Unavailable
- Others: "Send an enquiry" button (disabled if unavailable)

**Enquiries (Buyer → Seller messaging):**
- Free-text enquiry for any available listing
- Stored in Supabase; routed to the seller via the `route_enquiry()` Postgres trigger — buyer never sees seller's user ID
- "Enquiries" tab shows sent and received enquiries with direction labels
- Saved listing preferences sync to Supabase (`saved_listings` table) for account users

---

### 🔔 Notifications — Alerts That Matter

**Notification types:**
- 🌿 **Care** — plant reminders, task completions
- ☁️ **Weather** — weather-related growing updates
- 👥 **Community** — geofenced crop disease alerts reviewed by admins

**Notification management:**
- Filter: All / Unread / Care / Weather / Community
- "Mark all read", per-notification read/unread toggle
- Plant notifications link directly to the plant ("View plant →")
- Unread count badge on nav and mobile nav

---

### 🚨 Crop Safety — Geofenced Disease Alert Network

One of Rootory's most distinctive features — a **community early-warning system** for crop diseases.

1. **Set your private alert area** — enter coordinates (or use GPS) and a locality name. Coordinates rounded to ~1 km precision; never shown publicly.
2. **Submit a crop report** — describe observed symptoms on a specific crop. Goes to a moderation queue; no alert is sent until an admin approves.
3. **Admin review queue** — admins see all pending reports and Approve or Reject. Approval runs `review_crop_report()` Postgres RPC: identifies all growers within **10 km** growing the same crop and creates in-app alerts for them. Reports older than **7 days** are automatically excluded.
4. **Nearby alerts** — growers see alerts with crop name, area, and description. Each can be marked read.
5. **Content moderation** — admins can also remove community posts or disable marketplace listings.

---

### 🤖 Plant Check — AI-Assisted Observation (Gemini)

Powered by **Google Gemini** (`gemini-3.6-flash`). Deliberately conservative by design.

**Workflow:**
1. Select a plant (or type any crop name)
2. Upload a **close-up photo** of the affected area (the only image sent to AI)
3. Optionally add a **whole-plant context photo** (stored locally, never sent to Gemini)
4. Describe what you observed (up to 1,000 chars)
5. Server: validates session → checks hourly quota → resizes image with Sharp → sends crop, note, and close-up image to Gemini

**Structured AI response (Zod-validated):**
- **Visible symptoms** — observable signs (up to 8 bullets)
- **Possible causes** — plausible explanations, never a confirmed diagnosis (up to 5)
- **Uncertainty** — what the model cannot determine
- **What to inspect next** — practical, low-risk steps
- **When to consult an expert** — guidance toward KVK / agronomist / horticulturist

**Safety guardrails (system prompt):**
- All user input treated as untrusted observations, not instructions (prompt injection defence)
- Never confirms a diagnosis; never recommends pesticides, dosages, or chemical recipes
- Never claims access to historical or real-time data
- If the image is unusable or not a plant: says so and sets `usableImage: false`
- Max output tokens: 2,500

**Rate limiting:**
- 10 assessments/account/hour (server-side via `claim_plant_assessment()` RPC; returns HTTP 429)
- Demo account: 500/hour

**Output:** Saved to the plant's timeline as a structured "Observation" entry, rendered by `ObservationNote` component with clearly labelled sections.

---

### 🌦️ Live Weather (Open-Meteo)

Real-time weather, no API key required:

- Current temperature (°C), humidity (%), wind speed (km/h), rain probability (current hour)
- Choose: **Pune, Mumbai, Nashik, Bengaluru, Delhi** or GPS ("Use my location")
- GPS coordinates rounded to 2 decimal places before the API call; never stored or shared
- Server-side 5-minute cache (`revalidate: 600`)
- Clear disclaimer: weather alone does not diagnose plant health

---

### 📡 IoT — Simulated Soil Moisture Sensor

A real, end-to-end hardware integration pipeline:

**Hardware simulation:**
- **ESP32 + potentiometer** simulated in **Wokwi** (online circuit simulator)
- Potentiometer ADC value (0–100 integer) sent over **HTTPS** with TLS validation using the Google Trust Services root CA (`gtsr1.pem`) — no `insecure` flag used
- Wokwi connects to the live production API at `https://rootory-seven.vercel.app/api/iot/moisture`

**API (`/api/iot/moisture`):**
- Validates a **device key** (64-char hex Bearer token)
- Calls Supabase RPC `ingest_sensor_reading()` which:
  - Matches device key to plant and owner
  - Enforces a **5-second throttle** between readings (HTTP 429 if violated)
  - Stores reading in `simulated_telemetry`
  - Auto-prunes via Postgres trigger (keeps rolling history)

**In-app sensor panel (per-plant detail view):**
- Refreshes every 5 seconds while visible (pauses on hidden tab)
- Shows latest reading in large text with a band label: **Low** (<30) / **Moderate** / **High** (>80)
- Shows seconds since last reading; warns "Stale" if >2 minutes
- Lists the 10 most recent readings with timestamps
- **Device management:** Create a key (24hr validity), copy it, revoke it — all from the browser
- **Browser simulation slider** — drag 0–100 and click "Send simulated reading" to fire the real API without any hardware

> The browser slider path is identical to the Wokwi path — the full IoT pipeline can be demonstrated live in any browser.

---

### 👤 Profile & Settings

- Edit name, location, role, bio
- Notification preference toggles (Care, Weather, Community, Marketplace interest)
- Connection status panel: device storage state, cloud backup, AI availability, weather service
- **Export my records** — downloads a complete JSON snapshot (`rootory-my-records.json`)
- **Install Rootory** — triggers PWA install prompt; falls back to iOS Safari instructions (Share → Add to Home Screen)
- **Reset demo workspace** — restores seed data (disabled for account users)

---

### ☁️ Cloud Account & Backup

**Authentication:**
- Email + password
- Email code sign-in (OTP magic link via `{{ .Token }}` in Supabase template)
- Password recovery via email OTP, handled at `/auth/confirm`

**Automatic cloud sync (signed in):**
- Private garden backs up with **revision-checked conflict detection** — stale revisions fail gracefully rather than silently overwriting
- Community posts, marketplace listings, enquiries, and saved listing preferences sync to shared Supabase tables
- 700ms debounced serial queue — edits never race each other

**Manual cloud restore:** Restores the latest cloud backup to the current device.

**Delete account (two-step confirmation):**
- Calls `delete_own_account()` RPC: deletes all rows in all tables and all objects from `plant-images` and `community-images` Storage buckets
- Complete, irreversible, no orphan data

---

### 🔍 Global Search

- Accessible from the top bar on any page
- Searches plants (name + crop), marketplace listings (title), and community posts (body + author) simultaneously
- Results grouped by section with contextual icons; one click navigates directly to the item

---

### 📱 PWA — Progressive Web App

- **Service worker** (`/sw.js`) caches the app shell for offline access; `/auth/confirm` excluded from cache to prevent stale token replay
- **Web manifest** with full icon set: 180×180 for iOS, standard sizes for Android/Chrome
- **iOS Safari**: `apple-touch-icon.png` + `apple-touch-icon-precomposed.png` (180×180, opaque `#183e32` brand green) — correct icon on iPhone home screen
- Meta tags: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`, `apple-mobile-web-app-title: rootory`
- Offline banner shown automatically; all local editing continues

---

### 💎 Rootory Plus (Concept Preview)

Subscription concept to validate grower interest — no payment connected:
- Multiple plots and team access
- Group crop-health overview
- Advanced records and reporting
- Shared workflows for grower groups

Growers can click "I'm interested" (saved on-device only). This is a post-hackathon direction.

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
│  crop-safety (alerts) · sensor-panel (IoT) · cloud-account  │
│  workflows: PlantForm · LogForm · ReminderForm · PostForm   │
│             ListingForm · EnquiryForm · PlantCheck (AI)     │
└──────────────────┬───────────────────────────┬─────────────┘
                   │                           │
         ┌─────────┘                 ┌─────────┘
         ▼                           ▼
┌────────────────────┐    ┌────────────────────┐
│  Next.js API       │    │  Supabase           │
│  /api/plant-health │    │  PostgreSQL + RLS   │
│  /api/weather      │    │  Storage buckets    │
│  /api/iot/moisture │    │  Auth               │
└────────┬───────────┘    └────────────────────┘
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
│  simulation      │
└──────────────────┘
```

**Data flow (on every user edit):**
```
update(fn) → React state → 700ms debounce →
  IndexedDB (saveState) →
  Supabase (backupGarden, revision-checked RPC) →
  syncCommunity (posts diff) →
  syncMarketplace (listings + saved_listings diff)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js (App Router) | Server components, API routes, Vercel edge deployment |
| **Language** | TypeScript | Full type safety across client and server |
| **Database & Auth** | Supabase (PostgreSQL + RLS + Storage) | Row-level security, real-time, auth — all in one platform |
| **AI** | Google Gemini `gemini-3.6-flash` | Multimodal (image + text), structured JSON output |
| **Image processing** | Sharp | Server-side JPEG resize, EXIF rotation, size limit enforcement |
| **Local storage** | idb (IndexedDB) | Account-scoped, structured persistence |
| **Schema validation** | Zod | Shared input/output schemas across all API boundaries |
| **UI primitives** | Radix UI (Dialog) | Accessible modal primitives |
| **Icons** | Lucide React | Lightweight, consistent SVG set |
| **Weather** | Open-Meteo | Free, no API key, high quality |
| **IoT simulation** | Wokwi (ESP32) | Professional hardware simulation without physical device |
| **Deployment** | Vercel | Zero-config Next.js, automatic SSL |
| **Testing** | Vitest + Playwright | 16 tests across 4 suites |
| **CSS** | Custom design tokens | Hand-crafted, accessible — no Tailwind or shadcn |

---

## 🗄️ Database Schema (7 Migrations)

| Migration | What it adds |
|---|---|
| `001` | `private_gardens` (JSONB blob), `plant-images` Storage bucket, revision-checked save RPC |
| `002` | `account_gardens`, `assessment_usage`, `claim_plant_assessment()` quota RPC |
| `003` | `posts`, `comments`, `likes`, `bookmarks`, `community-images` bucket, `community_author` trigger |
| `004` | `marketplace_listings`, `enquiries`, `route_enquiry()` Postgres trigger |
| `005` | `grower_locations`, `crop_reports`, `alerts`, `review_crop_report()`, `admin_members`, `moderate_content()`, `is_rootory_admin()` |
| `006` | `simulated_devices`, `simulated_telemetry`, device lifecycle RPCs, 5s throttle, auto-prune trigger |
| `007` | `saved_listings` (cloud bookmark sync), `delete_own_account()` full-wipe RPC |

All tables use **Row-Level Security** — users can only access their own rows. Admin access requires a direct SQL insert; no app code can self-elevate.

---

## 🚀 Running Locally

### Prerequisites

- Node.js 22.x
- Supabase project (free tier)
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

# 4. Apply all 7 migrations in order via Supabase SQL Editor
#    supabase/migrations/202609120001_private_gardens.sql
#    supabase/migrations/202609120002_account_gardens.sql
#    supabase/migrations/202609120003_community.sql
#    supabase/migrations/202609120004_marketplace.sql
#    supabase/migrations/202609120005_crop_safety.sql
#    supabase/migrations/202609130006_simulated_sensors.sql
#    supabase/migrations/202609130007_account_lifecycle_and_saved_listings.sql

# 5. Start dev server
npm run dev
# Open http://localhost:3000
```

### Supabase Auth configuration

1. Enable **Email/Password** authentication
2. In email templates, include `{{ .Token }}` alongside `{{ .ConfirmationURL }}`
3. **Site URL** → `https://rootory-seven.vercel.app`
4. **Redirect URL** → `https://rootory-seven.vercel.app/auth/confirm`

### Admin provisioning

```sql
-- In Supabase SQL Editor:
INSERT INTO public.admin_members (user_id) VALUES ('<admin-user-uuid>');
```

---

## 🧪 Tests & Quality

```bash
npm test          # 16 / 16 passing ✅
npm run typecheck # 0 TypeScript errors ✅
npm run build     # Clean production build ✅
```

Tests cover: data utilities (age, date labels, seed shape), cloud schema isolation, IndexedDB storage scoping, and AI assessment schema validation.

---

## 🔐 Security & Privacy

| Concern | How Rootory handles it |
|---|---|
| **Garden data** | Private by default; RLS enforces user-scoped access at the database level |
| **Community sharing** | Explicitly disclosed before posting; opt-in only |
| **AI prompt injection** | System prompt treats all user input as untrusted observations, never instructions |
| **Location precision** | Rounded to ~1 km before storage; locality names only shown to other growers |
| **IoT device keys** | 64-char hex, write-only, plant-scoped, 24hr expiry, revocable |
| **Image size** | 3.1 MB hard limit enforced in the API route before Sharp or Gemini |
| **Admin access** | Requires direct SQL insert into `admin_members` — no browser code can self-elevate |
| **Enquiry routing** | Buyer never sees seller's user ID; routed server-side by Postgres trigger |
| **Account deletion** | Single RPC deletes all rows + all Storage objects; no orphan data |
| **Auth cache** | `/auth/confirm` is excluded from the service worker cache |

---

## 🌟 What Makes Rootory Special

### 1. Offline-First by Design
Everything saves locally first, syncs when back online. For a grower in a low-connectivity area, this isn't a nice-to-have — it's essential.

### 2. Responsible AI — Not Just a Chatbot
The plant observation tool never diagnoses. It never recommends chemicals. It always points toward a real human expert for serious issues. This reflects what a responsible tool for Indian farmers *should* do.

### 3. Geofenced Community Early Warning
The crop disease alert system is unique in a free consumer app: a grower reports an observation, a human admin verifies it, and every nearby farmer growing the same crop receives a private in-app alert — no false positives without human review.

### 4. Real End-to-End IoT Integration
The soil moisture pipeline — ESP32 simulation → HTTPS → Next.js API → Supabase → live browser refresh — is a fully working hardware integration. Swapping the Wokwi simulation for a real ESP32 with a capacitive moisture probe is a single hardware change.

### 5. Privacy Without Compromise
Coordinates are rounded, never exact. Plant records are private. Sharing is always opt-in and explicitly disclosed. Account deletion is complete, immediate, and irreversible.

### 6. Zero-Friction Demo
No sign-up needed to experience the full UI. The demo workspace loads instantly with sample plants, posts, listings, and notifications — stored locally, never sent anywhere.

---

## 🗺️ Roadmap (Post-Hackathon)

- [ ] Web Push notifications for geofenced crop alerts
- [ ] Cursor-based infinite scroll (replace fixed query limits)
- [ ] Custom SMTP for reliable email delivery (Resend / SendGrid)
- [ ] Physical ESP32 + capacitive soil moisture probe calibration guide
- [ ] Rootory Plus — multi-plot team accounts for nurseries and farmer groups
- [ ] KVK (Krishi Vigyan Kendra) integration for verified agronomist connections

---

## 📄 Licence

Built for **Bit N Build 2026** by Team **Máximo\_Claudius**. All rights reserved during the hackathon evaluation period.

---

<div align="center">

*Made for the way you grow. 🌱*

**[rootory-seven.vercel.app](https://rootory-seven.vercel.app/)** · **[github.com/prithik25/Rootory](https://github.com/prithik25/Rootory)**

</div>
