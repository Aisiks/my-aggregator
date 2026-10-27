// ============================================================
// app.js — приложение PRISM: проверка ответов ИИ
// Поток: ask() → POST /api/verify → события:
//   start (какие модели) → model ×N (ответы по одному) → verdict (сверка) → done
// Каждая функция делает одно дело: render*, handle*, ask, readStream…
// ============================================================

const $ = sel => document.querySelector(sel);
const els = {
  thread: $('#thread'), welcome: $('#welcome'), composer: $('#composer'),
  question: $('#question'), send: $('#send-btn'), topic: $('#topic'),
  history: $('#history'), newBtn: $('#new-btn'), exportBtn: $('#export-btn'),
  title: $('#topbar-title'), demo: $('#demo-banner'), meta: $('#composer-meta'),
  sidebar: $('#sidebar'), scrim: $('#scrim'), menuBtn: $('#menu-btn'), toast: $('#toast')
};

const state = { session: null, busy: false, demo: false, offline: false, mode: 'ask' };

// Цвет и подпись уровня согласия: 85+ высокое, 50–84 частичное, ниже — низкое
// В режиме проверки главное — можно ли верить ВСТАВЛЕННОМУ тексту (trust),
// а согласие моделей показываем второй строкой.
function score(v) {
  if (!v) return null;
  return typeof v.trust === 'number' ? v.trust : v.consensus;
}
function level(v) {
  if (!v || v.demoGeneric) return { key: 'none', cls: 'lvl-none' };
  const s = score(v);
  if (s >= 85) return { key: 'high', cls: 'lvl-high' };
  if (s >= 50) return { key: 'mid', cls: 'lvl-mid' };
  return { key: 'low', cls: 'lvl-low' };
}

// ============================================================
// Рендер
// ============================================================

