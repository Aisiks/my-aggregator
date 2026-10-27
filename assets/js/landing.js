// ============================================================
// landing.js — логика главной страницы PRISM
// 1) переключатель языка; 2) переключатель режима в hero-форме;
// 3) передача вопроса в приложение (и через ?q=, и через sessionStorage).
// ============================================================

initLangSwitch();

const form = document.getElementById('hero-form');
const modeInput = document.getElementById('hero-mode');
const textarea = document.getElementById('hero-q');

function setHeroMode(mode) {
  modeInput.value = mode;
  form.querySelectorAll('.seg-btn').forEach(b => b.setAttribute('aria-selected', String(b.dataset.mode === mode)));
  const key = mode === 'check' ? 'hero.ph.check' : 'hero.ph.ask';
  textarea.dataset.i18nAttr = `placeholder:${key}`;
  textarea.setAttribute('placeholder', t(key));
}

form.querySelectorAll('.seg-btn').forEach(b => b.addEventListener('click', () => setHeroMode(b.dataset.mode)));

form.addEventListener('submit', e => {
  if (!textarea.value.trim()) { e.preventDefault(); textarea.focus(); return; }
  try { sessionStorage.setItem('prism.pending', JSON.stringify({ q: textarea.value, mode: modeInput.value })); } catch {}
});

// Enter отправляет, Shift+Enter — новая строка
textarea.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); }
});

document.addEventListener('langchange', () => setHeroMode(modeInput.value));
