# Rootory

**Track growth. Share knowledge. Connect to markets.**

A mobile-friendly farmer and gardener workspace for Bit N Build, Track 3 — Jan Jeevan.

[Live prototype](https://rootory-seven.vercel.app/) · [Public repository](https://github.com/prithik25/Rootory)

## Problem and solution

Plant records, care observations, local growing knowledge and selling opportunities often sit in separate tools. Rootory connects a plant's timeline with cautious photo observations, shared community posts and produce listings. Reviewed local crop reports are designed to help nearby growers notice relevant problems without presenting unconfirmed reports as diagnoses.

## Implemented

- Password sign-in, signup, session handling, logout and email-code recovery UI. Email delivery depends on Supabase mail configuration and quotas.
- Private account gardens, plant timelines, reminders and photographs with automatic revision-checked saves and per-account offline caches.
- Shared community posts, comments, likes and private bookmarks.
- Public marketplace listings, owner edits/availability and private buyer/seller enquiries. No payments or fulfilment.
- Gemini photo assessment through an authenticated server endpoint: visible symptoms, possible causes, uncertainty and inspection suggestions. No pesticide dosage, soil chemistry or diagnostic accuracy claims.
- Timestamped Open-Meteo weather with manual city selection or optional geolocation.
- Private approximate locations, pending crop reports, administrator review and same-crop alerts within 10 km for reports no older than seven days. In-app refresh only; no background push.
- Server-enforced administrator membership and basic post/listing moderation. A private administrator account still needs provisioning and end-to-end review testing.
- Responsive UI, photo validation, manifest/icons, production service worker and cached demo workspace.

Signed-out data and illustrative notices are labelled demonstrations. The subscription screen is a concept; there is no billing, verified-batch programme or completed seller-review system.

## Run

Use Node.js 22 and npm. Copy `.env.example` to `.env.local` and set the Supabase project URL, public client key and server-only Gemini key. Run all five migrations in `supabase/migrations` in filename order. See `docs/BACKEND-SETUP.md`.

```bash
npm ci
npm run dev
npm test
npm run typecheck
npm run build -- --webpack
npm start
```

If local file watching fails, use `WATCHPACK_POLLING=true npm run dev -- --webpack`. Production is required for service-worker testing. AI, weather and shared data need connectivity; account editing requires an initial successful cloud load.

## Technology and security boundaries

Next.js, React, TypeScript, custom CSS, Radix Dialog, Lucide, IndexedDB, Supabase Auth/Postgres/Storage, Google GenAI SDK, Zod and Sharp.

Private records use owner-scoped RLS and an authenticated, revision-checked garden RPC. Shared records have owner write policies. Enquiries are visible only to participants. Private photographs require authenticated access; explicitly shared community and marketplace images are public. AI requests verify sessions, bound and decode images, validate output and claim a database-enforced allowance of ten requests per account per hour. Secret keys remain server-side.

The prototype materializes private relational rows from a whole-garden JSON snapshot. It is not a high-volume collaborative database design. Logout retains account-specific browser caches. Account deletion, orphan-photo cleanup, full moderation audit trails, pagination and independent security review remain future work. Never enter private information in the shared judge account.

## Verified on 13 September 2026

- All 12 automated tests pass; production build passed during integration.
- Deployed judge password login works.
- Deployed weather and authenticated AI endpoints returned HTTP 200; AI returned structured uncertainty and usable-image fields.
- Private photo upload/download matched bytes; public access to the private image was blocked.
- Deployed browser AI assessment and photograph saved to the timeline and remained visible after reload.
- Community like persisted after browser reload; owner-spoofed writes were rejected.
- Marketplace listing availability and enquiry routing were checked against the database.
- Pending crop reporting works; the ordinary judge account cannot approve reports or act as administrator.

Still unverified: distinct-account isolation across every flow, administrator approval through to another grower's radius alert, password-recovery delivery, physical-phone PWA installation. These are not claimed complete.

## Deployment and submission

The app is deployed on Vercel. Set the same environment variables there, keep Gemini credentials server-only, and redeploy after environment changes. Configure Supabase site/redirect URLs for the public app when using email links.

Remaining submission artifacts: six-slide presentation and three-minute recorded demonstration. Do not claim field accuracy or measured farmer impact without independent validation.

## Image credits

See `public/assets/credits.json` and in-app Photo credits. Sample records and photographs are illustrative, not diagnostic references. Never commit passwords, private keys or `.env.local`.

## Simulated sensor integration

Plant pages include a private moisture-simulation panel, five-second refresh, last ten readings and temporary device credentials. ESP32/Wokwi starter files and recording steps are in `iot/wokwi/README.md`. A browser slider provides a second input to the same API. Run migration 006 for this feature. Values are explicitly simulated and not calibrated soil measurements. No automated irrigation or sensor-informed AI is claimed.
