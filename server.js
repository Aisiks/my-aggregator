// ============================================================
// server.js — локальный сервер для разработки (без npm-пакетов)
// Запуск:  node server.js   →  открой http://localhost:3000
// Что делает: отдаёт статические файлы и вызывает функции из /api,
//             так же как это делает Vercel в продакшене.
// На Vercel этот файл НЕ используется.
// ============================================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

// Читаем .env, если он есть (KEY=VALUE построчно)
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml'
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // /api/имя → api/имя.js
  if (url.pathname.startsWith('/api/')) {
    const name = url.pathname.slice(5).replace(/[^a-z0-9-]/gi, '');
    const file = path.join(ROOT, 'api', `${name}.js`);
    if (!fs.existsSync(file)) { res.statusCode = 404; return res.end('Not found'); }
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
    return require(file)(req, res);
  }

  // Красивые адреса как на Vercel (cleanUrls): /app → app.html
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/') rel = '/index.html';
  let file = path.join(ROOT, rel);
  if (!path.extname(file)) file += '.html';
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => {
  const mode = process.env.OPENROUTER_API_KEY ? 'LIVE (настоящие модели)' : 'DEMO (ключа нет)';
  console.log(`PRISM запущен: http://localhost:${PORT}  — режим ${mode}`);
});
