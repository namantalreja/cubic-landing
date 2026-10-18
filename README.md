# Cubic

A compact single-page site. Static HTML/CSS and an abstract research trajectory drawn on a canvas. No installation or build step.

Run `npm run dev`, then open http://localhost:4173. Python 3 is required for the preview server. Any static host can serve `dist/`.

- `dist/index.html`: one company paragraph, company experience, and a contact button.
- `dist/styles.css`: hairline frame, typography, and responsive rules.
- `dist/trajectory.js`: a 2D canvas rendering of a cubic lattice with a research route drawn through it. The route explores a branch, backtracks, finds another direction, and reconnects as the lattice breathes.
- `dist/cube-motion.js`: shared trajectory and animation timing.

The sketch represents research as a process of decisions, including unsuccessful directions. It is conceptual, not experimental data.

Drag or use arrow keys to rotate. Home resets orientation. Reduced-motion preferences show the completed trajectory without animation. Offscreen and hidden tabs pause rendering.

Fonts: Newsreader, Inter Tight, and Geist Mono from Google Fonts. Contact: namangatech@gmail.com.

Preserve the project ID in `.openai/hosting.json` for future deployments.
