# Nguyen Le Anh Thu — Portfolio

Static portfolio website rebuilt from the Canva design
"Nguyễn Lê Anh Thư - Portfolio" (13 sections: hero, introduction, concept project
"Table for Two", the idea, product page, packaging, social captions, published work,
articles and contact).

## Stack

- Plain HTML + CSS, no build step
- Google Fonts: Montserrat, Mrs Saint Delafield, Cormorant Garamond, Arimo

## Run locally

```bash
python3 -m http.server 5173
# open http://127.0.0.1:5173
```

## How the layout works

Each section is a 1366 × 768 artboard, matching the Canva page size. Elements are
positioned with design-pixel values (`--x`, `--y`, `--w`, `--h`) that are converted
to `cqw` units, so on desktop the page scales exactly like the original design.
Below 760px the sections switch to a stacked mobile layout.

```
index.html          markup, one <section> per Canva page
css/styles.css      artboard system, typography, mobile layout
assets/images/      images exported from the Canva design
```

## Deploy

Any static host works (GitHub Pages, Netlify, Vercel). For GitHub Pages, push to
`main` and enable Pages from the repository root.
