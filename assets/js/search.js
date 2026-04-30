function openSearch() {
  const panel = document.getElementById('search-panel');
  const toggle = document.getElementById('search-toggle');
  const input = document.getElementById('search-input');

  panel.classList.add('is-open');
  panel.setAttribute('aria-hidden', 'false');
  toggle.classList.add('is-active');

  setTimeout(() => input.focus(), 150);
}

function closeSearch() {
  const panel = document.getElementById('search-panel');
  const toggle = document.getElementById('search-toggle');
  const input = document.getElementById('search-input');

  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  toggle.classList.remove('is-active');

  input.value = '';

  if (typeof window.handleSearchQuery === 'function') {
    window.handleSearchQuery('');
  }
}

function initSearch() {
  const toggle = document.getElementById('search-toggle');
  const closeBtn = document.getElementById('search-close');
  const input = document.getElementById('search-input');

  toggle.addEventListener('click', () => {
    const isOpen = document.getElementById('search-panel').classList.contains('is-open');
    isOpen ? closeSearch() : openSearch();
  });

  closeBtn.addEventListener('click', closeSearch);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
  });

  input.addEventListener('input', e => {
    if (typeof window.handleSearchQuery === 'function') {
      window.handleSearchQuery(e.target.value);
    }
  });


  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    openSearch();
    input.value = q;
    if (typeof window.handleSearchQuery === 'function') {
      window.handleSearchQuery(q);
    }
  }
}

initSearch();

window.openSearch = openSearch;
window.closeSearch = closeSearch;