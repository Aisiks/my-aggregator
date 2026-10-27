// ============================================================
// api/verify.js — POST /api/verify (серверная функция Vercel)
// Принимает: { mode: 'ask'|'check', topic, question, history }
// Отдаёт поток событий (SSE): start → model ×N → verdict → done.
// Защита: лимит частоты с IP, длина текста, тариф решает сервер.
// ============================================================

const { runVerify } = require('../lib/verify');
const { TOPICS } = require('../lib/prompts');

const MAX_TEXT = 6000;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const hits = new Map();

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
  const mode = body.mode === 'check' ? 'check' : 'ask';
  const topic = Object.keys(TOPICS).includes(body.topic) ? body.topic : 'general';
  const question = String(body.question || '').trim();
  const history = Array.isArray(body.history) ? body.history.slice(-3).map(h => String(h).slice(0, 300)) : [];
  // Pro (5 сильнейших моделей) — только по коду доступа, пока нет аккаунтов и оплаты
  const tier = process.env.PRO_ACCESS_CODE && body.accessCode === process.env.PRO_ACCESS_CODE ? 'pro' : 'standard';

  if (!question) return sendError(res, 400, mode === 'check' ? 'Вставь текст, который нужно проверить.' : 'Напиши вопрос.');
  if (question.length > MAX_TEXT) return sendError(res, 413, `Текст длиннее ${MAX_TEXT} символов. Сократи его.`);
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'local').split(',')[0].trim();
  if (rateLimited(ip)) return sendError(res, 429, 'Слишком много проверок подряд. Подожди минуту.');

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (res.flushHeaders) res.flushHeaders();

  const emit = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  try {
    await runVerify({ mode, topic, question, history, tier, emit });
  } catch (err) {
    console.error('[verify]', err);
    emit('verdict_error', { message: 'Внутренняя ошибка сервера.' });
    emit('done', {});
  }
  res.end();
};

function sendError(res, status, message) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: message }));
}
function safeJson(t) { try { return JSON.parse(t); } catch { return {}; } }

module.exports.config = { maxDuration: 60 };
