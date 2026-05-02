const POSTS_URL = 'data/posts.json';
const BASE_URL = 'https://estebanzarate.github.io/in-dogs-we-trust/';
const POST_COLORS = ['#3B71CA', '#DC4C64', '#14A44D', '#E4A11B'];

window.handleSearchQuery = function (query) {
  const q = query.trim();
  if (q) window.location.href = `index.html?q=${encodeURIComponent(q)}`;
};

function applyPostColors(index) {
  const color = POST_COLORS[index % POST_COLORS.length];
  const tipEl = document.querySelector('.post-section--tip');
  const contentEl = document.querySelector('.post-section--content');

  if (tipEl) tipEl.style.background = color;
  if (contentEl) {
    contentEl.style.background = '#332D2D';
    contentEl.style.borderTop = `4px solid ${color}`;
  }
}

function renderContent(paragraphs) {
  const section = document.getElementById('post-content-section');
  if (!section) return;
  const content = Array.isArray(paragraphs)
    ? paragraphs.map(p => `<p class="post-section__text">${p}</p>`).join('')
    : `<p class="post-section__text">${paragraphs}</p>`;
  section.innerHTML = content;
}

function renderShare(post) {
  const container = document.getElementById('post-share');
  if (!container) return;

  const shareUrl = `${BASE_URL}post.html?slug=${post.slug}`;
  const shareTitle = `${post.title} — In D🐾gs We Trust`;
  const shareText = `${post.title}\n\n${post.tip}`;

  const canShare = navigator.share !== undefined;

  container.innerHTML = `
    <button class="share-btn" id="share-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
      Compartir
    </button>
    <span class="share-feedback" id="share-feedback"></span>
  `;

  document.getElementById('share-btn').addEventListener('click', async () => {
    if (canShare) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      } catch (e) {
        if (e.name !== 'AbortError') copyFallback(shareUrl);
      }
    } else {
      copyFallback(shareUrl);
    }
  });

  function copyFallback(url) {
    navigator.clipboard.writeText(url).then(() => {
      const fb = document.getElementById('share-feedback');
      fb.textContent = '¡Link copiado!';
      setTimeout(() => { fb.textContent = ''; }, 2500);
    });
  }
}

function renderError(message) {
  document.getElementById('post-title').textContent = 'Página no encontrada';
  document.querySelector('.post-body').innerHTML = `
    <div class="empty-state">
      <p>${message}</p>
      <a href="index.html" style="margin-top:16px;display:inline-block;font-weight:600;color:var(--primary);">← Volver</a>
    </div>
  `;
}

function renderNav(sorted, currentIndex) {
  const nav = document.getElementById('post-nav');
  const anterior = sorted[currentIndex - 1];
  const siguiente = sorted[currentIndex + 1];

  let html = '';
  if (anterior) {
    html += `<a class="post-nav__btn" href="post.html?slug=${anterior.slug}">← ${anterior.title}</a>`;
  } else {
    html += '<span></span>';
  }
  if (siguiente) {
    html += `<a class="post-nav__btn" href="post.html?slug=${siguiente.slug}">${siguiente.title} →</a>`;
  }
  nav.innerHTML = html;
}

async function loadPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    renderError('Algo salió mal. Intentá de nuevo más tarde.');
    return;
  }

  try {
    const response = await fetch(POSTS_URL);
    if (!response.ok) throw new Error(`Error ${response.status}`);

    const posts = await response.json();
    const sorted = [...posts].sort((a, b) => b.id - a.id);
    const index = sorted.findIndex(p => p.slug === slug);

    if (index === -1) {
      renderError('Algo salió mal. Intentá de nuevo más tarde.');
      return;
    }

    const post = sorted[index];

    document.title = `${post.title} — In D🐾gs We Trust`;

    const shareUrl = `${BASE_URL}post.html?slug=${post.slug}`;
    const ogTitle = `${post.title} — In D🐾gs We Trust`;
    const ogDesc = post.tip.length > 140 ? post.tip.slice(0, 137) + '…' : post.tip;
    const setMeta = (id, val) => { const el = document.getElementById(id); if (el) el.setAttribute('content', val); };
    setMeta('og-title', ogTitle);
    setMeta('og-description', ogDesc);
    setMeta('og-url', shareUrl);
    setMeta('tw-title', ogTitle);
    setMeta('tw-description', ogDesc);
    const metaDesc = document.getElementById('meta-description');
    if (metaDesc) metaDesc.setAttribute('content', ogDesc);

    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-tip').textContent = post.tip;

    renderContent(post.content);
    applyPostColors(index);
    renderNav(sorted, index);
    renderShare(post);

    window.postNav = {
      anterior: sorted[index - 1] ? `post.html?slug=${sorted[index - 1].slug}` : null,
      siguiente: sorted[index + 1] ? `post.html?slug=${sorted[index + 1].slug}` : null,
    };

  } catch (error) {
    console.error('Error cargando el post:', error);
    renderError('Algo salió mal. Intentá de nuevo más tarde.');
  }
}

loadPost();