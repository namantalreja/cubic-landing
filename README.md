# Cubic

A compact single-page site. Static HTML/CSS and an interactive rotating 3D brand cube. No installation or build step. Three.js 0.180.0 and its MIT license are bundled locally.

Run `npm run dev`, then open http://localhost:4173. Python 3 is required for the preview server. Any static host can serve `dist/`.

- `dist/index.html`: company description, company experience, and contact links.
- `dist/styles.css`: responsive layout and typography.
- `dist/cube.js`: WebGL glass cube, rounded geometry, studio reflections, and rotation controls.
- `dist/cube-fallback.js`: lightweight Canvas fallback for devices without WebGL.
- `dist/assets/vendor/`: bundled Three.js modules and license.

Drag the cube, or use arrow keys when focused. Home resets orientation. Space toggles automatic rotation. The small motion control pauses or resumes rotation. Reduced-motion preferences disable automatic rotation by default. Animation stops when offscreen or in a hidden tab.

Fonts: Instrument Serif and DM Sans from Google Fonts, with local fallbacks. Contact: namangatech@gmail.com.

Preserve the project ID in `.openai/hosting.json` for future deployments.
