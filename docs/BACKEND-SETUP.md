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
