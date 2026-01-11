# TRACE

TRACE is a client-first OSINT MVP that maps public GitHub signals to an interactive 3D globe. The interface emphasizes transparency, smooth animation, and safety: **public signals only** and **correlation, not confirmation**.

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Cloudflare Pages deployment

1. Connect this repo in Cloudflare Pages.
2. Build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Output directory**: `out`
3. Optional environment variables:
   - `TRACE_DENYLIST` — comma-separated usernames to block (e.g. `a,b,c`).
   - `NEXT_PUBLIC_TRACE_DENYLIST` — local dev-only fallback denylist.

## Optional globe texture asset

The globe uses a built-in procedural texture by default. To use a higher-fidelity texture, download and place an image at:

```
public/textures/earth_day.jpg
```

Suggested download link (add manually):
- https://www.solarsystemscope.com/textures/ (Earth Day texture)

## Product notes

- The app fetches GitHub public APIs directly in the browser.
- If GitHub rate limits or network errors occur, Demo Mode auto-enables with seeded footprints.
- Location inference is conservative: city-level only when the profile location matches a known city in the offline dataset; otherwise country-level centroid.
- Public signals only. **Correlation, not confirmation.**

## Limitations

- Offline geodata is intentionally small for MVP coverage.
- Language-based hints are low confidence and broad.
- No identity claims are made; results are for visualization only.
