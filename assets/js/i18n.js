// ============================================================
// i18n.js — переводы интерфейса RU / EN / KZ
// Как работает: в HTML у элемента пишем data-i18n="ключ",
//   а функция applyI18n() подставляет текст на нужном языке.
//   Для атрибутов (placeholder, aria-label) — data-i18n-attr="placeholder:ключ".
// Выбранный язык запоминается в localStorage.
// ============================================================

const DICT = {
  ru: {
    'nav.how': 'Как работает', 'nav.agents': 'Агенты', 'nav.pricing': 'Тарифы', 'nav.faq': 'Вопросы',
    'nav.open': 'Открыть PRISM',
    'hero.title': 'Один вопрос. Шесть экспертов. Одно решение.',
    'hero.lead': 'PRISM задаёт твой вопрос сразу шести ИИ — Claude, GPT, Gemini, Grok, DeepSeek и Mistral. Каждый отвечает со своей роли, а Совет сводит всё в один понятный план.',
    'hero.cta': 'Задать вопрос Совету', 'hero.note': 'Без регистрации · первые вопросы бесплатно',
    'hero.decision': 'Решение Совета',
    'how.title': 'Как проходит Совет',
    'how.1.t': 'Ты задаёшь вопрос', 'how.1.d': 'Про бизнес, учёбу, код или решение, которое не можешь принять. На русском, казахском или английском.',
    'how.2.t': 'Шесть агентов отвечают параллельно', 'how.2.d': 'Маркетолог, аналитик, стратег, критик, разработчик и юрист. Ответы появляются по мере готовности.',
    'how.3.t': 'Совет выносит решение', 'how.3.d': 'Вердикт, где эксперты согласны и спорят, план на 7 дней и главный риск.',
    'agents.title': 'Кто сидит в Совете', 'agents.lead': 'Шесть разных моделей — значит шесть разных взглядов. Одна модель часто уверенно ошибается; шесть ловят ошибки друг друга.',
    'pricing.title': 'Тарифы', 'pricing.lead': 'Оплата в тенге, Kaspi и карта.',
    'pricing.month': '/мес',
    'pricing.starter': 'Starter', 'pricing.starter.d': 'Для учёбы и личных решений',
    'pricing.starter.f1': '30 заседаний Совета в месяц', 'pricing.starter.f2': 'Все 6 агентов, быстрые модели', 'pricing.starter.f3': 'История и экспорт в Markdown',
    'pricing.pro': 'Pro', 'pricing.pro.d': 'Для предпринимателей и команд',
    'pricing.pro.f1': '200 заседаний Совета в месяц', 'pricing.pro.f2': 'Сильнейшие модели каждого вендора', 'pricing.pro.f3': 'Приоритетная скорость',
    'pricing.business': 'Business', 'pricing.business.d': 'Общие пространства для команды',
    'pricing.soon': 'Скоро', 'pricing.choose': 'Начать', 'pricing.popular': 'Выбор большинства',
    'faq.title': 'Частые вопросы',
    'faq.1.q': 'Чем это лучше, чем просто ChatGPT?', 'faq.1.a': 'Одна модель даёт один взгляд и иногда уверенно ошибается. В PRISM шесть разных моделей с разными ролями: критик ищет дыры, юрист — риски, аналитик — цифры. Решение Совета показывает, где они согласны, а где нет.',
    'faq.2.q': 'Нужно ли платить за каждую модель отдельно?', 'faq.2.a': 'Нет. Одна подписка PRISM — доступ ко всем шести.',
    'faq.3.q': 'На каком языке отвечают агенты?', 'faq.3.a': 'На языке вопроса: русский, қазақша или English.',
    'faq.4.q': 'Где хранятся мои вопросы?', 'faq.4.a': 'Сейчас история хранится только в твоём браузере. Мы не используем вопросы для обучения моделей.',
    'footer.rights': 'PRISM by Synapse · Алматы',
    // Приложение
    'app.new': 'Новый Совет', 'app.history': 'История', 'app.empty.history': 'Здесь появятся твои заседания.',
    'app.placeholder': 'Спроси Совет о бизнесе, учёбе или коде…',
    'app.send': 'Спросить Совет', 'app.agents': 'Кто участвует',
    'app.welcome.title': 'С чем поможет Совет?',
    'app.welcome.lead': 'Задай вопрос — шесть агентов ответят со своих ролей, а Совет вынесет решение.',
    'app.ex1': 'Как найти первых 100 клиентов для онлайн-школы в Казахстане?',
    'app.ex2': 'Стоит ли брать кредит на открытие кофейни у университета?',
    'app.ex3': 'Какой стек выбрать для MVP мобильного приложения за месяц?',
    'app.ex4': 'Помоги выбрать: IT-специальность в КБТУ или Назарбаев Университете?',
    'app.thinking': 'думает…', 'app.decision': 'Решение Совета', 'app.deciding': 'Совет совещается…',
    'app.demo': 'Демо-режим: ответы заготовлены. Подключи ключ OpenRouter, чтобы говорили настоящие модели.',
    'app.copy': 'Копировать', 'app.copied': 'Скопировано', 'app.export': 'Экспорт .md', 'app.delete': 'Удалить',
    'app.limit': 'Бесплатный лимит на сегодня исчерпан. Starter — 2 490 ₸/мес.',
    'app.error.net': 'Нет связи с сервером. Проверь интернет и попробуй ещё раз.',
    'app.retry': 'Повторить', 'app.minAgents': 'Нужен хотя бы один агент.',
    'app.menu': 'Меню', 'app.home': 'На главную', 'app.left': 'вопросов осталось сегодня'
  },
  en: {
    'nav.how': 'How it works', 'nav.agents': 'Agents', 'nav.pricing': 'Pricing', 'nav.faq': 'FAQ',
    'nav.open': 'Open PRISM',
    'hero.title': 'One question. Six experts. One decision.',
    'hero.lead': 'PRISM asks Claude, GPT, Gemini, Grok, DeepSeek and Mistral at once. Each answers from its own role, and the Council turns it all into one clear plan.',
    'hero.cta': 'Ask the Council', 'hero.note': 'No sign-up · first questions are free',
    'hero.decision': 'Council decision',
    'how.title': 'How a Council session works',
    'how.1.t': 'You ask a question', 'how.1.d': 'About business, study, code, or a decision you can’t make. In English, Russian or Kazakh.',
    'how.2.t': 'Six agents answer in parallel', 'how.2.d': 'Marketer, analyst, strategist, critic, developer and lawyer. Answers appear as they’re ready.',
    'how.3.t': 'The Council decides', 'how.3.d': 'A verdict, where experts agree and disagree, a 7-day plan and the main risk.',
    'agents.title': 'Who sits on the Council', 'agents.lead': 'Six different models mean six different perspectives. One model is often confidently wrong; six catch each other’s mistakes.',
    'pricing.title': 'Pricing', 'pricing.lead': 'Billed in tenge. Kaspi and cards.',
    'pricing.month': '/mo',
    'pricing.starter': 'Starter', 'pricing.starter.d': 'For study and personal decisions',
    'pricing.starter.f1': '30 Council sessions a month', 'pricing.starter.f2': 'All 6 agents, fast models', 'pricing.starter.f3': 'History and Markdown export',
    'pricing.pro': 'Pro', 'pricing.pro.d': 'For founders and teams',
    'pricing.pro.f1': '200 Council sessions a month', 'pricing.pro.f2': 'Each vendor’s strongest model', 'pricing.pro.f3': 'Priority speed',
    'pricing.business': 'Business', 'pricing.business.d': 'Shared team workspaces',
    'pricing.soon': 'Soon', 'pricing.choose': 'Get started', 'pricing.popular': 'Most popular',
    'faq.title': 'Questions',
    'faq.1.q': 'Why not just use ChatGPT?', 'faq.1.a': 'One model gives one view and is sometimes confidently wrong. PRISM runs six different models with different roles: the critic looks for holes, the lawyer for risks, the analyst for numbers. The decision shows where they agree and where they don’t.',
    'faq.2.q': 'Do I pay for each model separately?', 'faq.2.a': 'No. One PRISM subscription covers all six.',
    'faq.3.q': 'Which language do agents answer in?', 'faq.3.a': 'The language of your question: English, Russian or Kazakh.',
    'faq.4.q': 'Where are my questions stored?', 'faq.4.a': 'For now, history lives only in your browser. We don’t use your questions to train models.',
    'footer.rights': 'PRISM by Synapse · Almaty',
    'app.new': 'New Council', 'app.history': 'History', 'app.empty.history': 'Your sessions will appear here.',
    'app.placeholder': 'Ask the Council about business, study or code…',
    'app.send': 'Ask the Council', 'app.agents': 'Who takes part',
    'app.welcome.title': 'What should the Council decide?',
    'app.welcome.lead': 'Ask a question — six agents answer from their roles, then the Council decides.',
    'app.ex1': 'How do I find the first 100 customers for an online school?',
    'app.ex2': 'Should I take a loan to open a coffee shop near a university?',
    'app.ex3': 'Which stack should I use to ship a mobile MVP in a month?',
    'app.ex4': 'Help me choose between two computer science programs.',
    'app.thinking': 'thinking…', 'app.decision': 'Council decision', 'app.deciding': 'The Council is deliberating…',
    'app.demo': 'Demo mode: answers are pre-written. Add an OpenRouter key to hear the real models.',
    'app.copy': 'Copy', 'app.copied': 'Copied', 'app.export': 'Export .md', 'app.delete': 'Delete',
    'app.limit': 'Today’s free limit is used up. Starter is 2,490 ₸/mo.',
    'app.error.net': 'Can’t reach the server. Check your connection and try again.',
    'app.retry': 'Retry', 'app.minAgents': 'Pick at least one agent.',
    'app.menu': 'Menu', 'app.home': 'Home', 'app.left': 'questions left today'
  },
  kz: {
    'nav.how': 'Қалай жұмыс істейді', 'nav.agents': 'Агенттер', 'nav.pricing': 'Тарифтер', 'nav.faq': 'Сұрақтар',
    'nav.open': 'PRISM ашу',
    'hero.title': 'Бір сұрақ. Алты сарапшы. Бір шешім.',
    'hero.lead': 'PRISM сұрағыңды бірден алты ЖИ-ге қояды — Claude, GPT, Gemini, Grok, DeepSeek және Mistral. Әрқайсысы өз рөлінен жауап береді, ал Кеңес бәрін бір нақты жоспарға жинайды.',
    'hero.cta': 'Кеңеске сұрақ қою', 'hero.note': 'Тіркелусіз · алғашқы сұрақтар тегін',
    'hero.decision': 'Кеңес шешімі',
    'how.title': 'Кеңес қалай өтеді',
    'how.1.t': 'Сен сұрақ қоясың', 'how.1.d': 'Бизнес, оқу, код немесе шеше алмай жүрген мәселе туралы. Қазақша, орысша немесе ағылшынша.',
    'how.2.t': 'Алты агент қатар жауап береді', 'how.2.d': 'Маркетолог, талдаушы, стратег, сыншы, әзірлеуші және заңгер.',
    'how.3.t': 'Кеңес шешім шығарады', 'how.3.d': 'Үкім, келісім мен келіспеушілік, 7 күндік жоспар және басты тәуекел.',
    'agents.title': 'Кеңесте кім отыр', 'agents.lead': 'Алты түрлі модель — алты түрлі көзқарас. Бір модель жиі сенімді түрде қателеседі; алтауы бір-бірінің қатесін табады.',
    'pricing.title': 'Тарифтер', 'pricing.lead': 'Теңгемен төлем, Kaspi және карта.',
    'pricing.month': '/ай',
    'pricing.starter': 'Starter', 'pricing.starter.d': 'Оқу мен жеке шешімдер үшін',
    'pricing.starter.f1': 'Айына 30 Кеңес', 'pricing.starter.f2': 'Барлық 6 агент, жылдам модельдер', 'pricing.starter.f3': 'Тарих және Markdown экспорт',
    'pricing.pro': 'Pro', 'pricing.pro.d': 'Кәсіпкерлер мен командалар үшін',
    'pricing.pro.f1': 'Айына 200 Кеңес', 'pricing.pro.f2': 'Әр вендордың ең күшті моделі', 'pricing.pro.f3': 'Басым жылдамдық',
    'pricing.business': 'Business', 'pricing.business.d': 'Командаға ортақ кеңістіктер',
    'pricing.soon': 'Жақында', 'pricing.choose': 'Бастау', 'pricing.popular': 'Көпшілік таңдауы',
    'faq.title': 'Жиі қойылатын сұрақтар',
    'faq.1.q': 'Бұл жай ChatGPT-ден неге жақсы?', 'faq.1.a': 'Бір модель — бір көзқарас, кейде сенімді түрде қателеседі. PRISM-де алты түрлі модель әр түрлі рөлде: сыншы кемшілікті, заңгер тәуекелді, талдаушы сандарды іздейді.',
    'faq.2.q': 'Әр модель үшін бөлек төлеу керек пе?', 'faq.2.a': 'Жоқ. Бір PRISM жазылымы — алтауына да қолжетімділік.',
    'faq.3.q': 'Агенттер қай тілде жауап береді?', 'faq.3.a': 'Сұрақтың тілінде: қазақша, орысша немесе ағылшынша.',
    'faq.4.q': 'Сұрақтарым қайда сақталады?', 'faq.4.a': 'Әзірге тарих тек сенің браузеріңде сақталады.',
    'footer.rights': 'PRISM by Synapse · Алматы',
    'app.new': 'Жаңа Кеңес', 'app.history': 'Тарих', 'app.empty.history': 'Мұнда сенің кеңестерің шығады.',
    'app.placeholder': 'Кеңестен бизнес, оқу немесе код туралы сұра…',
    'app.send': 'Кеңестен сұрау', 'app.agents': 'Кім қатысады',
    'app.welcome.title': 'Кеңес немен көмектеседі?',
    'app.welcome.lead': 'Сұрақ қой — алты агент өз рөлінен жауап береді, Кеңес шешім шығарады.',
    'app.ex1': 'Онлайн-мектепке алғашқы 100 клиентті қалай табуға болады?',
    'app.ex2': 'Университет жанында кофехана ашу үшін несие алу керек пе?',
    'app.ex3': 'Бір айда мобильді MVP үшін қандай стек таңдау керек?',
    'app.ex4': 'ҰБТ балыма қай университетке грантқа түсемін?',
    'app.thinking': 'ойлануда…', 'app.decision': 'Кеңес шешімі', 'app.deciding': 'Кеңес ақылдасуда…',
    'app.demo': 'Демо-режим: жауаптар алдын ала дайындалған. Нақты модельдер үшін OpenRouter кілтін қос.',
    'app.copy': 'Көшіру', 'app.copied': 'Көшірілді', 'app.export': '.md экспорт', 'app.delete': 'Жою',
    'app.limit': 'Бүгінгі тегін лимит бітті. Starter — 2 490 ₸/ай.',
    'app.error.net': 'Серверге қосылу жоқ. Интернетті тексеріп, қайталап көр.',
    'app.retry': 'Қайталау', 'app.minAgents': 'Кемінде бір агент таңда.',
    'app.menu': 'Мәзір', 'app.home': 'Басты бет', 'app.left': 'сұрақ қалды бүгін'
  }
};

