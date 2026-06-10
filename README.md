# Things I'm figuring out

A personal learning space — a small shelf of long-form, bilingual (English + Greek) tutorials written by Charis to understand things properly, then left here in plain language for anyone who finds them useful.

Everything is **static HTML**. No build system, no framework, no backend. Open a file in a browser and it works. Push to Netlify and it's live.

## Structure

```
.
├── index.html              # the hub — entry point, lists every tutorial
├── index-el.html           # Greek hub
├── README.md               # this file
├── shared/
│   ├── styles.css          # the entire design system (tokens, components)
│   └── script.js           # progress bar, TOC scroll-spy, calculators
└── tutorials/
    ├── money-decoded/      # Tutorial 01 — Money, Decoded (complete)
    ├── tech-evolution/     # Tutorial 02 — Tech, Rewinding the Tape (in progress)
    └── _template/          # copy this to start a new tutorial
```

Each tutorial folder is self-contained: an `index.html` hub, numbered chapter pages, and a Greek `-el.html` twin for every page. They all link up to `shared/styles.css` and `shared/script.js` via `../../shared/…`.

## The design system

Editorial / cream-paper / serious-but-warm. It lives entirely in `shared/styles.css` and is **shared by every tutorial** — treat it as load-bearing and don't edit it casually.

- **Colors:** `--paper` `#f4ede0`, `--ink` `#1c1b18`, `--rust` `#a04527`, `--olive` `#3d4a2e`, `--gold` `#b8893a` (plus tints). Always use the CSS variables.
- **Fonts:** Fraunces (display serif — titles), Lora (body prose), JetBrains Mono (eyebrows, metadata, labels). Loaded from Google Fonts.
- **Bilingual:** every page has a counterpart with the `-el.html` suffix and an `EN · ΕΛ` toggle in the header. Greek uses the informal **εσύ** form.

## Add a new tutorial (3 steps)

1. **Copy** `tutorials/_template/` to `tutorials/<your-slug>/` and rename.
2. **Fill** the content — search each HTML file for `CUSTOMIZE`, write the English pages, then make the Greek `-el.html` twins. (See `tutorials/_template/README.md` for the full walkthrough.)
3. **Add a card** to `/index.html` and `/index-el.html` — copy an existing `.tutorial-card`, point it at your folder, and set the status badge (`is-complete` / `is-progress` / `is-future`).

## Run locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

Static — deployable to Netlify with a single push. Point Netlify at the repo root with no build command and a publish directory of `.` (the repo root). Every push redeploys.
