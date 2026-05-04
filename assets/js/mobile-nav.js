const MOBILE_BP = 640;

function buildMobileMenu() {
  const menu = document.createElement('div');
  menu.id = 'mobile-menu';
  menu.className = 'mobile-menu';
  menu.setAttribute('aria-hidden', 'true');

  const isAbout = window.location.pathname.includes('about');
  const isPost = window.location.pathname.includes('post');
  const activeAbout = isAbout ? ' is-active' : '';

  menu.innerHTML = `
    <div class="mobile-menu__inner">
      <a href="index.html" class="mobile-menu__item">Inicio</a>
      <a href="about.html" class="mobile-menu__item${activeAbout}">Acerca de</a>
      <div class="mobile-menu__divider"></div>
      <button class="mobile-menu__item mobile-menu__item--btn" id="mm-theme">
        <span id="mm-theme-label"></span>
      </button>
      <button class="mobile-menu__item mobile-menu__item--btn" id="mm-help">Atajos de teclado</button>
      <button class="mobile-menu__item mobile-menu__item--btn" id="mm-search">Buscar</button>
    </div>
  `;

  document.body.appendChild(menu);

  updateThemeLabel();

  document.getElementById('mm-theme').addEventListener('click', () => {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.click();
    closeMobileMenu();
    setTimeout(updateThemeLabel, 50);
  });

  document.getElementById('mm-help').addEventListener('click', () => {
    closeMobileMenu();
    setTimeout(() => { if (typeof openHelp === 'function') openHelp(); }, 200);
  });

  document.getElementById('mm-search').addEventListener('click', () => {
    closeMobileMenu();
    setTimeout(() => { if (typeof window.openSearch === 'function') window.openSearch(); }, 200);
  });

  return menu;
}

function updateThemeLabel() {
  const label = document.getElementById('mm-theme-label');
  if (!label) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  label.textContent = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
}

function openMobileMenu() {
  const menu = document.getElementById('mobile-menu') || buildMobileMenu();
  const ham = document.getElementById('hamburger-btn');
  menu.classList.add('is-open');
  menu.setAttribute('aria-hidden', 'false');
  if (ham) ham.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const ham = document.getElementById('hamburger-btn');
  if (!menu) return;
  menu.classList.remove('is-open');
  menu.setAttribute('aria-hidden', 'true');
  if (ham) ham.classList.remove('is-open');
  document.body.style.overflow = '';
}

function mountHamburger() {
  const actions = document.querySelector('.navbar__actions');
  if (!actions) return;

  const btn = document.createElement('button');
  btn.id = 'hamburger-btn';
  btn.className = 'hamburger-btn';
  btn.setAttribute('aria-label', 'Menú');
  btn.innerHTML = `
    <span class="hamburger-btn__line"></span>
    <span class="hamburger-btn__line"></span>
    <span class="hamburger-btn__line"></span>
  `;

  btn.addEventListener('click', () => {
    const isOpen = document.getElementById('mobile-menu')?.classList.contains('is-open');
    isOpen ? closeMobileMenu() : openMobileMenu();
  });

  actions.appendChild(btn);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileMenu();
});

document.addEventListener('DOMContentLoaded', mountHamburger);