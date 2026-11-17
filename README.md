# simple-game-art-try

A static 2D pixel-art office tutorial game built with Vite and a plain HTML Canvas. No backend, no frameworks. See `docs/PRD.md` and `docs/VISUAL-SPEC.md`.

## Run locally

Requires Node.js 20+.

```sh
npm install
npm run dev      # dev server with hot reload
npm run build    # production build into dist/
npm run preview  # serve the built site locally
```

## Deploy

`.github/workflows/deploy.yml` builds the site and publishes `dist/` to GitHub Pages on every push to `main` (or manually via "Run workflow").

One-time setup: in the repository, go to **Settings > Pages** and set **Source** to **GitHub Actions**.