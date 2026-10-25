// Автотесты: запуск `npm test`. Без ключа API — проверяем демо-режим.
// Зачем: перед каждым деплоем за 2 секунды убедиться, что ничего не сломали.
const test = require('node:test');
const assert = require('node:assert');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

delete process.env.OPENROUTER_API_KEY;
const { runCouncil } = require('../lib/council');
const { detectLang } = require('../lib/demo');
const handler = require('../api/council');

test('язык вопроса определяется', () => {
  assert.equal(detectLang('Как дела?'), 'ru');
  assert.equal(detectLang('Қалайсың?'), 'kz');
  assert.equal(detectLang('How are you?'), 'en');
});

test('Совет в демо-режиме: все агенты + решение', async () => {
  const events = [];
  await runCouncil({ question: 'Тест', history: [], agentIds: ['alex', 'zara'], emit: (e, d) => events.push([e, d]) });
  const names = events.map(e => e[0]);
  assert.equal(names[0], 'start');
  assert.equal(events[0][1].demo, true);
  assert.equal(names.filter(n => n === 'agent').length, 2);
  assert.ok(names.includes('decision'));
  assert.equal(names.at(-1), 'done');
});

// Мини-заглушка res, чтобы вызвать API-функцию без сервера
function fakeRes() {
  return { statusCode: 200, headers: {}, body: '',
    setHeader(k, v) { this.headers[k] = v; }, write(c) { this.body += c; }, end(c) { if (c) this.body += c; } };
}

test('API: пустой вопрос → 400', async () => {
  const res = fakeRes();
  await handler({ method: 'POST', body: { question: '  ' }, headers: {} }, res);
  assert.equal(res.statusCode, 400);
});

test('API: GET → 405', async () => {
  const res = fakeRes();
  await handler({ method: 'GET', headers: {} }, res);
  assert.equal(res.statusCode, 405);
});

test('API: клиент не может сам включить Pro', async () => {
  // plan:"pro" от браузера игнорируется — проверяем, что запрос проходит как обычный
  const res = fakeRes();
  await handler({ method: 'POST', body: { question: 'Hi', plan: 'pro', agents: ['leo'] }, headers: { 'x-forwarded-for': '9.9.9.9' } }, res);
  assert.match(res.body, /event: decision/);
});

test('Markdown экранирует HTML (защита от XSS)', () => {
  const ctx = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/js/markdown.js'), 'utf8') + ';this.r=renderMarkdown', ctx);
  const html = ctx.r('**жирный** <script>alert(1)</script>\n- пункт');
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('<strong>жирный</strong>'));
  assert.ok(html.includes('<li>пункт</li>'));
});
