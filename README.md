# GRAPE project page

Static one-page site for the GRAPE dataset (PIC4SeR, Politecnico di Torino × YANMAR R&D Europe).
Astro 5 + Tailwind 3 + GSAP, deployed to GitHub Pages.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321/GRAPE/
npm run build      # static site in dist/
```

## Change content

| What | Where |
| --- | --- |
| Links (GitHub repo, submission form, Google Form, contact) | `src/data/site.ts` |
| Stats band numbers | `src/data/site.ts` → `stats` |
| Authors and BibTeX | `src/data/site.ts` → `paper` |
| Session dates, stage names, texts, photos | `src/data/sessions.ts`, photos in `public/img/sessions/` |
| Dataset cards (DOIs, sizes, formats, folder trees, quick start) | `src/data/datasets.ts` |
| Leaderboard | `src/data/leaderboard.json` |

### Add a method to the leaderboard

Add an entry under the right task in `src/data/leaderboard.json`:

```json
{ "method": "My-Tracker", "by": "Lab name", "link": "https://github.com/…",
  "sessions": [[…6 values…], … one row per session, in the order of "sessions" …] }
```

"Overall" is computed as the mean of the six sessions (sums for metrics marked `"aggregate": "sum"`).
For segmentation, an explicit `"overall"` row is used when present. Rows are ranked by the metric at `rankBy`.

### Partner logos

The partners block shows text wordmarks. Drop official SVG logos in `public/logos/` and swap them in `src/components/Cite.astro`.

## Deploy to GitHub Pages

1. The site lives at `https://audritogiorgio.github.io/GRAPE/` (repo AudritoGiorgio/GRAPE).
   If the repo or org name differs, change `SITE`/`BASE` in `astro.config.mjs` (or set `SITE_URL`/`BASE_PATH`).
2. In the repo, Settings → Pages → Source: **GitHub Actions**.
3. Push to `main`. `.github/workflows/deploy.yml` builds and publishes the site.

### Results submissions

`.github/ISSUE_TEMPLATE/submit-results.yml` is the issue form behind the "Submit results" button.
Copy it into the benchmark repo (`PIC4SeR/grape-bench`) so the link in `src/data/site.ts` opens it.

## Placeholders still to fill

- Dataset contributions: `links.contribute` in `src/data/site.ts` (a prefilled email for now; replace with a form URL).
- Preprint: `links.preprint` in `src/data/site.ts` (empty hides the link).
- Partner logos (see above).
- Hero art: the vineyard scene is generated SVG (`src/lib/grape.ts`). A commissioned render can replace
  `hero-scene.svg` while keeping the rover layer, or replace both.

## How the drawings work

`src/lib/grape.ts` builds every grape cluster procedurally. A cluster has a stem, side branches and an
optional shoulder; per session it changes length, width, berry size, spacing, visible berry count and colour
(green → veraison → blue-black with bloom → a few shrivelled berries). The hero scene is generated at build
time into `hero-scene.svg`; the season section redraws the cluster in the browser while you scroll.

## Partner logos

Put the official logos in `public/logos/` as `pic4ser.svg` and `yanmar.svg` (PNG or WebP also work). On the next build they replace the text wordmarks in the "Built by" block.
