// ============================================================
// lib/json.js — терпеливый разбор JSON из ответа модели
// Модели иногда оборачивают JSON в ```json ... ``` или добавляют фразу
// до/после. Эта функция находит JSON и разбирает его, а если не вышло —
// возвращает null (и вызывающий код показывает ответ как обычный текст).
// ============================================================

function parseModelJson(text) {
  if (!text) return null;
  const tries = [];
  tries.push(text.trim());
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) tries.push(fence[1].trim());
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last > first) tries.push(text.slice(first, last + 1));
  for (const t of tries) {
    try { return JSON.parse(t); } catch { /* пробуем следующий вариант */ }
  }
  return null;
}

// Приводим ответ эксперта к ожидаемой форме, чтобы интерфейс не падал
function normalizeSolver(data, rawText) {
  if (!data || typeof data !== 'object') {
    return { answer: String(rawText || '').slice(0, 3000), claims: [], verify: [] };
  }
  const claims = Array.isArray(data.claims) ? data.claims.slice(0, 12).map(c => ({
    text: String(c && c.text || '').slice(0, 300),
    verdict: c && c.verdict ? String(c.verdict).slice(0, 20) : undefined,
    why: c && c.why ? String(c.why).slice(0, 300) : undefined,
    confidence: ['high', 'medium', 'low'].includes(c && c.confidence) ? c.confidence : 'medium'
  })).filter(c => c.text) : [];
  return {
    answer: String(data.answer || '').slice(0, 3000),
    claims,
    verify: Array.isArray(data.verify) ? data.verify.slice(0, 8).map(v => String(v).slice(0, 300)) : []
  };
}

function normalizeJudge(data) {
  if (!data || typeof data !== 'object') return null;
  let consensus = Number(data.consensus);
  if (!Number.isFinite(consensus)) consensus = 50;
  consensus = Math.max(0, Math.min(100, Math.round(consensus)));
  let trust = Number(data.trust);
  trust = Number.isFinite(trust) ? Math.max(0, Math.min(100, Math.round(trust))) : undefined;
  return {
    verdict: String(data.verdict || '').slice(0, 2500),
    consensus,
    trust,
    agreed: Array.isArray(data.agreed) ? data.agreed.slice(0, 8).map(String) : [],
    disputed: Array.isArray(data.disputed) ? data.disputed.slice(0, 6).map(d => ({
      point: String(d && d.point || '').slice(0, 300),
      positions: d && typeof d.positions === 'object' && d.positions ? Object.fromEntries(
        Object.entries(d.positions).slice(0, 5).map(([k, v]) => [String(k).slice(0, 2), String(v).slice(0, 300)])
      ) : {}
    })).filter(d => d.point) : [],
    verify: Array.isArray(data.verify) ? data.verify.slice(0, 8).map(String) : [],
    escalate: !!data.escalate,
    escalate_reason: String(data.escalate_reason || '').slice(0, 300)
  };
}

module.exports = { parseModelJson, normalizeSolver, normalizeJudge };
