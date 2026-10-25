// ============================================================
// demo-engine.js — демо-режим без ключа API
// Работает в двух местах: на сервере (require из lib/council.js)
// и прямо в браузере, если сайт открыт без сервера (статичный хостинг).
// Что это: заготовленные ответы агентов, когда OPENROUTER_API_KEY не задан.
// Зачем: сайт можно показать людям и протестировать интерфейс
//        до того, как ты положишь деньги на OpenRouter.
// Важно: интерфейс честно показывает плашку «Демо-режим».
// ============================================================

// Определяем язык вопроса: казахские буквы → kz, кириллица → ru, иначе en
function detectLang(text) {
  if (/[әғқңөұүһі]/i.test(text)) return 'kz';
  if (/[а-яё]/i.test(text)) return 'ru';
  return 'en';
}

// Короткая «тема» вопроса для подстановки в шаблон
function topicOf(question) {
  const clean = question.replace(/\s+/g, ' ').trim();
  return clean.length > 70 ? clean.slice(0, 67) + '…' : clean;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

const TEMPLATES = {
  ru: {
    alex: t => `Смотрю на «${t}» глазами клиента.\n\n**Кто купит первым:** не «все», а узкий сегмент — например, владельцы малого бизнеса в Алматы, которым нужен результат за неделю.\n\n**Каналы на старт:**\n- Instagram Reels и TikTok: 3 ролика в неделю «до/после»\n- Telegram-чаты предпринимателей — нативные кейсы, не реклама\n- Сарафан: первые 10 клиентов со скидкой за отзыв\n\n**Оффер:** одно предложение, которое понятно за 3 секунды. Если не можешь его сформулировать — продукт ещё не готов к рекламе.`,
    sam: t => `Посчитаю «${t}» на допущениях (поправь, если цифры другие).\n\n- Цена: **2 490 ₸/мес**\n- Конверсия из бесплатного в платный: **3–5%**\n- Чтобы выйти на 100 платящих, нужно **2 000–3 300** активных бесплатных пользователей\n- Выручка при 100 платящих: **≈249 000 ₸/мес**\n\n**Вывод:** главная метрика сейчас — не выручка, а доля пользователей, вернувшихся на 2-й неделе. Если она ниже 20%, реклама просто сожжёт деньги.\n\n*Это допущения, а не факты — проверь на первых 50 пользователях.*`,
    max: t => `Стратегия для «${t}» на 6 месяцев:\n\n1. **Месяц 1:** одна функция, которая решает одну боль лучше всех. Остальное — в бэклог.\n2. **Месяц 2–3:** 30 интервью с пользователями, итерации каждую неделю.\n3. **Месяц 4–6:** платный тариф и один масштабируемый канал.\n\n**Преимущество:** локальный рынок — язык, Kaspi-оплата, местные кейсы. Глобальные игроки это делать не будут.\n\n**Не делать сейчас:** мобильное приложение, команду из 5 человек, сложную архитектуру.`,
    zara: t => `Буду неудобной насчёт «${t}».\n\n- **Ложное допущение:** «людям это нужно». Пока это не доказано деньгами — это гипотеза.\n- **Риск:** бесплатные альтернативы уже существуют. Почему перейдут к тебе?\n- **Упущено:** кто будет поддерживать продукт, когда ты в школе с 8 до 14?\n\n**Как проверить дёшево:** лендинг + кнопка «Оплатить» + 100 ₸ рекламы на каждого посетителя. Если из 200 посетителей никто не нажал — идея не та, и это хорошая новость: ты сэкономил месяцы.`,
    leo: t => `Как собрать «${t}» без лишней сложности:\n\n- **Фронт:** HTML/CSS/JS, деплой на Vercel (бесплатно)\n- **Бэкенд:** одна serverless-функция в \`/api\`\n- **База и вход:** Supabase (Google + magic link)\n- **Оплата:** Kaspi QR вручную на старте, автоматизация потом\n\n**За выходные:** рабочая версия с одной главной функцией.\n\n**Подводные камни:** не храни ключи API во фронтенде — их украдут за час. Только в переменных окружения сервера.`,
    nina: t => `Правовая сторона «${t}»:\n\n- **Форма:** в Казахстане удобнее всего ИП на упрощёнке. До 18 лет нужна регистрация через законного представителя — уточни у юриста.\n- **Персональные данные:** закон РК о персональных данных требует согласия пользователя и хранения данных граждан РК на территории РК — проверь, где твой сервер.\n- **Оферта:** публичная оферта и политика конфиденциальности на сайте — обязательно до первой оплаты.\n\n*Это не юридическое заключение — финальные решения согласуй с юристом.*`
  },
  en: {
    alex: t => `Looking at "${t}" through the customer's eyes.\n\n**First buyers:** not "everyone" — a narrow segment that needs a result this week.\n\n**Launch channels:**\n- Reels/TikTok: 3 before/after videos a week\n- Founder Telegram/Discord communities — case studies, not ads\n- Word of mouth: first 10 customers get a discount for a review\n\n**Offer:** one sentence that's clear in 3 seconds. If you can't write it, you're not ready to advertise.`,
    sam: t => `Running numbers on "${t}" (assumptions — correct me).\n\n- Price: **$5/mo**\n- Free → paid conversion: **3–5%**\n- 100 paying users need **2,000–3,300** active free users\n- Revenue at 100 paying: **≈$500/mo**\n\n**Takeaway:** the key metric now is week-2 retention, not revenue. Below 20%, ads just burn money.`,
    max: t => `6-month strategy for "${t}":\n\n1. **Month 1:** one feature that solves one pain better than anyone.\n2. **Months 2–3:** 30 user interviews, weekly iterations.\n3. **Months 4–6:** paid tier plus one scalable channel.\n\n**Edge:** local market — language, local payments, local cases.\n\n**Not now:** native app, big team, complex architecture.`,
    zara: t => `Let me be the uncomfortable one about "${t}".\n\n- **False assumption:** "people need this". Until money proves it, it's a hypothesis.\n- **Risk:** free alternatives exist. Why would anyone switch?\n- **Missed:** who runs this while you're in school?\n\n**Cheap test:** landing page + "Pay" button + small ad spend. If 0 of 200 visitors click — wrong idea, and you just saved months.`,
    leo: t => `How to build "${t}" without overengineering:\n\n- **Front:** HTML/CSS/JS on Vercel (free)\n- **Back:** one serverless function in \`/api\`\n- **DB + auth:** Supabase\n- **Payments:** manual first, automate later\n\n**Pitfall:** never put API keys in front-end code — only server env variables.`,
    nina: t => `Legal side of "${t}":\n\n- **Entity:** start as a sole proprietor; under 18 you'll need a legal guardian — check locally.\n- **Personal data:** get explicit consent and check data-residency rules.\n- **Terms:** public offer + privacy policy before the first payment.\n\n*Not legal advice — confirm with a lawyer.*`
  },
  kz: {
    alex: t => `«${t}» — клиент көзімен.\n\n**Алғашқы сатып алушы:** нақты тар сегмент.\n\n- Reels/TikTok: аптасына 3 видео\n- Telegram-чаттар: жарнама емес, кейстер\n- Алғашқы 10 клиентке пікір үшін жеңілдік`,
    sam: t => `«${t}» бойынша есеп (болжам).\n\n- Баға: **2 490 ₸/ай**\n- Тегіннен ақылыға конверсия: **3–5%**\n- 100 төлеуші ≈ **249 000 ₸/ай**\n\n**Қорытынды:** қазір ең маңызды метрика — 2-аптада қайтып келгендер үлесі.`,
    max: t => `«${t}» стратегиясы:\n\n1. **1-ай:** бір мәселені бәрінен жақсы шешетін бір функция.\n2. **2–3-ай:** 30 сұхбат, апта сайын жақсарту.\n3. **4–6-ай:** ақылы тариф және бір арна.`,
    zara: t => `«${t}» туралы ыңғайсыз сұрақтар:\n\n- «Адамдарға керек» — әзірге тек гипотеза.\n- Тегін баламалар бар. Неге сізге ауысады?\n\n**Арзан тексеру:** лендинг + «Төлеу» батырмасы.`,
    leo: t => `«${t}» қалай жасау керек:\n\n- HTML/CSS/JS + Vercel\n- \`/api\` ішінде бір serverless функция\n- Supabase: база және кіру\n\nAPI кілттерін фронтендте сақтамаңыз.`,
    nina: t => `«${t}» құқықтық жағы:\n\n- ЖК (жеке кәсіпкер) — ең оңай форма. 18 жасқа дейін заңды өкіл қажет.\n- Дербес деректер: пайдаланушы келісімі міндетті.\n\n*Бұл заңгерлік қорытынды емес.*`
  }
};

const DECISIONS = {
  ru: `**Вердикт:** запускай самую маленькую версию и проверяй спрос деньгами, а не мнениями.\n\n**Где Совет согласен:**\n- Нужен один узкий сегмент и одна главная функция\n- Метрика номер один — возвращаемость на 2-й неделе\n\n**Где мнения разошлись:**\n- Alex хочет сразу запускать контент, Zara — сначала доказать спрос. Совет на стороне Zara: тест на лендинге стоит дешевле.\n\n**План на 7 дней:**\n1. Сформулируй оффер в одном предложении\n2. Собери лендинг с кнопкой оплаты (Leo: Vercel + Kaspi QR)\n3. Проведи 10 разговоров с потенциальными клиентами\n\n**Главный риск:** строить продукт месяцами, ни разу не попросив за него денег.`,
  en: `**Verdict:** ship the smallest version and validate demand with money, not opinions.\n\n**Where the Council agrees:**\n- One narrow segment, one core feature\n- Week-2 retention is metric number one\n\n**Where opinions split:**\n- Alex wants content now, Zara wants proof of demand first. The Council sides with Zara: a landing-page test is cheaper.\n\n**7-day plan:**\n1. Write the offer in one sentence\n2. Ship a landing page with a pay button\n3. Talk to 10 potential customers\n\n**Main risk:** building for months without ever asking for money.`,
  kz: `**Шешім:** ең кіші нұсқаны іске қосып, сұранысты ақшамен тексер.\n\n**Кеңес келіседі:**\n- Бір тар сегмент, бір негізгі функция\n- Басты метрика — 2-аптадағы қайтып келу\n\n**Пікір екіге бөлінді:**\n- Alex бірден контент жасағысы келеді, Zara алдымен сұранысты дәлелдеуді ұсынады. Кеңес Zara жағында.\n\n**7 күндік жоспар:**\n1. Ұсынысты бір сөйлеммен жаз\n2. Төлем батырмасы бар лендинг жаса\n3. 10 әлеуетті клиентпен сөйлес\n\n**Басты тәуекел:** ешқашан ақша сұрамай, айлар бойы өнім жасау.`
};

async function demoAgentAnswer(agent, question) {
  await sleep(600 + Math.random() * 2200); // имитируем, что модели думают разное время
  const lang = detectLang(question);
  return { content: TEMPLATES[lang][agent.id](topicOf(question)) };
}

async function demoDecision(question) {
  await sleep(1200);
  return { content: DECISIONS[detectLang(question)] };
}

// Универсальный экспорт: Node.js (module.exports) или браузер (window.PrismDemo)
const PrismDemoAPI = { demoAgentAnswer, demoDecision, detectLang };
if (typeof module !== 'undefined' && module.exports) module.exports = PrismDemoAPI;
else window.PrismDemo = PrismDemoAPI;
