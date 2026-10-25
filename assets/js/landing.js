// ============================================================
// landing.js — логика главной страницы
// 1) рисует список агентов из AGENTS_UI (один источник данных, DRY)
// 2) включает переключатель языка
// ============================================================

function renderAgentList(lang = getLang()) {
  const list = document.getElementById('agent-list');
  if (!list) return;
  list.innerHTML = AGENTS_UI.map(a => `
    <li class="agent-row" style="--c: var(--${a.id})">
      <span class="agent-dot"></span>
      <div>
        <p class="agent-name">${a.name} <span class="agent-role">${a.role[lang]}</span></p>
        <p class="agent-desc">${a.desc[lang]}</p>
      </div>
      <span class="agent-vendor">${a.vendor}</span>
    </li>`).join('');
}

initLangSwitch();
renderAgentList();
document.addEventListener('langchange', e => renderAgentList(e.detail));

// Вопрос из hero-формы дублируем в sessionStorage: на некоторых хостингах
// параметр ?q= может потеряться при переходе, а так приложение его всё равно найдёт.
const heroForm = document.querySelector('.hero-ask');
if (heroForm) {
  heroForm.addEventListener('submit', () => {
    try { sessionStorage.setItem('prism.pendingQ', heroForm.q.value); } catch {}
  });
}
