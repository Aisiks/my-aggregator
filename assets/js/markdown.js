// ============================================================
// markdown.js — маленький и безопасный рендер Markdown → HTML
// Зачем свой, а не библиотека: нам нужны только жирный, курсив, код,
//   списки и заголовки. Свой код = 0 КБ зависимостей и полный контроль.
// Безопасность: СНАЧАЛА экранируем весь HTML (escapeHtml), потом
//   добавляем свои теги. Так модель не сможет вставить <script> на страницу.
// ============================================================

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Оформление внутри строки: `код`, **жирный**, *курсив*
function inline(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
}

function renderMarkdown(src) {
  const lines = escapeHtml(src).replace(/\r/g, '').split('\n');
  const out = [];
  let list = null;      // 'ul' или 'ol', если сейчас внутри списка
  let code = null;      // массив строк, если внутри ```блока```
  let para = [];

  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join('<br>'))}</p>`); para = []; } };
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (code) { out.push(`<pre><code>${code.join('\n')}</code></pre>`); code = null; }
      else { flushPara(); closeList(); code = []; }
      continue;
    }
    if (code) { code.push(line); continue; }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    const ul = line.match(/^\s*[-*•]\s+(.*)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);

    if (heading) { flushPara(); closeList(); out.push(`<h4>${inline(heading[2])}</h4>`); }
    else if (ul || ol) {
      flushPara();
      const type = ul ? 'ul' : 'ol';
      if (list !== type) { closeList(); out.push(`<${type}>`); list = type; }
      out.push(`<li>${inline((ul || ol)[1])}</li>`);
    }
    else if (!line.trim()) { flushPara(); closeList(); }
    else { closeList(); para.push(line); }
  }
  if (code) out.push(`<pre><code>${code.join('\n')}</code></pre>`);
  flushPara(); closeList();
  return out.join('');
}
