// ============================================================
// app.js — логика приложения Совета
// Порядок работы:
//   ask() → POST /api/council → читаем поток событий →
//   по событию 'agent' рисуем ответ агента, по 'decision' — Решение Совета.
// Каждая функция делает одно дело: render*, handle*, ask, readStream…
// ============================================================

// ---------- Ссылки на элементы ----------
const $ = sel => document.querySelector(sel);
const els = {
  thread: $('#thread'), welcome: $('#welcome'), composer: $('#composer'),
  question: $('#question'), send: $('#send-btn'), toggles: $('#agent-toggles'),
  history: $('#history'), newBtn: $('#new-btn'), exportBtn: $('#export-btn'),
  title: $('#topbar-title'), demo: $('#demo-banner'), meta: $('#composer-meta'),
  sidebar: $('#sidebar'), scrim: $('#scrim'), menuBtn: $('#menu-btn'), toast: $('#toast')
};

// ---------- Состояние ----------
const state = {
  session: null,                 // текущее заседание
  busy: false,                   // идёт ли сейчас запрос
  demo: false,                   // сервер без ключа API?
  agents: loadAgentChoice()      // какие агенты включены
};

function loadAgentChoice() {
  try {
    const saved = JSON.parse(localStorage.getItem('prism.agents'));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {}
  return AGENTS_UI.map(a => a.id);
}
function saveAgentChoice() {
  try { localStorage.setItem('prism.agents', JSON.stringify(state.agents)); } catch {}
}

const agentById = id => AGENTS_UI.find(a => a.id === id);

// ============================================================
// Рендер
// ============================================================

// Чипы агентов над полем ввода — можно выключить ненужных
function renderToggles() {
  const lang = getLang();
  const legend = els.toggles.querySelector('legend');
  els.toggles.innerHTML = '';
  els.toggles.append(legend);
  AGENTS_UI.forEach(a => {
    const on = state.agents.includes(a.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.style.setProperty('--c', `var(--${a.id})`);
    btn.setAttribute('aria-pressed', String(on));
    btn.title = `${a.name} — ${a.role[lang]} (${a.vendor})`;
    btn.innerHTML = `<span class="agent-dot"></span>${a.name}<span class="chip-role">${a.role[lang]}</span>`;
    btn.addEventListener('click', () => toggleAgent(a.id));
    els.toggles.append(btn);
  });
}

function toggleAgent(id) {
  const on = state.agents.includes(id);
  if (on && state.agents.length === 1) return showToast(t('app.minAgents'));
  state.agents = on ? state.agents.filter(x => x !== id) : [...state.agents, id];
  // сохраняем порядок как в AGENTS_UI
  state.agents = AGENTS_UI.map(a => a.id).filter(x => state.agents.includes(x));
  saveAgentChoice();
  renderToggles();
}

// Список прошлых заседаний в боковой панели
function renderHistory() {
  const list = Store.list();
  if (!list.length) {
    els.history.innerHTML = `<li class="history-empty">${t('app.empty.history')}</li>`;
    return;
  }
  els.history.innerHTML = '';
  list.forEach(s => {
    const li = document.createElement('li');
    li.className = 'history-item' + (state.session && state.session.id === s.id ? ' active' : '');
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'history-open';
    open.textContent = s.title;
    open.addEventListener('click', () => { openSession(s.id); closeSidebar(); });
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'history-del';
    del.setAttribute('aria-label', `${t('app.delete')}: ${s.title}`);
    del.innerHTML = '&times;';
    del.addEventListener('click', () => deleteSession(s.id));
    li.append(open, del);
    els.history.append(li);
  });
}

// Один «ход»: вопрос → блок решения → ответы агентов
function renderTurn(turn, index) {
  const wrap = document.createElement('article');
  wrap.className = 'turn';
  wrap.dataset.index = index;

  const q = document.createElement('div');
  q.className = 'question';
  q.textContent = turn.question;

  const decision = document.createElement('section');
  decision.className = 'decision';
  decision.setAttribute('aria-label', t('app.decision'));

  const grid = document.createElement('div');
  grid.className = 'answers';
  turn.agents.forEach(id => grid.append(renderAgentCard(id, turn.answers[id])));

  wrap.append(q, decision, grid);
  updateDecision(decision, turn);
  return wrap;
}

function renderAgentCard(id, answer) {
  const a = agentById(id);
  const lang = getLang();
  const card = document.createElement('div');
  card.className = 'answer';
  card.dataset.agent = id;
  card.style.setProperty('--c', `var(--${id})`);
  card.innerHTML = `
    <header class="answer-head">
      <span class="agent-dot"></span>
      <span class="answer-name">${a.name}</span>
      <span class="answer-role">${a.role[lang]} · ${a.vendor}</span>
    </header>
    <div class="answer-body"></div>
    <button type="button" class="answer-more" hidden></button>`;
  fillAgentCard(card, answer);
  return card;
}

// Заполняем карточку агента: «думает…», ответ или ошибка
function fillAgentCard(card, answer) {
  const body = card.querySelector('.answer-body');
  const more = card.querySelector('.answer-more');
  card.classList.remove('pending', 'failed');
  if (!answer) {
    card.classList.add('pending');
    body.innerHTML = `<p class="thinking">${t('app.thinking')}</p>`;
    return;
  }
  if (answer.error) {
    card.classList.add('failed');
    body.innerHTML = `<p>${escapeHtml(answer.error)}</p>`;
    return;
  }
  body.innerHTML = renderMarkdown(answer.content);
  // Длинные ответы сворачиваем — главное в Решении Совета
  requestAnimationFrame(() => {
    const long = body.scrollHeight > 260;
    card.classList.toggle('collapsed', long);
    more.hidden = !long;
    more.textContent = '↓';
    more.setAttribute('aria-label', 'Развернуть');
    more.onclick = () => {
      const collapsed = card.classList.toggle('collapsed');
      more.textContent = collapsed ? '↓' : '↑';
    };
  });
}

// Блок «Решение Совета»: пока ждём — прогресс по агентам, потом текст
function updateDecision(el, turn) {
  if (turn.decision) {
    el.className = 'decision ready';
    el.innerHTML = `
      <header class="decision-head">
        <h2>${t('app.decision')}</h2>
        <button type="button" class="btn btn-ghost copy-btn">${t('app.copy')}</button>
      </header>
      <div class="decision-body">${renderMarkdown(turn.decision)}</div>`;
    el.querySelector('.copy-btn').addEventListener('click', () => copyText(turn.decision));
    return;
  }
  if (turn.decisionError) {
    el.className = 'decision failed';
    el.innerHTML = `<p>${escapeHtml(turn.decisionError)}</p>
      <button type="button" class="btn btn-ghost retry-btn">${t('app.retry')}</button>`;
    el.querySelector('.retry-btn').addEventListener('click', () => retryLast());
    return;
  }
  const done = turn.agents.filter(id => turn.answers[id]).length;
  el.className = 'decision waiting';
  el.innerHTML = `
    <p class="deliberating">${t('app.deciding')}</p>
    <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${turn.agents.length}" aria-valuenow="${done}">
      ${turn.agents.map(id => `<span style="--c: var(--${id})" class="${turn.answers[id] ? 'on' : ''}"></span>`).join('')}
    </div>`;
}

// Полная перерисовка ленты для текущего заседания
function renderThread() {
  const s = state.session;
  els.thread.querySelectorAll('.turn').forEach(n => n.remove());
  els.welcome.hidden = !!(s && s.turns.length);
  els.exportBtn.hidden = !(s && s.turns.length);
  els.title.textContent = s && s.turns.length ? s.title : 'PRISM';
  if (s) s.turns.forEach((turn, i) => els.thread.append(renderTurn(turn, i)));
}

function renderMeta() {
  els.meta.textContent = state.demo ? '' : `${Quota.left()} ${t('app.left')}`;
}

// ============================================================
// Действия
// ============================================================

async function ask(question) {
  question = question.trim();
  if (!question || state.busy) return;
  if (!state.demo && Quota.left() <= 0) return showToast(t('app.limit'));

  if (!state.session) state.session = Store.create(question);
  const session = state.session;
  const turn = { question, agents: [...state.agents], answers: {}, decision: null, decisionError: null };
  // контекст для уточняющих вопросов: прошлые вопросы и решения
  const history = session.turns.flatMap(tr => [
    { role: 'user', content: tr.question },
    ...(tr.decision ? [{ role: 'assistant', content: tr.decision }] : [])
  ]);
  session.turns.push(turn);
  Store.save(session);

  setBusy(true);
  renderThread();
  renderHistory();
  const turnEl = els.thread.querySelector(`.turn[data-index="${session.turns.length - 1}"]`);
  turnEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const onEvent = (event, data) => handleEvent(event, data, turn, turnEl);
  try {
    // Сайт открыт без сервера (статичный хостинг/превью) — проводим демо-Совет прямо в браузере
    if (state.offline) {
      await runLocalDemo(question, turn.agents, onEvent);
      return;
    }
    const res = await fetch('/api/council', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history, agents: turn.agents })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || t('app.error.net'));
    }
    await readStream(res, onEvent);
    if (!state.demo) Quota.use();
  } catch (err) {
    turn.decisionError = err.message && err.message !== 'Failed to fetch' ? err.message : t('app.error.net');
    updateDecision(turnEl.querySelector('.decision'), turn);
  } finally {
    Store.save(session);
    setBusy(false);
    renderMeta();
  }
}