// Данные агентов для интерфейса (роль на трёх языках, цвет луча)
const AGENTS_UI = [
  { id: 'alex', name: 'Alex', vendor: 'Claude',   role: { ru: 'Маркетолог', en: 'Marketer', kz: 'Маркетолог' },
    desc: { ru: 'Кто купит, через какой канал и с каким сообщением.', en: 'Who buys, through which channel, with what message.', kz: 'Кім сатып алады, қай арна арқылы, қандай хабармен.' } },
  { id: 'sam',  name: 'Sam',  vendor: 'GPT',      role: { ru: 'Аналитик', en: 'Analyst', kz: 'Талдаушы' },
    desc: { ru: 'Считает рынок, юнит-экономику и показывает допущения.', en: 'Sizes the market and unit economics, shows assumptions.', kz: 'Нарық пен юнит-экономиканы есептейді.' } },
  { id: 'max',  name: 'Max',  vendor: 'Gemini',   role: { ru: 'Стратег', en: 'Strategist', kz: 'Стратег' },
    desc: { ru: 'Что делать первым, что отложить и в чём преимущество.', en: 'What to do first, what to postpone, where the edge is.', kz: 'Алдымен не істеу керек, артықшылық неде.' } },
  { id: 'zara', name: 'Zara', vendor: 'Grok',     role: { ru: 'Критик', en: 'Critic', kz: 'Сыншы' },
    desc: { ru: 'Ищет слабые места и предлагает дешёвый способ их проверить.', en: 'Finds weak spots and a cheap way to test them.', kz: 'Әлсіз жерлерді табады және арзан тексеруді ұсынады.' } },
  { id: 'leo',  name: 'Leo',  vendor: 'DeepSeek', role: { ru: 'Разработчик', en: 'Developer', kz: 'Әзірлеуші' },
    desc: { ru: 'Как это построить быстро и без лишней сложности.', en: 'How to build it fast without overengineering.', kz: 'Мұны тез әрі қарапайым қалай жасау керек.' } },
  { id: 'nina', name: 'Nina', vendor: 'Mistral',  role: { ru: 'Юрист', en: 'Lawyer', kz: 'Заңгер' },
    desc: { ru: 'Регистрация, налоги, персональные данные, договоры.', en: 'Registration, taxes, personal data, contracts.', kz: 'Тіркеу, салық, дербес деректер, шарттар.' } }
];

