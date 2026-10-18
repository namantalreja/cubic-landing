# Cubic

A compact single-page site. Static HTML/CSS and an interactive rotating 3D brand cube. No dependencies or build step.

Run `npm run dev`, then open http://localhost:4173. Python 3 is required for the preview server. Any static host can serve `dist/`.

- `dist/index.html`: company description, company experience, and contact links.
- `dist/styles.css`: responsive layout and typography.
- `dist/cube.js`: the decorative cube's perspective projection, automatic rotation, pause/resume, pointer rotation, and keyboard controls.

Drag the cube, or use arrow keys when focused. Home resets orientation. Space toggles automatic rotation. The small motion control pauses or resumes rotation. Reduced-motion preferences disable automatic rotation by default. Animation stops when offscreen or in a hidden tab.

Fonts: Instrument Serif and DM Sans from Google Fonts, with local fallbacks. Contact: namangatech@gmail.com.

Preserve the project ID in `.openai/hosting.json` for future deployments.
