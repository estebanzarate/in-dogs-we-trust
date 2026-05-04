const ZOOM_KEY = 'idwt-font-zoom';
const ZOOM_SIZES = { sm: '0.92rem', md: '1rem', lg: '1.13rem', xl: '1.28rem' };
const ZOOM_STEPS = ['sm', 'md', 'lg', 'xl'];

let currentZoom = localStorage.getItem(ZOOM_KEY) || 'md';

function applyZoom(level) {
  currentZoom = level;
  document.documentElement.style.setProperty('--reading-font-size', ZOOM_SIZES[level]);
  localStorage.setItem(ZOOM_KEY, level);

  const btns = document.querySelectorAll('.zoom-btn');
  btns.forEach(b => b.classList.toggle('is-active', b.dataset.zoom === level));
}

function mountZoomControl() {
  const header = document.querySelector('.post-header .container');
  if (!header) return;

  const bar = document.createElement('div');
  bar.className = 'zoom-bar';
  bar.setAttribute('aria-label', 'Tamaño del texto');

  const labels = { sm: 'A−', md: 'A', lg: 'A+', xl: 'A++' };

  bar.innerHTML = ZOOM_STEPS.map(step => `
    <button
      class="zoom-btn${step === currentZoom ? ' is-active' : ''}"
      data-zoom="${step}"
      aria-label="Texto ${labels[step]}"
      title="Texto ${labels[step]}"
    >${labels[step]}</button>
  `).join('');

  bar.querySelectorAll('.zoom-btn').forEach(btn => {
    btn.addEventListener('click', () => applyZoom(btn.dataset.zoom));
  });

  header.appendChild(bar);
  applyZoom(currentZoom);
}

document.addEventListener('DOMContentLoaded', mountZoomControl);