const POSTS_URL = 'data/posts.json';
const POSTS_PER_PAGE = 10;

let allPosts = [];
let activeQuery = '';
let currentPage = 1;

function highlight(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}

function getPageFromURL() {
  const p = parseInt(new URLSearchParams(window.location.search).get('page'), 10);
  return p > 0 ? p : 1;
}

function pushURL(page) {
  const url = new URL(window.location.href);
  if (page <= 1) {
    url.searchParams.delete('page');
  } else {
    url.searchParams.set('page', page);
  }
  history.pushState({ page }, '', url);
}

function createCard(post, absoluteIndex, query = '') {
  const title = highlight(post.title, query);
  const excerpt = highlight(post.tip, query);
  return `
    <article class="post-card animate-in" onclick="location.href='post.html?slug=${post.slug}'">
      <div class="post-card__bar" data-index="${absoluteIndex}"></div>
      <div class="post-card__content">
        <h2 class="post-card__title">${title}</h2>
        <p class="post-card__excerpt">${excerpt}</p>
        <span class="post-card__link">Leer <span class="arrow">→</span></span>
      </div>
    </article>
  `;
}

function renderPagination(totalPosts, page) {
  const container = document.getElementById('pagination');
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  if (totalPages <= 1) {
    container.innerHTML = '';
    container.hidden = true;
    return;
  }

  container.hidden = false;


  function pageButtons() {
    const pages = [];
    const delta = 1;

    let left = Math.max(1, page - delta);
    let right = Math.min(totalPages, page + delta);


    const range = new Set([1, totalPages]);
    for (let i = left; i <= right; i++) range.add(i);
    const sorted = [...range].sort((a, b) => a - b);

    let prev = 0;
    for (const p of sorted) {
      if (p - prev > 1) pages.push('…');
      pages.push(p);
      prev = p;
    }
    return pages;
  }

  const buttons = pageButtons().map(p => {
    if (p === '…') return `<span class="pagination__ellipsis">…</span>`;
    const active = p === page ? ' is-active' : '';
    return `<button class="pagination__page${active}" onclick="goToPage(${p})" aria-label="Página ${p}" ${p === page ? 'aria-current="page"' : ''}>${p}</button>`;
  }).join('');

  container.innerHTML = `
    <button class="pagination__btn pagination__btn--prev"
      onclick="goToPage(${page - 1})"
      ${page <= 1 ? 'disabled' : ''}
      aria-label="Página anterior">
      ← Anterior
    </button>
    <div class="pagination__pages">${buttons}</div>
    <button class="pagination__btn pagination__btn--next"
      onclick="goToPage(${page + 1})"
      ${page >= totalPages ? 'disabled' : ''}
      aria-label="Página siguiente">
      Siguiente →
    </button>
  `;
}

function goToPage(page, updateURL = true) {
  const posts = activeQuery ? getFilteredPosts() : allPosts;
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);


  page = Math.max(1, Math.min(page, totalPages || 1));
  currentPage = page;

  const start = (page - 1) * POSTS_PER_PAGE;
  const pagePosts = posts.slice(start, start + POSTS_PER_PAGE);

  const grid = document.getElementById('posts-grid');

  if (pagePosts.length === 0) {
    grid.innerHTML = `<div class="empty-state"><p>Sin resultados para "<strong>${activeQuery}</strong>".</p></div>`;
    document.getElementById('pagination').hidden = true;
  } else {
    grid.innerHTML = pagePosts
      .map((post, i) => {

        const absoluteIndex = allPosts.findIndex(p => p.id === post.id);
        return createCard(post, absoluteIndex, activeQuery);
      })
      .join('');
    renderPagination(posts.length, page);
  }

  if (updateURL && !activeQuery) pushURL(page);


  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getFilteredPosts() {
  const q = activeQuery.toLowerCase();
  return allPosts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.tip.toLowerCase().includes(q) ||
    p.content.toLowerCase().includes(q)
  );
}

window.handleSearchQuery = function (query) {
  activeQuery = query.trim();

  if (!activeQuery) {

    goToPage(currentPage, false);
    return;
  }


  const matches = getFilteredPosts();
  const grid = document.getElementById('posts-grid');

  if (matches.length === 0) {
    grid.innerHTML = `<div class="empty-state"><p>Sin resultados para "<strong>${activeQuery}</strong>".</p></div>`;
    document.getElementById('pagination').hidden = true;
    return;
  }

  grid.innerHTML = matches
    .map(post => {
      const absoluteIndex = allPosts.findIndex(p => p.id === post.id);
      return createCard(post, absoluteIndex, activeQuery);
    })
    .join('');

  document.getElementById('pagination').hidden = true;
};

async function loadPosts() {
  const grid = document.getElementById('posts-grid');

  try {
    const response = await fetch(POSTS_URL);
    if (!response.ok) throw new Error(`Error ${response.status}`);

    const posts = await response.json();

    if (!Array.isArray(posts) || posts.length === 0) {
      grid.innerHTML = '<div class="empty-state"><p>Pronto vas a encontrar algo acá. 🐾</p></div>';
      return;
    }


    allPosts = [...posts].sort((a, b) => b.id - a.id);
    currentPage = getPageFromURL();

    goToPage(currentPage, false);

  } catch (error) {
    console.error('Error cargando posts:', error);
    grid.innerHTML = `<div class="empty-state"><p>Algo salió mal. Intentá de nuevo más tarde.</p></div>`;
  }
}

window.addEventListener('popstate', (event) => {
  const page = event.state?.page ?? 1;
  currentPage = page;
  goToPage(page, false);
});

loadPosts();