function renderHistory() {
  const list = Store.list();
  els.history.innerHTML = '';
  if (!list.length) {
    els.history.innerHTML = `<li class="history-empty">${t('app.empty.history')}</li>`;
    return;
  }
  list.forEach(s => {
    const li = document.createElement('li');
    li.className = 'history-item' + (state.session && state.session.id === s.id ? ' active' : '');
    const last = s.turns[s.turns.length - 1];
    const lv = last && last.verdict ? level(last.verdict) : { cls: 'lvl-none' };
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'history-open';
    open.innerHTML = `<span class="h-dot ${lv.cls}"></span><span class="h-text"></span>`;
    open.querySelector('.h-text').textContent = s.title;
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

function renderTurn(turn, index) {
  const wrap = document.createElement('article');
  wrap.className = 'turn';
  wrap.dataset.index = index;

  const head = document.createElement('div');
  head.className = 'turn-head';
  head.innerHTML = `<span class="mode-tag">${t(turn.mode === 'check' ? 'app.mode.check' : 'app.mode.ask')} · ${t('topic.' + turn.topic)}</span>`;
  const q = document.createElement(turn.mode === 'check' ? 'blockquote' : 'h2');
  q.className = turn.mode === 'check' ? 'question checked-text' : 'question';
  q.textContent = turn.question;
  head.append(q);

  const report = document.createElement('section');
  report.className = 'report';
  const answers = document.createElement('details');
  answers.className = 'answers-wrap';
  answers.innerHTML = `<summary>${t('app.answers')}</summary><div class="answers"></div>`;

  wrap.append(head, report, answers);
  updateTurn(wrap, turn);
  return wrap;
}

// Перерисовать отчёт и карточки моделей в уже показанном «ходе»
function updateTurn(wrap, turn) {
  renderReport(wrap.querySelector('.report'), turn);
  const box = wrap.querySelector('.answers');
  box.innerHTML = '';
  turn.models.forEach(m => box.append(renderModelCard(m, turn.answers[m.id], turn.mode)));
}

function renderModelCard(m, ans, mode) {
  const card = document.createElement('div');
  card.className = 'model-card';
  const head = `<header class="mc-head"><span class="mc-id">${m.id}</span><span class="mc-vendor">${escapeHtml(m.vendor)}</span></header>`;
  if (!ans) {
    card.classList.add('pending');
    card.innerHTML = head + `<p class="muted">${t('app.thinking')}</p>`;
    return card;
  }
  if (ans.error) {
    card.classList.add('failed');
    card.innerHTML = head + `<p>${escapeHtml(ans.error)}</p>`;
    return card;
  }
  const claims = (ans.claims || []).map(c => {
    const v = (c.verdict || '').toLowerCase();
    const chip = mode === 'check' && v
      ? `<span class="chip-v ${v.startsWith('вер') || v === 'true' ? 'v-ok' : v.startsWith('не') && !v.startsWith('неяс') || v === 'false' ? 'v-bad' : 'v-mid'}">${escapeHtml(c.verdict)}</span>` : '';
    return `<li>${chip}<span>${escapeHtml(c.text)}</span>${c.why ? `<span class="muted"> — ${escapeHtml(c.why)}</span>` : ''}<span class="conf conf-${c.confidence}" title="уверенность">${c.confidence === 'high' ? '●●●' : c.confidence === 'low' ? '●○○' : '●●○'}</span></li>`;
  }).join('');
  card.innerHTML = head + `<div class="md">${renderMarkdown(ans.answer || '')}</div>` + (claims ? `<ul class="claims">${claims}</ul>` : '');
  return card;
}

function renderReport(el, turn) {
  const done = turn.models.filter(m => turn.answers[m.id]).length;
  if (turn.verdictError) {
    el.className = 'report failed';
    el.innerHTML = `<p>${escapeHtml(turn.verdictError)}</p><button type="button" class="btn btn-ghost retry-btn">${t('app.retry')}</button>`;
    el.querySelector('.retry-btn').addEventListener('click', retryLast);
    return;
  }
  if (!turn.verdict) {
    el.className = 'report waiting';
    el.innerHTML = `
      <p class="wait-title">${done < turn.models.length ? t('app.models') : t('app.judging')}</p>
      <div class="beams">${turn.models.map(m => `<div class="beam ${turn.answers[m.id] ? 'on' : ''}"><span>${m.id} · ${escapeHtml(m.vendor)}</span><i></i></div>`).join('')}</div>`;
    return;
  }
  const v = turn.verdict;
  const lv = level(v);
  const isTrust = typeof v.trust === 'number';
  const positions = d => Object.entries(d.positions || {}).map(([id, p]) => `<li><span class="pos-id">${escapeHtml(id)}</span>${escapeHtml(p)}</li>`).join('');
  el.className = `report ready ${lv.cls}`;
  el.innerHTML = `
    <div class="meter">
      <div class="meter-top">
        <span class="meter-label">${t(isTrust ? 'app.trust' : 'app.consensus')}</span>
        <span class="meter-value">${t('app.level.' + lv.key)}${lv.key !== 'none' ? ` · ${score(v)}/100` : ''}</span>
      </div>
      <div class="meter-bar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${score(v) || 0}" aria-label="${t(isTrust ? 'app.trust' : 'app.consensus')}"><span style="width:${lv.key === 'none' ? 0 : Math.max(4, score(v))}%"></span></div>
      <p class="meter-sub">${isTrust ? `${t('app.consensus')}: ${v.consensus}/100 · ` : ''}${t('app.answered')}: ${v.answered || done} ${t('app.of')} ${v.total || turn.models.length}</p>
    </div>
    <div class="verdict md">${renderMarkdown(v.verdict || '')}</div>
    ${v.agreed && v.agreed.length ? `<h3>${t('app.agreed')}</h3><ul class="agreed">${v.agreed.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>` : ''}
    ${v.disputed && v.disputed.length ? `<h3>${t('app.disputed')}</h3><div class="disputed">${v.disputed.map(d => `<div class="dispute"><p class="d-point">${escapeHtml(d.point)}</p><ul class="d-pos">${positions(d)}</ul></div>`).join('')}</div>` : ''}
    ${v.verify && v.verify.length ? `<h3>${t('app.verify')}</h3><ul class="verify">${v.verify.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>` : ''}
    ${v.escalate ? `<div class="escalate"><strong>${t('app.escalate')}</strong><p>${escapeHtml(v.escalate_reason || '')}</p></div>` : ''}
    <div class="report-foot">
      <p class="ai-label">${t('app.ai.label')}</p>
      <button type="button" class="btn btn-ghost copy-btn">${t('app.copy')}</button>
    </div>`;
  el.querySelector('.copy-btn').addEventListener('click', () => copyText(turnToMarkdown(turn)));
}

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

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.seg-btn').forEach(b => b.setAttribute('aria-selected', String(b.dataset.mode === mode)));
  els.question.dataset.i18nAttr = `placeholder:${mode === 'check' ? 'app.ph.check' : 'app.ph.ask'}`;
  els.question.setAttribute('placeholder', t(mode === 'check' ? 'app.ph.check' : 'app.ph.ask'));
}

// ============================================================
// Действия
// ============================================================

async function ask(question, mode = state.mode, topic = els.topic.value) {
  question = question.trim();
  if (!question || state.busy) return;
  if (!state.demo && Quota.left() <= 0) return showToast(t('app.limit'));

  if (!state.session) state.session = Store.create(question);
  const session = state.session;
  // Контекст уточняющих вопросов: короткие формулировки прошлых вопросов
  const history = session.turns.slice(-3).map(tr => tr.question.slice(0, 300));
  const turn = { mode, topic, question, models: [], answers: {}, verdict: null, verdictError: null };
  session.turns.push(turn);
  Store.save(session);

  setBusy(true);
  renderThread();
  renderHistory();
  const turnEl = els.thread.querySelector(`.turn[data-index="${session.turns.length - 1}"]`);
  turnEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const onEvent = (event, data) => handleEvent(event, data, turn, turnEl);

  try {
    if (state.offline) {
      // Без сервера (статичный хостинг) — демо прямо в браузере
      const models = [{ id: 'A', vendor: 'Claude' }, { id: 'B', vendor: 'GPT' }, { id: 'C', vendor: 'Gemini' }];
      onEvent('start', { demo: true, models });
      await PrismDemo.run({ mode, topic, question, solvers: models, emit: onEvent });
      return;
    }
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, topic, question, history })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || t('app.error.net'));
    }
    await readStream(res, onEvent);
    if (!state.demo) Quota.use();
  } catch (err) {
    turn.verdictError = err.message && err.message !== 'Failed to fetch' ? err.message : t('app.error.net');
    updateTurn(turnEl, turn);
  } finally {
    Store.save(session);
    setBusy(false);
    renderMeta();
    renderHistory();
  }
}

