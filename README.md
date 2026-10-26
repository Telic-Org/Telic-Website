# Telic website

Static site — no build step, no external dependencies. Open `index.html` in a browser, or run `python -m http.server` here.

## Pages
- `index.html` — Home: keyboard hero, live TradeDesk demo, three differentiators, hours band
- `product.html` — How it works: single-step simulator, learning history, edge cases, run receipt
- `use-cases.html` — Workflow explorer, where it runs, who it's for
- `pricing.html` — Try / Pilot / Run, why it gets cheaper, hours calculator, FAQ
- `contact.html` — Workflow form and what happens next

Shared: `styles.css`, `main.js`, `assets/` (logomark, favicon, fonts).

## Motion
Loading screen (logo draws itself; once per browser session), orange page-transition wipe, custom cursor,
line-by-line headline reveals, scroll-lit manifesto, stacking cards and a pinned sideways-scrolling
section on Home, parallax marks on page headers. Also: dark sections open out like a sheet, the demo window tilts up into place,
the hero keyboard is "taken over" as you scroll, labels decode like a machine reading them, stacked cards recede,
the hours figure rolls like an odometer, the marquee reacts to scroll speed, an orange light follows the cursor
on dark sections, and the footer is revealed as the page lifts away — with a Poetic-style pixel trail, a live IST
clock, and a giant wordmark whose letters lean away from the cursor. All of it switches off for visitors who prefer reduced motion.

Colours: beige (#f3ecdf), navy (#13213f), orange (#ea5b25, marks AI moments). Soft blue (#7fa6e0) marks a person stepping in.

## Type
- Headlines: Instrument Serif (default). Fraunces and Bricolage Grotesque are included as alternatives.
- Body: Geist. Code-like text (demo log, receipt): Geist Mono.
- Akturi: the Telic wordmark, labels, keycaps, counters and machine UI.
  Akturi is a commercial typeface licensed to Telic (Supply Family webfont licence) — do not redistribute the files outside the site.
  The other fonts are SIL Open Font Licence (licence files in `assets/fonts`).

## Before launch
The bottom-left "Headline font" picker is a preview tool. Once you've picked a font, remove the
`<div class="fontpick">` block from each page and the font-picker section in `main.js`
(and set the chosen font as the default `--serif` in `styles.css`).

The contact form opens an email to daksh@telic.sh — change the address in `contact.html` and `main.js` if needed.
