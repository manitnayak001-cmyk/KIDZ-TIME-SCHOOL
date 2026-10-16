# Kidz Time School website

Next.js + Payload CMS. One app serves the public site and the admin panel at `/admin`.

## Run locally
1. `npm install`
2. `cp .env.example .env`, then set `PAYLOAD_SECRET` to a long random string (for example `openssl rand -hex 32`).
3. `npm run dev` once, so the database is created. Stop it, then run `npm run seed` to import the school's details and photos (safe to run again, it never overwrites existing content).
4. `npm run dev`, then open http://localhost:3000
5. Open http://localhost:3000/admin and create the first account. It becomes the administrator. Administrators can add the second staff member (role: Editor).

The database is a single SQLite file (`kidztime.db`), in development and in production.

## Enquiries
Forms on Admissions and Contact post to `/enquiry-submit`. The server validates the input, applies a honeypot, a minimum-time check and a limit of 5 submissions per hour per IP, then saves the enquiry. Enquiries are visible only to logged-in staff under Enquiries in the admin panel.

## Media
Photos upload in the admin panel (JPEG, PNG, WebP, GIF, up to 10 MB, alt text required) and are stored in the `media` folder next to the database.

## Database changes
After editing `src/cms/schema.ts`: `npm run generate:types`, then `npm run migrate:create <name>` and commit the new file in `src/migrations`. Production applies migrations automatically at start-up.

## How content works
Every public page reads from the database, so changes made in `/admin` appear on the website immediately, with no rebuild. Visitors never see hidden items, drafts, archived posts or posts dated in the future. Red dashed "Placeholder" boxes mark fields the school still has to fill in; they disappear once the field has content.

## Testing
- `npm test` runs 47 automated tests (enquiry validation, spam and rate limits, sign-in and roles, who can see what, content editing, photo upload rules, the enquiry endpoint). They use a throw-away database and never touch real data.
- `npm run smoke` checks a running site (default http://localhost:3000, or set `BASE_URL`).
- `npm run a11y` runs an automated accessibility scan of every page. It cannot judge colour contrast or how the site feels with a keyboard or screen reader, so check those by hand.

## Optional features
E-mail alerts for new enquiries are off until the `SMTP_*` and `NOTIFY_EMAIL` settings are filled in (see `DEPLOYMENT.md`). News posts have a Preview button for staff. Testimonials appear on the home page only when marked visible and the parent's consent box is ticked.

## Deploying
Follow `DEPLOYMENT.md`.
