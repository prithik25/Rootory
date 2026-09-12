# Frontend verification — 12 September 2026

## Passed

- TypeScript compilation and optimized Next.js production build.
- Three focused domain tests: combined marketplace filtering, locality exclusion, future-date handling.
- Browser: create a plant; reload; reopen the saved plant.
- Browser: log a progress note and see it in the plant timeline.
- Browser: share that entry to the community; like and bookmark it; find it under Saved.
- Browser: add a comment and see it in the conversation.
- Browser: open a sample listing, save a local enquiry, find it in Enquiries.
- Browser: create a listing and find it in My listings.
- Browser: review a sample crop report, see the generated demo notification, mark all notifications read.
- Phone viewport (390px): dashboard and marketplace document widths match the viewport without horizontal overflow. Desktop and phone screenshots inspected.
- Browser console: no errors during the tested completed flows.
- WebMCP read tool: returned the current demo plants and reminders.

- Production browser: PNG plant photo saved and survived reload.
- Production browser: WebP close-up and JPEG whole-plant photo saved as two observation entries; both loaded after server shutdown and reload.
- Production browser: oversized (9 MB), corrupted JPEG, and unsupported Markdown files rejected with readable errors.
- Production browser: app shell reopened with its production server stopped; a new timeline note saved and survived another reload. This verifies loss of origin access, not phone airplane mode.
- Manifest required fields and actual 192×192 / 512×512 icon dimensions checked.
- Install control opened browser-specific installation instructions in the embedded browser.
- Final production rebuild passed after upload handling fixes; browser console contained no errors during the completed QA session.

## Remaining verification / limitations

- AI, shared accounts, live weather, payments, seller delivery and real regional alerts are intentionally unconnected.
- Physical Android/iPhone home-screen installation remains a device check after HTTPS deployment. Embedded-browser testing does not verify the native install prompt.
- WebMCP invalid-input browser check was not completed after the tab failure; the implementation rejects unexpected fields.
- No automated accessibility audit, screen-reader audit or cross-browser coverage is claimed.
- Local IndexedDB is a single-browser demo store, not a secure shared backend. Use one active editing tab to avoid overwriting another tab’s local snapshot.

## Upload fixes from this pass

- Forms refuse submission while a photo is being prepared, including the plant observation form, preventing an older photo from being saved during replacement.
- Photo removal is disabled during processing.
- Corrupt/undecodable images show a friendly instruction to choose another file.
- QA used generated fixtures and a separate local origin on port 3001; the main workspace on port 3000 was not reset.
