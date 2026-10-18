# Cubic

A compact single-page website for Cubic. Static HTML and CSS, with an interactive three-dimensional research cube rendered in Canvas. No dependencies or build step.

Run `npm run dev`, then open http://localhost:4173. Python 3 is required for this development server. Any static host can serve `dist/` directly.

- `dist/index.html`: company description, founders, and contact links.
- `dist/styles.css`: responsive layout and typography.
- `dist/cube.js`: perspective projection, pointer rotation, keyboard controls, and research stage selection. The cube is conceptual artwork, not experimental data.
- `dist/assets/favicon.svg`: Cubic mark.

Drag the cube to rotate, use arrow keys when focused, or press Home to reset. The research stage buttons and number keys 1–3 highlight different parts of the research trajectory. Touch gestures retain vertical page scrolling.

Fonts: Instrument Serif and DM Sans from Google Fonts, with local fallbacks. Contact: namangatech@gmail.com. Founder affiliations describe prior experience.

Preserve the project ID in `.openai/hosting.json` when updating the deployment.
