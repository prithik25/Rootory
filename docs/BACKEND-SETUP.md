# Connect the first backend slice

1. Create a Supabase project. Run `supabase/migrations/202609120001_private_gardens.sql` in its SQL Editor once. This creates a private database table, authenticated save function, private image bucket and owner-only access policies.
2. Add the project URL and publishable key to `.env.local` using `.env.example`. Never use a service-role/secret key in a `NEXT_PUBLIC_` variable.
3. In Supabase Authentication → Email Templates → Magic Link, include `{{ .Token }}` in the email body. Rootory uses an email code, not a redirect link. Enable email sign-in. Configure a mail provider authorized to deliver to judge/test addresses; the default provider can restrict recipients and rate-limit delivery.
4. Restart the dev server (or rebuild for production). Open Profile → Your cloud garden. Request a code, verify, check cloud backup, then back up the garden.
5. In a second browser, sign into the same account and restore. Confirm plants, both observation photos and reminders match. With a different account, confirm no access to the first account's data.

## Implemented

Email-code authentication, manual private plant/profile/reminder backups, private photo upload/download, validation, and atomic revision checks that reject stale overwrites. Photos are stored separately from records. Local offline storage still works. Restoring asks before replacing local plant data. Cloud records are not automatically published to community or marketplace.

## Verification boundary

Build and schema unit tests run locally. Live auth, SQL execution, Storage policies and two-account isolation require the configured Supabase project. They are not claimed tested until connected. The SQL function checks document shape and size; the client validates detailed record structure when loading and saving. Auth rate limits are managed by Supabase, not a custom application throttle.

This is a manual-backup first slice, not full real-time sync. Sign-out retains local records, as explicitly stated in the UI. Reset clears local demo data only. Account/cloud deletion, orphan-photo cleanup and shared community/marketplace tables are next steps. Failed backups can leave private uploaded photos in the bucket; no public URLs are created. Cloud image upload enforces bucket MIME/size but does not yet perform independent server-side image decoding. Do not describe this as complete production security certification.

Official references:
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/storage/security/access-control

## Password login and recovery

Password login is the default. Forgot password requests a recovery email, verifies its code with type `recovery`, then calls authenticated `updateUser` to change the password. Configure Authentication → Email Templates → Reset Password with `<h2>Your Rootory reset code</h2><p>{{ .Token }}</p>`. Email quotas still apply. No reset email or actual password change was executed during local implementation checks.

## Account data and live-service integration (migration 002)

Run `supabase/migrations/202609120002_account_gardens.sql` after 001. Signed-in gardens now save automatically, with 700 ms debounce and a serialized revision-checked queue. IndexedDB caches use account-specific keys. Pending sync revisions persist so reload does not discard unsynced edits; conflicts require export and explicit cloud restore rather than silent overwrite. Direct table writes are revoked; the authenticated transaction updates the garden and materializes owner-scoped records. This full-garden transaction is suitable for the prototype, not high-volume collaborative editing.

AI: `/api/plant-health` verifies the Supabase bearer token, enforces bounded request size, decodes/re-encodes the image server-side, claims one of ten requests per account per UTC hour using Postgres, and validates Gemini JSON output. Secrets stay on the server. Invalid tokens never call Gemini. The image and symptom description are sent to Google when the user requests assessment; whole-plant photos and weather are not yet included. Successful results can be saved to the plant timeline. No pesticide dose or soil chemistry is requested.

Weather: `/api/weather` validates and rounds coordinates, requests Open-Meteo, and returns timestamped current weather and the matching hour's rain probability. Browser location is requested only after a button click. Coordinates are not stored in public profile fields. Optional manual city selection works without geolocation permissions.

Verified: production build, 12 unit tests, live weather request and browser rendering, invalid-coordinate rejection, unauthenticated AI rejection, model/key availability, and anonymous denials for new tables. Full authenticated CRUD and AI endpoint tests remain pending a signed-in test account. Neither passwords nor secret keys are in source control.

Live provider smoke test: Gemini 2.5 Flash returned a model-retirement error for this project. The default was updated to `gemini-3.6-flash`; a sample basil photo returned a schema-valid assessment. This tests provider generation separately from the authenticated application endpoint. GitHub and Vercel publication were deferred at the user's request.

## Shared community (migration 003)

Migration 003 adds posts/comments/likes/bookmarks and the community-images bucket. Signed-in posts load from Supabase; mutations persist via the existing serialized queue. Owner RLS prevents editing other accounts' rows, bookmarks are private, display names come from account profiles. Shared images are public and the form explicitly explains sharing. Signed-out community stays a device-local demo. Feed is capped at 100 posts / 2,000 comments / 10,000 likes; pagination and moderation remain unfinished.

Verified live: judge account seeded with 3 private plants / 4 updates / 3 reminders; relational queries confirmed them. Added 3 clearly labelled shared posts, a comment, like and bookmark. Spoofed-owner insert denied with 42501. Authenticated /api/plant-health returned HTTP 200 and structured data. Browser restored populated cloud garden and confirmed a shared like survives reload. A stale empty local cache produced a revision conflict as intended; explicit restore resolved it. Distinct second-account testing and private-photo lifecycle coverage still remain.
