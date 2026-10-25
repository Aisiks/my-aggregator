// GET /api/health — быстрая проверка, что сервер жив и включён ли настоящий ИИ.
// Ключ API никогда не отдаём — только флаг «есть/нет».
module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ ok: true, mode: process.env.OPENROUTER_API_KEY ? 'live' : 'demo' }));
};
