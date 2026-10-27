// ============================================================
// store.js — хранение истории заседаний в браузере (localStorage)
// Зачем отдельный файл: когда подключим Supabase, поменяем ТОЛЬКО
//   этот файл — остальной код просто вызывает Store.list(), Store.save()...
// Структура сессии:
//   { id, title, createdAt, turns: [ { question, agents: [...ids],
//     answers: { alex: {content, error, ms} }, decision, decisionError } ] }
// ============================================================

const Store = (() => {
  const KEY = 'prism.sessions.v1';
  const MAX_SESSIONS = 50; // чтобы не переполнить localStorage (~5 МБ)

  function readAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }
  function writeAll(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_SESSIONS))); }
    catch (e) { console.warn('Не удалось сохранить историю', e); }
  }

  return {
    list: () => readAll(),
    get: id => readAll().find(s => s.id === id) || null,
    save(session) {
      const list = readAll().filter(s => s.id !== session.id);
      list.unshift(session); // свежие сверху
      writeAll(list);
    },
    remove(id) { writeAll(readAll().filter(s => s.id !== id)); },
    create(question) {
      return {
        id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
        title: question.slice(0, 60),
        createdAt: Date.now(),
        turns: []
      };
    }
  };
})();

// Временный дневной лимит бесплатных вопросов (до подключения аккаунтов).
// Важно: это только на клиенте, обойти легко. Настоящий лимит — в Supabase.
const Quota = (() => {
  const KEY = 'prism.quota';
  const FREE_PER_DAY = 3;
  const today = () => new Date().toISOString().slice(0, 10);
  function read() {
    try {
      const q = JSON.parse(localStorage.getItem(KEY));
      return q && q.day === today() ? q : { day: today(), used: 0 };
    } catch { return { day: today(), used: 0 }; }
  }
  return {
    left: () => Math.max(0, FREE_PER_DAY - read().used),
    use() {
      const q = read(); q.used += 1;
      try { localStorage.setItem(KEY, JSON.stringify(q)); } catch {}
    }
  };
})();