const LANGS = ['ru', 'kz', 'en'];

function getLang() {
  let saved = null;
  try { saved = localStorage.getItem('prism.lang'); } catch {}
  if (LANGS.includes(saved)) return saved;
  const nav = (navigator.language || 'ru').slice(0, 2);
  return nav === 'en' ? 'en' : nav === 'kk' ? 'kz' : 'ru';
}

function t(key, lang = getLang()) {
  return (DICT[lang] && DICT[lang][key]) || DICT.ru[key] || key;
}

// Подставляет переводы во все элементы с data-i18n на странице
function applyI18n(lang = getLang()) {
  document.documentElement.lang = lang === 'kz' ? 'kk' : lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n, lang); });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(';').forEach(pair => {
      const [attr, key] = pair.split(':');
      el.setAttribute(attr, t(key, lang));
    });
  });
  document.querySelectorAll('.lang-switch button').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  });
}

function setLang(lang) {
  try { localStorage.setItem('prism.lang', lang); } catch {}
  applyI18n(lang);
  document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
}

// Подключаем кнопки RU / KZ / EN, которые есть на странице
function initLangSwitch() {
  document.querySelectorAll('.lang-switch button').forEach(b => {
    b.addEventListener('click', () => setLang(b.dataset.lang));
  });
  applyI18n();
}
