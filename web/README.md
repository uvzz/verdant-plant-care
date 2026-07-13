# Verdant — marketing site

Static, self-contained landing page (`index.html`, no build step) deployed to
**Cloudflare Pages** (project `verdant`).

Live: https://verdant-bk5.pages.dev

## Deploy / redeploy

```bash
npx wrangler pages deploy web --project-name verdant --branch main --commit-dirty=true
```

Everything is inline (CSS + SVG + a tiny scroll-reveal script); fonts load from
Google Fonts (Fraunces + Outfit, matching the app). Edit `index.html` and
redeploy.
