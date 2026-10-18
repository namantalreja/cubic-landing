# Cubic Labs

A single-page, buildless website for Cubic Labs. HTML, CSS, and original SVG artwork; no JavaScript or package installation required.

## Preview

Run `npm run dev` from this directory, then visit http://localhost:4173. Python 3 is required for the local server. Any static host can serve `dist/` directly.

## Edit

- `dist/index.html`: page copy and contact email.
- `dist/styles.css`: typography, colors, layout, responsive styles, and reduced-motion support.
- `dist/assets/research-space.svg`: original research trajectory illustration.
- `dist/assets/favicon.svg`: original Cubic mark.

The page uses Instrument Serif, DM Sans, from Google Fonts, with local fallback fonts. Contact links open a draft to namangatech@gmail.com.

The research graphic is a conceptual illustration, not experimental data.

## Hosting

`.openai/hosting.json` identifies the private Sites deployment and its static output directory. Preserve the project ID for future updates.
