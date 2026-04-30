const POSTS_URL = 'data/posts.json';

const POST_COLORS = ['#3B71CA', '#DC4C64', '#14A44D', '#E4A11B'];

window.handleSearchQuery = function (query) {
  const q = query.trim();
  if (q) window.location.href = `index.html?q=${encodeURIComponent(q)}`;
};

function applyPostColors(index) {
  const color = POST_COLORS[index % POST_COLORS.length];
  const tipEl = document.querySelector('.post-section--tip');
  const whyEl = document.querySelector('.post-section--why');


  if (tipEl) tipEl.style.background = color;


  if (whyEl) {
    whyEl.style.background = '#332D2D';
    whyEl.style.borderTop = `4px solid ${color}`;
  }
}

function renderError(message) {
  document.getElementById('post-title').textContent = 'Post no encontrado';
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
    renderError('No se especificó ningún post.');
    return;
  }

  try {
    const response = await fetch(POSTS_URL);
    if (!response.ok) throw new Error(`Error ${response.status}`);

    const posts = await response.json();

    const sorted = [...posts].sort((a, b) => b.id - a.id);
    const index = sorted.findIndex(p => p.slug === slug);

    if (index === -1) {
      renderError(`No existe un post con el identificador "${slug}".`);
      return;
    }

    const post = sorted[index];

    document.title = `${post.title} — In Dogs We Trust`;

    const ogTitle = `${post.title} — In Dogs We Trust`;
    const ogDesc = post.tip.length > 140 ? post.tip.slice(0, 137) + '…' : post.tip;
    const ogUrl = window.location.href;
    const setMeta = (id, val) => { const el = document.getElementById(id); if (el) el.setAttribute('content', val); };
    setMeta('og-title', ogTitle);
    setMeta('og-description', ogDesc);
    setMeta('og-url', ogUrl);
    setMeta('tw-title', ogTitle);
    setMeta('tw-description', ogDesc);
    const metaDesc = document.getElementById('meta-description');
    if (metaDesc) metaDesc.setAttribute('content', ogDesc);
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-tip').textContent = post.tip;
    document.getElementById('post-why').textContent = post.why;

    applyPostColors(index);
    renderNav(sorted, index);


    window.postNav = {
      anterior: sorted[index - 1] ? "post.html?slug=" + sorted[index - 1].slug : null,
      siguiente: sorted[index + 1] ? "post.html?slug=" + sorted[index + 1].slug : null,
    };

  } catch (error) {
    console.error('Error cargando el post:', error);
    renderError('Ocurrió un error al cargar el post.');
  }
}

loadPost();