const IS_INDEX = document.getElementById('posts-grid') !== null;

const SHORTCUTS = [
  { keys: ['Ctrl', 'B'], desc: 'Abrir / cerrar el buscador' },
  { keys: ['Ctrl', 'H'], desc: 'Abrir / cerrar esta ayuda' },
  { keys: ['Ctrl', '→'], desc: IS_INDEX ? 'Página siguiente' : 'Post siguiente' },
  { keys: ['Ctrl', '←'], desc: IS_INDEX ? 'Página anterior' : 'Post anterior' },
  { keys: ['Ctrl', 'Inicio'], desc: IS_INDEX ? 'Primera página' : 'Volver al inicio' },
  { keys: ['Esc'], desc: 'Cerrar buscador o esta ayuda' },
];

function buildModal() {
  const modal = document.createElement('div');
  modal.id = 'help-modal';
  modal.className = 'help-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'Atajos de teclado');

  const rows = SHORTCUTS.map(s => {
    const keys = s.keys.map(k => `<kbd>${k}</kbd>`).join('<span class="help-modal__plus">+</span>');
    return `
      <div class="help-modal__row">
        <div class="help-modal__keys">${keys}</div>
        <span class="help-modal__desc">${s.desc}</span>
      </div>
    `;
  }).join('');

  modal.innerHTML = `
    <div class="help-modal__backdrop"></div>
    <div class="help-modal__box">
      <div class="help-modal__header">
        <span class="help-modal__title">Atajos de teclado</span>
        <button class="help-modal__close" id="help-modal-close" aria-label="Cerrar ayuda">✕</button>
      </div>
      <div class="help-modal__body">
        ${rows}
      </div>
      <div class="help-modal__footer">
        Usá <kbd>Esc</kbd> para cerrar
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

let modal;

function openHelp() {
  if (!modal) modal = buildModal();
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('help-modal-close').addEventListener('click', closeHelp, { once: true });
  modal.querySelector('.help-modal__backdrop').addEventListener('click', closeHelp, { once: true });
}

function closeHelp() {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
}

function toggleHelp() {
  if (!modal || !modal.classList.contains('is-open')) openHelp();
  else closeHelp();
}

function navNext() {
  if (IS_INDEX) {

    const nextBtn = document.querySelector('.pagination__btn--next:not([disabled])');
    if (nextBtn) nextBtn.click();
  } else {
    if (window.postNav?.siguiente) location.href = window.postNav.siguiente;
  }
}

function navPrev() {
  if (IS_INDEX) {
    const prevBtn = document.querySelector('.pagination__btn--prev:not([disabled])');
    if (prevBtn) prevBtn.click();
  } else {
    if (window.postNav?.anterior) location.href = window.postNav.anterior;
  }
}

function navFirst() {
  if (IS_INDEX) {
    window.goToPage(1);
  } else {
    location.href = 'index.html';
  }
}

document.addEventListener('keydown', (e) => {

  const inInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);

  if (e.key === 'Escape') {
    closeHelp();

    return;
  }

  if (inInput) return;

  const ctrl = e.ctrlKey || e.metaKey;

  if (ctrl && e.key.toLowerCase() === 'b') {
    e.preventDefault();
    const isOpen = document.getElementById('search-panel')?.classList.contains('is-open');
    isOpen ? window.closeSearch?.() : window.openSearch?.();
    return;
  }

  if (ctrl && e.key.toLowerCase() === 'h') {
    e.preventDefault();
    toggleHelp();
    return;
  }

  if (ctrl && e.key === 'ArrowRight') {
    e.preventDefault();
    navNext();
    return;
  }

  if (ctrl && e.key === 'ArrowLeft') {
    e.preventDefault();
    navPrev();
    return;
  }

  if (ctrl && (e.key === 'Home')) {
    e.preventDefault();
    navFirst();
    return;
  }
});

function mountHelpButton() {
  const actions = document.querySelector('.navbar__actions');
  const toggle = document.getElementById('search-toggle');
  if (!actions || !toggle) return;

  const btn = document.createElement('button');
  btn.className = 'help-toggle';
  btn.id = 'help-toggle';
  btn.setAttribute('aria-label', 'Atajos de teclado');
  btn.title = 'Atajos (Ctrl+H)';
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  `;
  btn.addEventListener('click', toggleHelp);
  actions.insertBefore(btn, toggle);
}

mountHelpButton();