function handleEvent(event, data, turn, turnEl) {
  if (event === 'start') {
    state.demo = !!data.demo;
    els.demo.hidden = !state.demo;
    turn.models = data.models || [];
  } else if (event === 'model') {
    turn.answers[data.id] = { answer: data.answer, claims: data.claims, verify: data.verify };
  } else if (event === 'model_error') {
    turn.answers[data.id] = { error: data.message };
  } else if (event === 'verdict') {
    turn.verdict = data;
  } else if (event === 'verdict_error') {
    turn.verdictError = data.message;
  }
  if (event !== 'done') updateTurn(turnEl, turn);
}

// Читаем Server-Sent Events: блоки "event: x\ndata: {...}\n\n"
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
  ask(last.question, last.mode, last.topic);
}

function openSession(id) { state.session = Store.get(id); renderThread(); renderHistory(); }
function newSession() { state.session = null; renderThread(); renderHistory(); els.question.focus(); closeSidebar(); }
function deleteSession(id) {
  Store.remove(id);
  if (state.session && state.session.id === id) state.session = null;
  renderThread(); renderHistory();
}

// Отчёт в Markdown — чтобы показать бухгалтеру, юристу или родителям
function turnToMarkdown(turn) {
  const v = turn.verdict || {};
  const lv = level(v);
  const lines = [`## ${turn.question}`, ''];
  if (typeof v.trust === 'number') lines.push(`**${t('app.trust')}:** ${t('app.level.' + lv.key)} (${v.trust}/100)`);
  lines.push(`**${t('app.consensus')}:** ${v.consensus ?? '—'}/100`, '', v.verdict || '');
  if (v.agreed && v.agreed.length) lines.push('', `### ${t('app.agreed')}`, ...v.agreed.map(a => `- ${a}`));
  if (v.disputed && v.disputed.length) {
    lines.push('', `### ${t('app.disputed')}`);
    v.disputed.forEach(d => { lines.push(`- ${d.point}`); Object.entries(d.positions || {}).forEach(([id, p]) => lines.push(`  - ${id}: ${p}`)); });
  }
  if (v.verify && v.verify.length) lines.push('', `### ${t('app.verify')}`, ...v.verify.map(x => `- [ ] ${x}`));
  lines.push('', `### ${t('app.answers')}`);
  turn.models.forEach(m => { const a = turn.answers[m.id]; if (a && a.answer) lines.push('', `**${m.id} · ${m.vendor}**`, '', a.answer); });
  lines.push('', `_${t('app.ai.label')} — PRISM by Synapse_`);
  return lines.join('\n');
}

