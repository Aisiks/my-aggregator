// Автотесты PRISM v2: `npm test`. Без ключа API проверяем демо-режим и разбор ответов.
const test = require('node:test');
const assert = require('node:assert');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

delete process.env.OPENROUTER_API_KEY;
const { runVerify } = require('../lib/verify');
const { parseModelJson, normalizeSolver, normalizeJudge } = require('../lib/json');
const { solverPrompt, judgePrompt } = require('../lib/prompts');
const handler = require('../api/verify');

test('JSON из ответа модели: чистый, в ```json``` и с фразой вокруг', () => {
  assert.deepEqual(parseModelJson('{"a":1}'), { a: 1 });
  assert.deepEqual(parseModelJson('Вот ответ:\n```json\n{"a":2}\n```'), { a: 2 });
  assert.deepEqual(parseModelJson('Итог: {"a":3} — всё.'), { a: 3 });
  assert.equal(parseModelJson('нет json'), null);
});

test('Нормализация: мусор не ломает интерфейс', () => {
  const s = normalizeSolver(null, 'просто текст');
  assert.equal(s.answer, 'просто текст');
  assert.deepEqual(s.claims, []);
  const j = normalizeJudge({ consensus: 140, verdict: 'ok', disputed: [{ point: 'x', positions: { A: 'да' } }] });
  assert.equal(j.consensus, 100);
  assert.equal(j.trust, undefined);
  assert.equal(j.disputed[0].positions.A, 'да');
});

test('Промпт проверки просит оценку по каждому утверждению, судья — trust', () => {
  assert.match(solverPrompt({ mode: 'check', topic: 'tax', question: 'текст' }), /"verdict": "верно"/);
  assert.match(judgePrompt({ mode: 'check', question: 'q', answers: [] }), /"trust"/);
  assert.doesNotMatch(judgePrompt({ mode: 'ask', question: 'q', answers: [] }), /"trust"/);
});

test('Демо: проверка ответа ChatGPT про форму 910 → низкое доверие к тексту', async () => {
  const events = [];
  await runVerify({ mode: 'check', topic: 'tax', question: 'Можно не сдавать 910 если нет дохода, налог раз в год до 31 марта', emit: (e, d) => events.push([e, d]) });
  const names = events.map(e => e[0]);
  assert.equal(names[0], 'start');
  assert.equal(names.filter(n => n === 'model').length, 3);
  const verdict = events.find(e => e[0] === 'verdict')[1];
  assert.ok(verdict.trust < 20);
  assert.ok(verdict.consensus >= 85);
  assert.equal(names.at(-1), 'done');
});

function fakeRes() {
  return { statusCode: 200, headers: {}, body: '', setHeader(k, v) { this.headers[k] = v; }, write(c) { this.body += c; }, end(c) { if (c) this.body += c; } };
}

test('API: пустой текст → 400, GET → 405', async () => {
  const r1 = fakeRes();
  await handler({ method: 'POST', body: { question: ' ' }, headers: {} }, r1);
  assert.equal(r1.statusCode, 400);
  const r2 = fakeRes();
  await handler({ method: 'GET', headers: {} }, r2);
  assert.equal(r2.statusCode, 405);
});

test('API: неизвестная тема становится general, ответ идёт потоком', async () => {
  const res = fakeRes();
  await handler({ method: 'POST', body: { question: 'Привет', topic: 'hack' }, headers: { 'x-forwarded-for': '7.7.7.7' } }, res);
  assert.match(res.body, /"topic":"general"/);
  assert.match(res.body, /event: verdict/);
});

test('Markdown экранирует HTML (защита от XSS)', () => {
  const ctx = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/js/markdown.js'), 'utf8') + ';this.r=renderMarkdown', ctx);
  const html = ctx.r('**жирный** <script>alert(1)</script>\n- пункт');
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('<strong>жирный</strong>'));
});
