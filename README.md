# leomalinen.com

Personal portfolio. A single static page: no build step, no framework, no
dependencies to install. Open `index.html` and it runs.

## What is here

```
index.html        the page
page.css          theme and layout
sweep.js          scroll-driven city lighting and the observation field
scrollcraft.js    scroll engine (reads data-sc-* attributes off the markup)
scrollcraft.css   engine styles and design tokens
assets/           seven WebP plates, all cut from one original render
```

Total, 1.8 MB. Every image on the site is derived from a single 3840x2400
render, graded and cut into depth planes with ffmpeg.

## Running it locally

Any static server. The page uses no APIs and no server-side anything.

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Hosting

Served as-is by GitHub Pages. `.nojekyll` is present so Pages skips its Jekyll
build and serves the files verbatim. All paths are relative, so it works both at
a domain root and under a `/repo-name/` subpath.
