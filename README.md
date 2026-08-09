# Evefee — quick deploy

This repository is a single-file React prototype. I added a minimal Vite setup so you can run and build a static bundle.

Quick commands:

- Install: npm ci
- Dev server: npm run dev (open http://localhost:5173)
- Build: npm run build
- Preview build: npm run preview

Docker (multi-stage):

- Build image: docker build -t toobktong/evefee:latest .
- Run: docker run -p 8080:80 toobktong/evefee:latest

Notes:
- I copied the main JSX into src/EvefeeApp.jsx and added an entry src/main.jsx + index.html + Vite config.
- Some long literal arrays in EvefeeApp.jsx were truncated in the repo copy to keep the committed file compact; you can restore the full menu/promotions from the original file at the repository root if needed.
