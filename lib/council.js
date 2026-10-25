// ============================================================
// lib/council.js — как проходит заседание Совета
// Что это: функция runCouncil, которая
//   1) параллельно спрашивает выбранных агентов,
//   2) отдаёт каждый ответ сразу, как он готов (не ждём самого медленного),
//   3) отдаёт все ответы «председателю», который пишет Решение Совета.
// Зачем отдельно от api/: эту же логику можно вызвать из Telegram-бота,
//   n8n или тестов — HTTP тут ни при чём.
// ============================================================

const { AGENTS, SYNTHESIZER, systemPromptFor } = require('./agents');
const { demoAgentAnswer, demoDecision } = require('./demo');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const AGENT_TIMEOUT_MS = 45000; // если модель молчит 45 сек — считаем, что она упала

// Один запрос к одной модели через OpenRouter (один ключ — все модели)
async function callModel({ model, system, messages, maxTokens = 700 }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS);
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        // Эти два заголовка OpenRouter использует для статистики приложения
        'HTTP-Referer': process.env.SITE_URL || 'https://prismai.kz',
        'X-Title': 'PRISM by Synapse'
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0.7,
        messages: [{ role: 'system', content: system }, ...messages]
      })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Пустой ответ модели');
    return { content, usage: data.usage || null };
  } finally {
    clearTimeout(timer);
  }
}

// Готовим историю диалога: оставляем последние 6 сообщений, чтобы не платить за лишнее
function buildMessages(question, history = []) {
  const trimmed = history.slice(-6).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content).slice(0, 2000)
  }));
  return [...trimmed, { role: 'user', content: question }];
}

/**
 * Главная функция. emit(event, data) — колбэк, которым мы отдаём события наружу.
 * События: 'start', 'agent', 'agent_error', 'decision', 'done'.
 */
async function runCouncil({ question, history, agentIds, plan = 'starter', emit }) {
  const demo = !process.env.OPENROUTER_API_KEY;
  const tier = plan === 'pro' ? 'pro' : 'starter';
  const selected = AGENTS.filter(a => agentIds.includes(a.id));
  const messages = buildMessages(question, history);

  emit('start', { demo, agents: selected.map(a => a.id) });

  // Запускаем всех агентов одновременно. Promise.all ждал бы всех —
  // поэтому каждый промис сам отправляет свой ответ, как только готов.
  const answers = await Promise.all(
    selected.map(async agent => {
      const started = Date.now();
      try {
        const { content } = demo
          ? await demoAgentAnswer(agent, question)
          : await callModel({ model: agent.models[tier], system: systemPromptFor(agent), messages });
        const ms = Date.now() - started;
        emit('agent', { id: agent.id, content, ms });
        return { agent, content };
      } catch (err) {
        emit('agent_error', { id: agent.id, message: humanError(err) });
        return null;
      }
    })
  );

  const ok = answers.filter(Boolean);
  if (ok.length === 0) {
    emit('decision_error', { message: 'Ни один агент не ответил. Проверь ключ OpenRouter и баланс.' });
    return emit('done', {});
  }

  // Председатель видит вопрос и все ответы
  const transcript = ok
    .map(a => `### ${a.agent.name} (${a.agent.role})\n${a.content}`)
    .join('\n\n');

  try {
    const { content } = demo
      ? await demoDecision(question, ok)
      : await callModel({
          model: SYNTHESIZER.models[tier],
          system: SYNTHESIZER.prompt,
          messages: [{ role: 'user', content: `Вопрос пользователя:\n${question}\n\nОтветы Совета:\n\n${transcript}` }],
          maxTokens: 900
        });
    emit('decision', { content });
  } catch (err) {
    emit('decision_error', { message: humanError(err) });
  }
  emit('done', {});
}

// Переводим технические ошибки на человеческий язык
function humanError(err) {
  const msg = String(err && err.message || err);
  if (err && err.name === 'AbortError') return 'Агент думал слишком долго и был остановлен.';
  if (msg.includes('401')) return 'Неверный ключ OpenRouter.';
  if (msg.includes('402')) return 'На балансе OpenRouter закончились средства.';
  if (msg.includes('429')) return 'Слишком много запросов к модели. Попробуй через минуту.';
  return 'Модель временно недоступна.';
}

module.exports = { runCouncil, AGENTS };
