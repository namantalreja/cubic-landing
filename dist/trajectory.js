import {route, branch, frameState} from './cube-motion.js';

const canvas = document.querySelector('#trajectory');
const ctx = canvas.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const styles = getComputedStyle(document.documentElement);
const color = name => styles.getPropertyValue(name).trim();

const initial = {x: 0.42, y: -0.68};
let rotation = {...initial}, pointer = null, frame = 0, last = 0, elapsed = 2.7, visible = true, size = 0, dpr = 1;
const lattice = [];
for (let axis = 0; axis < 3; axis++) for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
  const others = [0, 1, 2].filter(v => v !== axis), a = [0, 0, 0], b = [0, 0, 0];
  b[axis] = 3; a[others[0]] = b[others[0]] = i; a[others[1]] = b[others[1]] = j;
  lattice.push({a, b, outside: (i === 0 || i === 3) && (j === 0 || j === 3)});
}
const nodes = [];
for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) for (let z = 0; z < 4; z++) nodes.push([x, y, z]);

// Paths the route could have taken: deterministic lattice walks from the same origin.
const smooth = x => { const n = Math.max(0, Math.min(1, x)); return n * n * (3 - 2 * n); };
function walks(count, steps, seed) {
  let state = seed;
  const random = () => { state = (state + 0x6d2b79f5) | 0; let t = Math.imul(state ^ (state >>> 15), 1 | state); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const taken = new Set(route.map(String)), result = [];
  for (let n = 0; n < count; n++) {
    const path = [route[0]], seen = new Set([String(route[0])]);
    let lastAxis = -1;
    for (let i = 0; i < steps; i++) {
      const current = path[path.length - 1], options = [];
      for (let axis = 0; axis < 3; axis++) for (const dir of [-1, 1]) {
        const next = current.slice(); next[axis] += dir;
        if (next[axis] < 0 || next[axis] > 3 || seen.has(String(next))) continue;
        options.push({next, weight: (axis === lastAxis ? 0.35 : 1) * (taken.has(String(next)) ? 0.4 : 1)});
      }
      if (!options.length) break;
      let pick = random() * options.reduce((sum, o) => sum + o.weight, 0), choice = options[0];
      for (const option of options) { pick -= option.weight; if (pick <= 0) { choice = option; break; } }
      path.push(choice.next); seen.add(String(choice.next)); lastAxis = choice.next.findIndex((v, k) => v !== current[k]);
    }
    result.push(path);
  }
  return result;
}
const alternatives = walks(9, 9, 1123);

function project(index, spread, yaw) {
  const x = (index[0] - 1.5) * 0.9, y = (index[1] - 1.5) * 0.9 * spread, z = (index[2] - 1.5) * 0.9;
  const a = x * Math.cos(yaw) + z * Math.sin(yaw), b = z * Math.cos(yaw) - x * Math.sin(yaw);
  const yy = y * Math.cos(rotation.x) - b * Math.sin(rotation.x), zz = y * Math.sin(rotation.x) + b * Math.cos(rotation.x);
  const scale = size * 0.19;
  return [size / 2 + a * scale, size / 2 - yy * scale, zz];
}
function lerp(a, b, t) { return a.map((v, i) => v + (b[i] - v) * t); }
function stroke(points, style, width, dash) {
  ctx.beginPath();
  points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
  ctx.strokeStyle = style; ctx.lineWidth = width; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
}

function draw() {
  const still = reduced.matches, state = frameState(elapsed, still), spread = 1;
  const yaw = rotation.y + (still ? 0 : Math.sin(elapsed * 0.22) * 0.1);
  const ink = color('--ink'), faint = color('--faint'), rule = color('--rule'), accent = color('--accent');
  ctx.clearRect(0, 0, size, size);

  for (const part of lattice) {
    const p = project(part.a, spread, yaw), q = project(part.b, spread, yaw);
    const depth = (p[2] + q[2]) / 2;
    const alpha = part.outside ? 0.55 + depth * 0.08 : 0.16 + depth * 0.04;
    ctx.globalAlpha = Math.max(0.05, Math.min(1, alpha));
    stroke([p, q], part.outside ? ink : faint, part.outside ? 0.9 : 0.6);
  }
  ctx.globalAlpha = 1;
  for (const node of nodes) {
    const p = project(node, spread, yaw);
    ctx.fillStyle = rule; ctx.globalAlpha = 0.9;
    ctx.fillRect(p[0] - 0.9, p[1] - 0.9, 1.8, 1.8);
  }
  ctx.globalAlpha = 1;

  if (state.branch > 0.01) {
    const points = [];
    for (let i = 0; i < branch.length - 1; i++) {
      const part = Math.max(0, Math.min(1, state.branch - i));
      if (!points.length) points.push(project(branch[i], spread, yaw));
      if (part > 0) points.push(project(lerp(branch[i], branch[i + 1], part), spread, yaw));
    }
    ctx.globalAlpha = Math.min(1, state.branch) * 0.7 * state.opacity;
    stroke(points, ink, 0.9, [3, 4]);
    ctx.globalAlpha = 1;
  }

  const path = [project(route[0], spread, yaw)];
  for (let i = 0; i < route.length - 1; i++) {
    const part = Math.max(0, Math.min(1, state.progress - i));
    if (part <= 0) break;
    path.push(project(lerp(route[i], route[i + 1], part), spread, yaw));
  }
  ctx.globalAlpha = state.opacity;
  stroke(path, ink, 1.6);
  route.forEach((index, i) => {
    const reveal = Math.max(0, Math.min(1, (state.progress - i + 0.12) / 0.3));
    if (reveal <= 0) return;
    const p = project(index, spread, yaw), s = 2.2 + reveal * 3.2;
    ctx.fillStyle = color('--paper'); ctx.fillRect(p[0] - s / 2 - 1.5, p[1] - s / 2 - 1.5, s + 3, s + 3);
    ctx.fillStyle = ink; ctx.fillRect(p[0] - s / 2, p[1] - s / 2, s, s);
  });
  const cycle = elapsed % 16, flash = still ? 0 : smooth((cycle - 11.55) / 0.3) * (1 - smooth((cycle - 12.7) / 1.9));
  if (flash > 0.005) {
    alternatives.forEach((walk, i) => {
      const reach = Math.min(1, flash * 1.6 + i * 0.02), count = 1 + Math.floor((walk.length - 1) * reach);
      const points = walk.slice(0, count + 1).map(index => project(index, spread, yaw));
      ctx.globalAlpha = flash * (0.28 + (i % 3) * 0.1) * state.opacity;
      stroke(points, i % 4 === 0 ? accent : ink, 0.9, [1.2, 3.6]);
      const end = points[points.length - 1];
      ctx.beginPath(); ctx.arc(end[0], end[1], 2.2, 0, Math.PI * 2); ctx.strokeStyle = i % 4 === 0 ? accent : ink; ctx.lineWidth = 0.8; ctx.stroke();
    });
    ctx.globalAlpha = state.opacity;
  }
  const head = path[path.length - 1];
  const pulse = still ? 0 : (Math.sin(elapsed * 2.6) + 1) / 2;
  ctx.beginPath(); ctx.arc(head[0], head[1], 7 + pulse * 5, 0, Math.PI * 2);
  ctx.strokeStyle = accent; ctx.lineWidth = 0.8; ctx.globalAlpha = state.opacity * (0.45 - pulse * 0.3); ctx.stroke();
  ctx.globalAlpha = state.opacity;
  ctx.beginPath(); ctx.arc(head[0], head[1], 3.4, 0, Math.PI * 2); ctx.fillStyle = accent; ctx.fill();
  ctx.globalAlpha = 1;
}

function tick(time) {
  frame = 0;
  const dt = last ? Math.min((time - last) / 1000, 0.05) : 0; last = time;
  if (!reduced.matches) elapsed += dt;
  draw();
  if (!reduced.matches && visible && !document.hidden) frame = requestAnimationFrame(tick);
}
function render() { if (!frame) frame = requestAnimationFrame(tick); }
function resize() {
  size = canvas.clientWidth; dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(size * dpr); canvas.height = Math.round(size * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); render();
}

canvas.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  pointer = {id: e.pointerId, x: e.clientX, y: e.clientY}; canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging');
});
canvas.addEventListener('pointermove', e => {
  if (!pointer || e.pointerId !== pointer.id) return;
  rotation.y += (e.clientX - pointer.x) * 0.009;
  rotation.x = Math.max(-1.25, Math.min(1.25, rotation.x + (e.clientY - pointer.y) * 0.009));
  pointer.x = e.clientX; pointer.y = e.clientY; render();
});
function release() { pointer = null; last = 0; canvas.classList.remove('dragging'); render(); }
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => canvas.addEventListener(name, release));
canvas.addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(e.key)) return;
  e.preventDefault();
  if (e.key === 'ArrowLeft') rotation.y -= 0.14;
  if (e.key === 'ArrowRight') rotation.y += 0.14;
  if (e.key === 'ArrowUp') rotation.x = Math.max(-1.25, rotation.x - 0.14);
  if (e.key === 'ArrowDown') rotation.x = Math.min(1.25, rotation.x + 0.14);
  if (e.key === 'Home') rotation = {...initial};
  render();
});
reduced.addEventListener('change', () => { last = 0; render(); });
document.addEventListener('visibilitychange', () => { last = 0; if (!document.hidden) render(); });
new IntersectionObserver(entries => { visible = entries[0].isIntersecting; last = 0; if (visible) render(); }).observe(canvas);
window.addEventListener('resize', resize);
document.fonts?.ready.then(resize);
resize();
document.documentElement.classList.add('fonts-ready');
