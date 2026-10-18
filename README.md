# Cubic

A compact single-page site. Static HTML/CSS and a three-dimensional research trajectory. No installation or build step. Three.js 0.180.0 and its MIT license are bundled locally.

Run `npm run dev`, then open http://localhost:4173. Python 3 is required for the preview server. Any static host can serve `dist/`.

- `dist/index.html`: one company paragraph, company experience, and contact links.
- `dist/cube.js`: a cubic lattice opens to expose a research route. The route explores a branch, backtracks, finds another direction, and reconnects as the cube closes.
- `dist/cube-motion.js`: shared trajectory and animation timing.
- `dist/cube-fallback.js`: Canvas renderer with the same trajectory for devices without WebGL.
- `dist/assets/vendor/`: bundled Three.js modules and license.

The sculpture represents research as a process of decisions, including unsuccessful directions. It is conceptual, not experimental data. There are no stages or explainer panels.

Drag or use arrow keys to rotate. Home resets orientation. Space or the small motion button toggles animation. Reduced-motion preferences show the completed trajectory without animation. Offscreen and hidden tabs pause rendering.

Fonts: Instrument Serif and DM Sans from Google Fonts. Contact: namangatech@gmail.com.

Preserve the project ID in `.openai/hosting.json` for future deployments.
