// ============================================================
// api/council.js — серверная функция Vercel: POST /api/council
// Что это: «дверь» между браузером и моделями ИИ.
// Как работает:
//   1) проверяет запрос (есть ли вопрос, не слишком ли он длинный),
//   2) ограничивает частоту запросов с одного IP,
//   3) запускает Совет и стримит события в браузер (Server-Sent Events),
//      поэтому ответы агентов появляются по одному, а не все через 30 секунд.
// ============================================================

const { runCouncil, AGENTS } = require('../lib/council');

const MAX_QUESTION = 4000;      // символов
const RATE_LIMIT = 12;          // запросов
const RATE_WINDOW_MS = 60_000;  // за минуту
const hits = new Map();         // ip -> [время запросов] (живёт, пока «тёплая» функция)

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end(JSON.stringify({ error: 'Только POST' }));
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
  const question = String(body.question || '').trim();
  const history = Array.isArray(body.history) ? body.history : [];
  // Тариф решает СЕРВЕР, а не браузер: иначе любой отправит plan:'pro' и получит дорогие модели.
  // Пока нет аккаунтов — Pro включается только по коду доступа для тестировщиков.
  const plan = process.env.PRO_ACCESS_CODE && body.accessCode === process.env.PRO_ACCESS_CODE ? 'pro' : 'starter';
  const validIds = AGENTS.map(a => a.id);
  let agentIds = Array.isArray(body.agents) ? body.agents.filter(id => validIds.includes(id)) : validIds;
  if (agentIds.length === 0) agentIds = validIds;

  if (!question) return sendError(res, 400, 'Напиши вопрос для Совета.');
  if (question.length > MAX_QUESTION) return sendError(res, 413, `Вопрос длиннее ${MAX_QUESTION} символов. Сократи его.`);

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'local').split(',')[0].trim();
  if (rateLimited(ip)) return sendError(res, 429, 'Слишком много вопросов подряд. Подожди минуту.');

  // Заголовки потока событий
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (res.flushHeaders) res.flushHeaders();

  // Отправка одного события в формате SSE: "event: имя\ndata: json\n\n"
  const emit = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    await runCouncil({ question, history, agentIds, plan, emit });
  } catch (err) {
    console.error('[council]', err);
    emit('decision_error', { message: 'Внутренняя ошибка сервера.' });
    emit('done', {});
  }
  res.end();
};

function sendError(res, status, message) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: message }));
}

function safeJson(text) {
  try { return JSON.parse(text); } catch { return {}; }
}

// Даём функции до 60 секунд (на бесплатном Vercel это максимум)
module.exports.config = { maxDuration: 60 };
