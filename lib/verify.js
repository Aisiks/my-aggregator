// ============================================================
// lib/verify.js — как PRISM проверяет ответ
//   1) 3–5 моделей разных компаний отвечают НЕЗАВИСИМО (не видят друг друга);
//   2) каждый ответ уходит в браузер сразу, как готов;
//   3) судья сравнивает ответы по пунктам и выдаёт:
//      уровень согласия 0–100, где согласны, где спорят, что проверить,
//      и нужно ли показать вопрос живому специалисту.
// emit(event, data) — колбэк для отправки событий наружу (SSE, бот, тесты).
// ============================================================

const { SOLVERS, JUDGE } = require('./models');
const { solverPrompt, judgePrompt } = require('./prompts');
const { parseModelJson, normalizeSolver, normalizeJudge } = require('./json');
const demo = require('./demo');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const TIMEOUT_MS = 50000;

async function callModel(model, prompt, maxTokens = 900) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'https://prismai.kz',
        'X-Title': 'PRISM by Synapse'
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0.3, // для проверки фактов нужна стабильность, а не креатив
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Пустой ответ модели');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

async function runVerify({ mode = 'ask', topic = 'general', question, history = [], tier = 'standard', emit }) {
  const isDemo = !process.env.OPENROUTER_API_KEY;
  const solvers = SOLVERS[tier] || SOLVERS.standard;
  emit('start', { demo: isDemo, mode, topic, models: solvers.map(s => ({ id: s.id, vendor: s.vendor })) });

  if (isDemo) return demo.run({ mode, topic, question, solvers, emit });

  const prompt = solverPrompt({ mode, topic, question, history });

  // Все модели работают параллельно и НЕ видят ответы друг друга
  const results = await Promise.all(solvers.map(async s => {
    const started = Date.now();
    try {
      const raw = await callModel(s.model, prompt);
      const data = normalizeSolver(parseModelJson(raw), raw);
      emit('model', { id: s.id, vendor: s.vendor, ms: Date.now() - started, ...data });
      return { id: s.id, data };
    } catch (err) {
      emit('model_error', { id: s.id, vendor: s.vendor, message: humanError(err) });
      return null;
    }
  }));

  const ok = results.filter(Boolean);
  if (ok.length < 2) {
    emit('verdict_error', { message: 'Ответили меньше двух моделей — сравнивать нечего. Попробуй ещё раз.' });
    return emit('done', {});
  }

  try {
    const raw = await callModel(JUDGE[tier] || JUDGE.standard, judgePrompt({ mode, question, answers: ok }), 1200);
    const verdict = normalizeJudge(parseModelJson(raw));
    if (!verdict) throw new Error('Судья ответил не в том формате');
    verdict.answered = ok.length;
    verdict.total = solvers.length;
    emit('verdict', verdict);
  } catch (err) {
    emit('verdict_error', { message: humanError(err) });
  }
  emit('done', {});
}

function humanError(err) {
  const msg = String(err && err.message || err);
  if (err && err.name === 'AbortError') return 'Модель думала слишком долго.';
  if (msg.includes('401')) return 'Неверный ключ OpenRouter.';
  if (msg.includes('402')) return 'На балансе OpenRouter закончились деньги.';
  if (msg.includes('429')) return 'Модель перегружена. Попробуй через минуту.';
  if (msg.includes('формате')) return 'Не удалось собрать итог. Попробуй ещё раз.';
  return 'Модель временно недоступна.';
}

module.exports = { runVerify };