// Демо-Совет без сервера: те же события, что шлёт /api/council
async function runLocalDemo(question, agentIds, onEvent) {
  onEvent('start', { demo: true });
  await Promise.all(agentIds.map(async id => {
    const { content } = await PrismDemo.demoAgentAnswer({ id }, question);
    onEvent('agent', { id, content });
  }));
  const { content } = await PrismDemo.demoDecision(question);
  onEvent('decision', { content });
}

// Реакция на каждое событие из потока
function handleEvent(event, data, turn, turnEl) {
  const decisionEl = turnEl.querySelector('.decision');
  if (event === 'start') {
    state.demo = !!data.demo;
    els.demo.hidden = !state.demo;
  } else if (event === 'agent' || event === 'agent_error') {
    turn.answers[data.id] = event === 'agent' ? { content: data.content, ms: data.ms } : { error: data.message };
    fillAgentCard(turnEl.querySelector(`.answer[data-agent="${data.id}"]`), turn.answers[data.id]);
    updateDecision(decisionEl, turn);
  } else if (event === 'decision') {
    turn.decision = data.content;
    updateDecision(decisionEl, turn);
  } else if (event === 'decision_error') {
    turn.decisionError = data.message;
    updateDecision(decisionEl, turn);
  }
}

// Читаем Server-Sent Events из fetch-ответа: блоки "event: x\ndata: {...}\n\n"
async function readStream(res, onEvent) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const event = (block.match(/^event: (.*)$/m) || [])[1];
      const data = (block.match(/^data: (.*)$/m) || [])[1];
      if (event) onEvent(event, data ? JSON.parse(data) : {});
    }
  }
}

