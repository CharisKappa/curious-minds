# Tutorial template

Copy this folder to start a new tutorial. It carries the house style with no content — just fill in the blanks.

## Files

- `index.html` — the tutorial hub (cover + chapter cards).
- `01-chapter.html` — a single chapter page (TOC sidebar + content + chapter-end nav).
- `README.md` — this file (replace it with a real one for your tutorial).

Both HTML files use the shared design system at `../../shared/styles.css` and `../../shared/script.js`. **Never edit those** — they are shared by every tutorial.

## How to use

1. **Copy & rename.** Duplicate this folder to `tutorials/<your-slug>/` (kebab-case, English, e.g. `tutorials/climate-basics/`).
2. **Fill the English pages.** Open each `.html`, search for `CUSTOMIZE`, and replace each marked spot. Duplicate `01-chapter.html` once per chapter (`02-…`, `03-…`) and add a matching card + nav link in `index.html`.
3. **Make the Greek twins.** For every page, create an `-el.html` copy: set `<html lang="el">`, translate all strings, and use the informal **εσύ** form (not εσείς). The language toggle on each page points EN ↔ ΕΛ.
4. **Wire the TOC.** In each chapter, every `<li><a href="#id">` in the sidebar must match a `<section id="id">` below it. The shared script highlights the active section on scroll — no extra work needed.
5. **Add a card to the hub.** In the root `/index.html` and `/index-el.html`, copy an existing `.tutorial-card` and point it at your new tutorial. Set the status badge: `is-complete` / `is-progress` / `is-future`.

## House style (don't drift)

- **Colors / fonts** come from `shared/styles.css`. Use the CSS variables (`--rust`, `--ink`, …); never hardcode hex.
- **Fonts:** Fraunces (titles), Lora (body), JetBrains Mono (eyebrows/labels).
- **Voice:** opinionated, warm, direct. Greek is informal (εσύ).
- **Reusable blocks** already styled: `.insight`, `.definition`, `.story`, `.trap`, `.pullquote`, `.timeline`, `.data-table`, `.calc`. Copy their markup from a Money Decoded chapter (`tutorials/money-decoded/01-history.html`) when you need them.

It's all static HTML — no build step. Open a file in a browser, or run `python3 -m http.server` from the repo root.
