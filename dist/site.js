const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = [...document.querySelectorAll('.reveal')];
if (reduced || !('IntersectionObserver' in window)) {
  reveals.forEach(el => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
  }, {rootMargin: '0px 0px -8% 0px', threshold: 0.05});
  reveals.forEach(el => io.observe(el));
}

const links = [...document.querySelectorAll('.index a')];
const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
function setActive(id) {
  links.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === '#' + id));
}
if (sections.length && 'IntersectionObserver' in window) {
  const ratios = new Map();
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
    let best = null, max = 0;
    for (const [id, ratio] of ratios) if (ratio > max) { max = ratio; best = id; }
    if (best) setActive(best);
  }, {rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]});
  sections.forEach(section => io.observe(section));
}