function retryLast() {
  const s = state.session;
  if (!s || !s.turns.length || state.busy) return;
  const last = s.turns.pop();
  Store.save(s);
  ask(last.question);
}

function openSession(id) {
  state.session = Store.get(id);
  renderThread();
  renderHistory();
  els.thread.scrollTop = 0;
}

function newSession() {
  state.session = null;
  renderThread();
  renderHistory();
  els.question.focus();
  closeSidebar();
}

function deleteSession(id) {
  Store.remove(id);
  if (state.session && state.session.id === id) state.session = null;
  renderThread();
  renderHistory();
}

// Экспорт заседания в Markdown-файл
function exportSession() {
  const s = state.session;
  if (!s) return;
  const lines = [`# ${s.title}`, '', `PRISM · ${new Date(s.createdAt).toLocaleString()}`, ''];
  s.turns.forEach(turn => {
    lines.push(`## ${turn.question}`, '');
    if (turn.decision) lines.push(`### ${t('app.decision')}`, '', turn.decision, '');
    turn.agents.forEach(id => {
      const ans = turn.answers[id];
      if (ans && ans.content) lines.push(`### ${agentById(id).name} — ${agentById(id).role[getLang()]}`, '', ans.content, '');
    });
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `prism-${s.id.slice(0, 8)}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ============================================================
// Мелочи интерфейса
// ============================================================

function setBusy(busy) {
  state.busy = busy;
  els.send.disabled = busy;
  els.composer.classList.toggle('busy', busy);
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); showToast(t('app.copied')); }
  catch { showToast('Clipboard недоступен'); }
}

let toastTimer;
function showToast(msg) {
  els.toast.textContent = msg;
  els.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { els.toast.hidden = true; }, 2600);
}

// Поле ввода растёт по мере набора текста
function autosize() {
  els.question.style.height = 'auto';
  els.question.style.height = Math.min(els.question.scrollHeight, 200) + 'px';
}

function openSidebar() {
  document.body.classList.add('sidebar-open');
  els.scrim.hidden = false;
  els.menuBtn.setAttribute('aria-expanded', 'true');
}
function closeSidebar() {
  document.body.classList.remove('sidebar-open');
  els.scrim.hidden = true;
  els.menuBtn.setAttribute('aria-expanded', 'false');
}

// ============================================================
// Запуск
// ============================================================

function init() {
  initLangSwitch();
  renderToggles();
  renderHistory();
  renderThread();

  els.composer.addEventListener('submit', e => {
    e.preventDefault();
    const q = els.question.value;
    els.question.value = '';
    autosize();
    ask(q);
  });
  // Enter — отправить, Shift+Enter — новая строка
  els.question.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      els.composer.requestSubmit();
    }
  });
  els.question.addEventListener('input', autosize);
  els.newBtn.addEventListener('click', newSession);
  els.exportBtn.addEventListener('click', exportSession);
  els.menuBtn.addEventListener('click', openSidebar);
  els.scrim.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSidebar(); });
  document.querySelectorAll('.example').forEach(b => b.addEventListener('click', () => ask(b.textContent)));
  document.addEventListener('langchange', () => { renderToggles(); renderHistory(); renderThread(); renderMeta(); });

  checkServer().then(() => {
    // Вопрос с главной страницы: app?q=...
    const q = new URLSearchParams(location.search).get('q');
    if (q) {
      history.replaceState(null, '', location.pathname);
      ask(q);
    } else {
      els.question.focus();
    }
  });
}

// Узнаём режим сервера: live (настоящие модели), demo (нет ключа) или offline (сервера нет вообще)
async function checkServer() {
  try {
    const res = await fetch('/api/health');
    const h = await res.json();
    state.demo = h.mode === 'demo';
  } catch {
    state.offline = true;
    state.demo = true;
  }
  els.demo.hidden = !state.demo;
  renderMeta();
}

init();
