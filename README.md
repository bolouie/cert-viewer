# Certificate Viewer

A small Cloudflare Pages project for displaying professional certificates
publicly (e.g. linked from LinkedIn) without making them trivially easy to
screenshot, save, and reuse as someone else's credential.

**Live demo:** [add your deployed URL here]

## Why this exists

LinkedIn's "credential URL" field expects a link to your certificate. The
obvious approach — a bare PDF or image — is also the easiest thing to
screenshot and pass off as someone else's. This project explores a
lightweight alternative: render the certificate onto an HTML canvas with a
watermark baked into the pixels, cap the resolution served, and log basic
visit metadata (timestamp, rough geo, referrer) so you have some sense of
activity over time — not who's viewing, just how much and roughly from
where.

**Honest scope note:** none of this prevents someone from photographing
their screen. The goal is to raise friction and reduce the value of a
casual copy, not to make copying impossible.

## Architecture

```
Visitor → Cloudflare Pages
              ├── functions/_middleware.ts   (logs every cert-page visit to D1)
              ├── public/*.html              (canvas-rendered, watermarked viewer)
              └── functions/api/stats.ts     (JSON API: visit counts, geo breakdown)
```

- **Frontend** — plain HTML/CSS/JS (`public/`). Each certificate gets its
  own page; a shared `viewer.js`/`viewer.ts` draws the image to `<canvas>`,
  overlays a tiled watermark, caps the render resolution, and disables
  right-click/drag/select as a mild deterrent.
- **Logging** — `functions/_middleware.ts` is a Cloudflare Pages Function
  that runs on every request. It matches known cert paths, pulls
  Cloudflare's edge-provided geo/UA data off the request, and writes a row
  to D1 (Cloudflare's edge SQLite).
- **API** — `functions/api/stats.ts` queries D1 and returns aggregated
  visit stats as JSON (total views per cert, last-7-day counts, country
  breakdown, recent visits).
- **Database** — `migrations/0001_init.sql` defines the schema.
- **Language** — TypeScript throughout the Functions layer, `strict: true`.

## Stack

- Cloudflare Pages + Pages Functions
- Cloudflare D1 (SQLite at the edge)
- TypeScript
- No frontend framework — deliberately plain, since the interesting part
  of this project is the edge/data layer, not UI complexity

## Running this yourself

1. `npm install`
2. `npx wrangler d1 create your-db-name`, then update `wrangler.toml` with
   the returned `database_id`
3. `npx wrangler d1 execute your-db-name --file=./migrations/0001_init.sql --remote`
4. Add your own certificate images to `public/certs/` (see below — these
   are intentionally not included in this repo)
5. `npx wrangler pages deploy public`

## Using this for your own certificates

The certificate images themselves are **not included in this repo** —
`.gitignore` excludes `public/certs/*`. This is deliberate: the entire
point of the project is controlling how these images are displayed and
copied, so committing the raw files to a public git history would defeat
that immediately (anyone could clone the repo and pull the unwatermarked
originals straight out, regardless of what the rendered page does).

To adapt this for your own credentials:

1. Drop your certificate images into `public/certs/` locally (they'll stay
   untracked, per `.gitignore`)
2. Update the `imagePath` and `watermarkText` values in the relevant
   `public/*.html` file
3. Add the matching path to `TRACKED_SLUGS` in `functions/_middleware.ts`
   if you want visits logged
4. Deploy — your images go live via Cloudflare, but never touch your git
   history

If you want the repo to run end-to-end for someone else who clones it,
consider committing a placeholder/sample image instead of leaving
`public/certs/` empty.

## What I'd build next

- Auth on `/api/stats` (currently open — low stakes for personal view
  counts, but the obvious next step)
- Row-level D1 query typing (`.all<RowShape>()`) throughout, for tighter
  type safety on what the database actually returns
- A custom domain instead of the default `*.pages.dev`

---

Built by [Bo Louie](https://bolouie.com) — design researcher turned
developer building full stack applications.