function exportSession() {
  const s = state.session;
  if (!s) return;
  const md = [`# ${s.title}`, '', `PRISM · ${new Date(s.createdAt).toLocaleString()}`, '', ...s.turns.map(turnToMarkdown)].join('\n\n');
  const blob = new Blob([md], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `prism-${s.id.slice(0, 8)}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ============================================================
// Мелочи интерфейса
// ============================================================

function setBusy(busy) { state.busy = busy; els.send.disabled = busy; els.composer.classList.toggle('busy', busy); }

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

function autosize() {
  els.question.style.height = 'auto';
  els.question.style.height = Math.min(els.question.scrollHeight, 220) + 'px';
}

function openSidebar() { document.body.classList.add('sidebar-open'); els.scrim.hidden = false; els.menuBtn.setAttribute('aria-expanded', 'true'); }
function closeSidebar() { document.body.classList.remove('sidebar-open'); els.scrim.hidden = true; els.menuBtn.setAttribute('aria-expanded', 'false'); }

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

function init() {
  initLangSwitch();
  setMode('ask');
  renderHistory();
  renderThread();

  els.composer.addEventListener('submit', e => {
    e.preventDefault();
    const q = els.question.value;
    els.question.value = '';
    autosize();
    ask(q);
  });
  els.question.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); els.composer.requestSubmit(); }
  });
  els.question.addEventListener('input', autosize);
  document.querySelectorAll('.seg-btn').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
  els.newBtn.addEventListener('click', newSession);
  els.exportBtn.addEventListener('click', exportSession);
  els.menuBtn.addEventListener('click', openSidebar);
  els.scrim.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSidebar(); });
  document.querySelectorAll('.example').forEach(b => b.addEventListener('click', () => {
    setMode(b.dataset.mode);
    els.topic.value = b.dataset.topic;
    ask(b.querySelector('span:last-child').textContent, b.dataset.mode, b.dataset.topic);
  }));
  document.addEventListener('langchange', () => { setMode(state.mode); renderHistory(); renderThread(); renderMeta(); });

  checkServer().then(() => {
    const params = new URLSearchParams(location.search);
    let q = params.get('q');
    let mode = params.get('mode') === 'check' ? 'check' : 'ask';
    try {
      const pending = JSON.parse(sessionStorage.getItem('prism.pending') || 'null');
      if (!q && pending) { q = pending.q; mode = pending.mode === 'check' ? 'check' : 'ask'; }
      sessionStorage.removeItem('prism.pending');
    } catch {}
    if (q) {
      try { history.replaceState(null, '', location.pathname); } catch {}
      setMode(mode);
      ask(q, mode);
    } else {
      els.question.focus();
    }
  });
}

init();
