# Nguyen Le Anh Thu — Portfolio

Static portfolio website rebuilt from the Canva design
"Nguyễn Lê Anh Thư - Portfolio" (13 sections: hero, introduction, concept project
"Table for Two", the idea, product page, packaging, social captions, published work,
articles and contact).

## Stack

- Plain HTML + CSS, no build step
- Google Fonts: Montserrat, Mrs Saint Delafield

## Run locally

```bash
python3 -m http.server 5173
# open http://127.0.0.1:5173
```

## How the layout works

Each section is a 1366 × 768 artboard, matching the Canva page size. Elements are
positioned with design-pixel values (`--x`, `--y`, `--w`, `--h`) that are converted
to `cqw` units, so on desktop the page scales exactly like the original design.
Below 900px (phones, tablets in portrait) the sections switch to a stacked layout
with a readable max line length.

```
index.html          markup, one <section> per Canva page
css/styles.css      artboard system, typography, mobile layout
css/motion.css      navigation, animations, lightbox, back-to-top
js/main.js          scroll reveal, parallax, active nav, mobile menu, lightbox
assets/images/      images exported from the Canva design
```

## Motion & navigation

- Floating pill navigation (desktop) / hamburger full-screen menu (≤1100px),
  auto-hides on scroll down, highlights the current section
- Hero intro: staggered letters, hand-written signature reveal, scroll cue
- Scroll reveal for headings, text, lists and images; subtle background parallax
  on desktop
- Scroll progress bar, back-to-top button, click-to-zoom lightbox for mockups
- Respects `prefers-reduced-motion`; content stays visible without JavaScript

When changing CSS/JS, bump the `?v=` query in `index.html` so visitors get the
new files instead of a cached copy.

## Deploy

Any static host works (GitHub Pages, Netlify, Vercel). For GitHub Pages, push to
`main` and enable Pages from the repository root.
