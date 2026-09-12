# Rootory

**Track growth. Share knowledge. Connect to markets.**

Rootory is a mobile-friendly growing workspace for farmers and home gardeners, built for Bit N Build — Track 3: Jan Jeevan.

## Current delivery: backend integration in progress

Supabase password/email authentication and password recovery, private account plant records with automatic revision-checked saving, private photo storage, a server-side Gemini assessment endpoint, and live Open-Meteo weather are implemented. Signed-out visitors retain a local demo. Account caches are separated by user ID; failed syncs retain local edits.

**Community, marketplace, regional alerts and subscriptions remain local demonstrations.** No payments, seller delivery, public moderation or nearby-alert delivery is connected. This is not a finished production service.

Apply both SQL migrations in order and configure `.env.local` using `.env.example`. See `docs/BACKEND-SETUP.md`. The second migration adds `profiles`, `plants`, `plant_updates`, `reminders`, `health_observations` and an authenticated hourly AI request counter. The revision-checked garden transaction materializes these relational rows atomically; record fields are stored as JSON per row in this hackathon implementation.

### Working interactions

- Create and edit plant profiles, optional photos, planting dates, growing spaces and manual growth stages.
- Record care/progress entries and photographs in a plant timeline.
- Add reminders and mark tasks complete; completion is written to the timeline.
- Share a private timeline entry into the demo community; create posts, like, bookmark and comment.
- Filter/search marketplace listings, create/edit your own listings, mark them unavailable, and save enquiries locally.
- Read/unread notification states and a clearly labelled report-review simulation.
- Record plant-health observations with close-up and whole-plant photographs. Signed-in users can request a Gemini assessment of the close-up photo. A separately labelled sample result remains available.
- Edit profile/preferences; export records or reset the demo workspace.
- View a subscription concept and save interest locally, without a payment or external signup.
- Responsive desktop/mobile navigation, keyboard-accessible dialogs, error/empty states.
- Production web app manifest, icons and service worker for an installable cached app shell; IndexedDB data remains available offline on the same device.

## Run locally

Requirements: Node.js 22+ and npm.

```bash
npm ci
npm run dev
```

Open http://127.0.0.1:3000. If your environment hits file-watcher limits:

```bash
WATCHPACK_POLLING=true npm run dev -- --webpack
```

Production:

```bash
npm run build -- --webpack
npm start
```

Development does not register the service worker. Install/offline testing uses the production build. Visit once online to cache the shell. AI and live weather require a network connection. Account records require a successful cloud load before editing; demo records remain usable offline.

## Verification

```bash
npm run typecheck
npm test
npm run build -- --webpack
```

The small unit suite checks combined marketplace filters and future-date handling. Browser smoke tests cover plant creation/persistence, timeline logging, sharing/likes/bookmarks/comments, enquiry history, demo report review and responsive layouts. See `docs/FRONTEND-QA.md` for the recorded checks and limitations.

## Technology

Next.js 16, React 19, TypeScript, CSS design tokens, Lucide icons, Radix Dialog and IndexedDB (`idb`). Image uploads are resized in the browser and re-encoded to remove metadata. Static demo photographs are optimized to WebP with Sharp. Supabase, Gemini and Zod packages are installed for the next integration phase but are not connected or required to run this frontend.

The frontend uses a custom CSS theme rather than Tailwind/shadcn. Radix provides the accessible dialog primitive. The single route uses hash navigation between working surfaces.

## Structure

- `app/`: app entry, metadata and global styles.
- `components/rootory.tsx`: navigation, main surfaces and app state.
- `components/workflows.tsx`: plant, post, listing, enquiry and observation forms.
- `components/primitives.tsx`: accessible dialogs, upload and empty/photo states.
- `lib/data.ts`: typed domain records and labelled sample content.
- `lib/storage.ts`: device-local persistence and photo preparation.
- `public/`: PWA assets, service worker and attributed sample imagery.
- `tests/`: focused domain tests.

## Next integration phase

1. Supabase Auth, PostgreSQL and Storage, with owner-scoped RLS and server-enforced administrator permissions.
2. A server-only Gemini endpoint, quotas, validated structured output and reviewed crop guidance.
3. Weather API with timestamped source attribution and graceful errors.
4. Reviewed crop reports matched by crop, approximate distance and recency, with private coordinates.
5. Replace local demo mutations with authenticated backend operations; only then enable shared community and seller enquiries.
6. Validate crop assessments using independent, labelled field cases. Do not claim diagnostic accuracy from the UI prototype.

Before introducing real accounts, review all local caching behavior: private API responses must never enter the service worker cache, and private device data must be cleared on logout. This frontend is not a security-reviewed production service.

## Deployment

The repository is compatible with Vercel's Next.js framework preset. No environment variables are needed for this frontend. Import the Git repository and use the standard `npm run build` command. If needed, set the build command to `npm run build -- --webpack`. Use an appropriate hosting plan for commercial operation. No cloud deployment or public repository has been created by this frontend build.

Do not commit keys, passwords or `.env.local`. Future credentials belong in server-side environment variables; no secret may use the `NEXT_PUBLIC_` prefix.

## Data and image credits

The sample growers, stories, prices, reports and weather are illustrative. User uploads remain local. Do not enter sensitive data into a public/shared-browser demo. Browser storage may be cleared by the user or browser; export records you want to keep.

See `public/assets/credits.json` and the in-app Photo credits for Wikimedia Commons source pages, creators and licences. Photographs are illustrative, not diagnostic references.

## Submission checklist

- [ ] Create/publish the public GitHub repository within the hackathon window.
- [ ] Add the deployed prototype URL to this README and submission.
- [ ] Connect and test any backend functionality claimed in the pitch.
- [ ] Prepare the six-slide PPT and three-minute video.
- [ ] Confirm all links work independently of the developer's login.
