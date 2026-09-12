# Rootory backend setup

1. Configure `.env.local` from `.env.example`: Supabase root project URL, publishable/anon key and server-only Gemini key. Never expose a service-role or Gemini key under NEXT_PUBLIC_.
2. Run migrations 001 through 005 in filename order. They add private gardens/storage, account records/AI quota, community, marketplace/enquiries, and crop safety/admin respectively. All five are present in the connected project.
3. Enable Supabase password authentication. For code-based signup, login and recovery, include `{{ .Token }}` in the corresponding Confirm signup, Magic Link and Reset Password templates. Configure custom SMTP for reliable external delivery; default email quotas previously blocked testing.
4. Add the production URL to Supabase site/redirect configuration if using email links. Add environment variables in Vercel and redeploy.
5. Use an ordinary account for the judge demo. Never give the publicly shared demo account administrator privileges.

## Private administrator setup

An administrator must be a separate, confirmed account controlled by the team. In the trusted Supabase SQL Editor, insert its auth user ID into `public.admin_members`. No browser-supplied role field grants privileges. Do not place privileged keys in the app.

After provisioning, test: one ordinary grower reports a problem; the private administrator reviews it; another grower with a matching crop and private location within 10 km receives an alert. Reports older than seven days must not broadcast. This full multi-account path remains unverified.

## Data behaviour

Private gardens save automatically through a serialized revision-checked RPC. Stale revisions produce a conflict rather than silently overwrite data. Export unsynced records before choosing explicit cloud restore. Account caches persist on device after logout.

Community posts and listings synchronize through shared tables. Public image uploads are explicitly disclosed. Enquiry recipients are derived server-side from the listing, and only buyer/seller can read the enquiry. Marketplace saved-listing preferences are currently local, unlike community bookmarks.

AI uses the configured Gemini model (default gemini-3.6-flash), verified bearer authentication, image decoding, structured validation and ten requests per account per hour. Only the close-up image, crop and note are sent for assessment; history, whole-plant photograph and weather are not model inputs.

## Remaining work

Reliable recovery-email delivery; separate-account and private-admin testing; full AI-result save through UI; phone installation; account deletion and orphan-image cleanup; durable moderation/audit and pagination. Subscriptions, batch verification and push notifications are concepts, not connected services.

See README for current live verification. Do not describe the prototype as production security certified.

## Email-link return address

Site URL: `https://rootory-seven.vercel.app`
Allowed redirect URL: `https://rootory-seven.vercel.app/auth/confirm`

Signup, email sign-in and recovery explicitly request that callback. The callback verifies the returned session, removes URL credentials, and shows password entry for recovery links. Code entry remains supported if email templates include `{{ .Token }}`. Keep `{{ .ConfirmationURL }}` for the working link. Old emails retain old destinations; request a fresh email after changing settings. Authentication callback pages are excluded from the service-worker cache.

The user confirmed these dashboard URL settings on 13 September 2026. SMTP remains pending provider details.
