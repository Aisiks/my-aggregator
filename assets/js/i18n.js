// ============================================================
// i18n.js — переводы интерфейса PRISM: RU / KZ / EN
// В HTML: data-i18n="ключ" (текст) и data-i18n-attr="placeholder:ключ" (атрибуты).
// Язык запоминается в localStorage.
// ============================================================

const DICT = {
  ru: {
    'nav.how': 'Как работает', 'nav.cases': 'Для чего', 'nav.pricing': 'Тарифы', 'nav.faq': 'Вопросы', 'nav.open': 'Проверить ответ',
    'hero.title': 'ИИ отвечает уверенно. Даже когда ошибается.',
    'hero.lead': 'PRISM задаёт твой вопрос сразу нескольким ИИ разных компаний — Claude, GPT и Gemini — и показывает, где они согласны, а где нет. Ты видишь не один уверенный ответ, а реальную степень уверенности.',
    'hero.cta': 'Проверить', 'hero.note': 'Без регистрации · 3 проверки в день бесплатно',
    'hero.tab.ask': 'Задать вопрос', 'hero.tab.check': 'Проверить ответ ChatGPT',
    'hero.ph.ask': 'Например: я ИП на упрощёнке, клиент-ТОО говорит, что со мной стало невыгодно работать. Это правда?',
    'hero.ph.check': 'Вставь ответ ChatGPT, которому не до конца веришь',
    'demo.q': 'Можно не сдавать форму 910, если за полугодие не было дохода?',
    'demo.verdict': 'Модели согласны: так делать нельзя',
    'problem.title': 'Почему одному ИИ нельзя верить на слово',
    'problem.1.n': '94,5%', 'problem.1.t': 'запросов к ИИ в Казахстане идут в один ChatGPT',
    'problem.2.n': '69–88%', 'problem.2.t': 'ответов ИИ на юридические вопросы содержали ошибки в исследовании Стэнфорда',
    'problem.3.n': '7 ₸', 'problem.3.t': 'долга — и заблокированные счета ИП, который поверил ChatGPT, что форму сдавать не нужно',
    'problem.src': 'Источники: Finprom через Kapital.kz (05.2025), Stanford HAI, Digital Business (11.2025)',
    'how.title': 'Как PRISM проверяет ответ',
    'how.1.t': 'Независимые ответы', 'how.1.d': 'Три модели разных компаний отвечают отдельно и не видят друг друга. Если ошибается одна — две другие это покажут.',
    'how.2.t': 'Сверка по пунктам', 'how.2.d': 'Судья разбирает ответы на утверждения и сравнивает их. Он не придумывает своё — только сопоставляет.',
    'how.3.t': 'Уровень согласия', 'how.3.d': 'Ты видишь, в чём модели сошлись, где спорят и что обязательно проверить у человека перед решением.',
    'cases.title': 'Когда это особенно важно',
    'cases.tax.t': 'Налоги и ИП', 'cases.tax.d': 'Новый Налоговый кодекс 2026: режимы, НДС, формы, уведомления КГД.',
    'cases.law.t': 'Договоры и право', 'cases.law.d': 'Аренда, работа, покупка, споры. PRISM подскажет, какой закон открыть.',
    'cases.study.t': 'Поступление', 'cases.study.d': 'ЕНТ, гранты, специальности — где ИИ особенно любит выдумывать цифры.',
    'cases.biz.t': 'Решения в бизнесе', 'cases.biz.d': 'Кредит, закупка, найм. Где модели расходятся — там и твой риск.',
    'check.title': 'Работает поверх ChatGPT',
    'check.lead': 'Не надо ничего менять. Пользуйся ChatGPT как раньше, а важный ответ вставь в PRISM — три других модели проверят его по пунктам.',
    'pricing.title': 'Тарифы', 'pricing.lead': 'Оплата в тенге: Kaspi и карта.', 'pricing.month': '/мес',
    'pricing.free': 'Бесплатно', 'pricing.free.d': 'Попробовать', 'pricing.free.f1': '3 проверки в день', 'pricing.free.f2': '3 модели + судья', 'pricing.free.f3': 'История на устройстве',
    'pricing.plus': 'Plus', 'pricing.plus.d': 'Для ИП, студентов и родителей', 'pricing.plus.f1': '100 проверок в месяц', 'pricing.plus.f2': 'Режим «Проверить ответ ChatGPT»', 'pricing.plus.f3': 'Экспорт отчёта, чтобы показать бухгалтеру или юристу',
    'pricing.pro': 'Pro', 'pricing.pro.d': 'Когда цена ошибки высокая', 'pricing.pro.f1': '300 проверок в месяц', 'pricing.pro.f2': '5 сильнейших моделей + самый сильный судья', 'pricing.pro.f3': 'Приоритетная скорость',
    'pricing.choose': 'Начать', 'pricing.popular': 'Выбор большинства',
    'faq.title': 'Частые вопросы',
    'faq.1.q': 'Это замена юристу или бухгалтеру?', 'faq.1.a': 'Нет. PRISM показывает, насколько уверенно ИИ отвечает и что именно нужно проверить. Если модели расходятся в вопросах денег или права — мы прямо говорим: покажи специалисту.',
    'faq.2.q': 'Чем это отличается от ChatGPT?', 'faq.2.a': 'ChatGPT — одна модель и один уверенный ответ. PRISM сравнивает ответы моделей трёх разных компаний: если они независимо пришли к одному выводу, ему можно доверять больше. Если нет — ты узнаешь об этом до решения, а не после.',
    'faq.3.q': 'Почему не шесть агентов с ролями?', 'faq.3.a': 'Исследования показывают, что точность даёт независимость ответов и их сравнение, а не роли «маркетолог» или «юрист». Поэтому мы убрали персонажей и оставили то, что работает.',
    'faq.4.q': 'Где хранятся мои вопросы?', 'faq.4.a': 'История — только в твоём браузере. Вопросы уходят моделям через OpenRouter для ответа и не используются нами для обучения.',
    'faq.5.q': 'Ответы помечены как созданные ИИ?', 'faq.5.a': 'Да. Каждый ответ в PRISM помечен как сгенерированный ИИ — так требует закон РК «Об искусственном интеллекте».',
    'footer.rights': 'PRISM — продукт Synapse · Алматы', 'footer.synapse': 'О Synapse',
    // Приложение
    'app.new': 'Новая проверка', 'app.history': 'История', 'app.empty.history': 'Здесь появятся твои проверки.',
    'app.mode.ask': 'Задать вопрос', 'app.mode.check': 'Проверить ответ ИИ',
    'app.topic': 'Тема', 'topic.tax': 'Налоги и ИП', 'topic.law': 'Право', 'topic.study': 'Поступление', 'topic.business': 'Бизнес', 'topic.general': 'Другое',
    'app.ph.ask': 'Задай вопрос, от ответа на который зависят деньги или решение…',
    'app.ph.check': 'Вставь ответ ChatGPT или другого ИИ — проверим каждое утверждение…',
    'app.send': 'Проверить', 'app.welcome.title': 'Что проверим?',
    'app.welcome.lead': 'Три ИИ разных компаний ответят независимо, а PRISM покажет, насколько им можно верить.',
    'app.ex.title': 'Попробуй пример',
    'app.ex1': 'Я ИП на упрощёнке, работаю с ТОО. Клиент говорит, что с 2026 года ему невыгодно со мной работать. Это правда и что делать?',
    'app.ex2': 'ChatGPT сказал: «ИП на упрощёнке может не сдавать форму 910, если не было дохода. Налог платится раз в год до 31 марта». Это правда?',
    'app.ex3': 'У меня 115 баллов ЕНТ. Хватит на грант на IT в Алматы?',
    'app.models': 'Модели отвечают независимо', 'app.thinking': 'отвечает…', 'app.judging': 'Сверяем ответы…',
    'app.consensus': 'Согласие моделей', 'app.trust': 'Можно ли верить тексту', 'app.level.high': 'Высокое', 'app.level.mid': 'Частичное', 'app.level.low': 'Низкое', 'app.level.none': 'Не измерялось',
    'app.agreed': 'В чём модели согласны', 'app.disputed': 'Где расходятся', 'app.verify': 'Проверь перед решением',
    'app.escalate': 'Покажи это специалисту', 'app.answers': 'Ответы моделей по отдельности',
    'app.answered': 'ответили', 'app.of': 'из',
    'app.ai.label': 'Сгенерировано ИИ. Не является юридической, налоговой или медицинской консультацией.',
    'app.demo': 'Демо-режим: показываем разобранные примеры. Подключи ключ OpenRouter, чтобы отвечали настоящие модели.',
    'app.copy': 'Копировать отчёт', 'app.copied': 'Скопировано', 'app.export': 'Скачать .md', 'app.delete': 'Удалить',
    'app.limit': 'Бесплатные проверки на сегодня закончились. Plus — 2 490 ₸/мес.',
    'app.error.net': 'Нет связи с сервером. Проверь интернет и попробуй ещё раз.',
    'app.retry': 'Повторить', 'app.menu': 'Меню', 'app.home': 'На главную', 'app.left': 'проверок осталось сегодня',
    'app.verdict.claim': 'верно', 'app.verdict.false': 'неверно', 'app.verdict.unclear': 'неясно',
    'app.followup': 'Уточнить вопрос…'
  },
  kz: {
    'nav.how': 'Қалай жұмыс істейді', 'nav.cases': 'Не үшін', 'nav.pricing': 'Тарифтер', 'nav.faq': 'Сұрақтар', 'nav.open': 'Жауапты тексеру',
    'hero.title': 'ЖИ сенімді жауап береді. Тіпті қателескенде де.',
    'hero.lead': 'PRISM сұрағыңды бірден әр түрлі компаниялардың бірнеше ЖИ-іне қояды — Claude, GPT және Gemini — және олардың қай жерде келісетінін, қай жерде келіспейтінін көрсетеді.',
    'hero.cta': 'Тексеру', 'hero.note': 'Тіркелусіз · күніне 3 тегін тексеру',
    'hero.tab.ask': 'Сұрақ қою', 'hero.tab.check': 'ChatGPT жауабын тексеру',
    'hero.ph.ask': 'Мысалы: мен оңайлатылған режимдегі ЖК-мын, ЖШС клиентім енді менімен жұмыс істеу тиімсіз дейді. Рас па?',
    'hero.ph.check': 'Толық сенбейтін ChatGPT жауабын қой',
    'demo.q': 'Жарты жылда табыс болмаса, 910 нысанын тапсырмауға бола ма?',
    'demo.verdict': 'Модельдер келіседі: олай істеуге болмайды',
    'problem.title': 'Неге бір ЖИ-ге сөзбе-сөз сенуге болмайды',
    'problem.1.n': '94,5%', 'problem.1.t': 'Қазақстандағы ЖИ сұрауларының үлесі бір ChatGPT-ге тиесілі',
    'problem.2.n': '69–88%', 'problem.2.t': 'Стэнфорд зерттеуінде заң сұрақтарына ЖИ жауаптарында қате болған',
    'problem.3.n': '7 ₸', 'problem.3.t': 'қарыз — ChatGPT-ге сенген ЖК-ның шоттары бұғатталды',
    'problem.src': 'Дереккөздер: Finprom (Kapital.kz, 05.2025), Stanford HAI, Digital Business (11.2025)',
    'how.title': 'PRISM жауапты қалай тексереді',
    'how.1.t': 'Тәуелсіз жауаптар', 'how.1.d': 'Әр түрлі компаниялардың үш моделі бөлек жауап береді және бір-бірін көрмейді.',
    'how.2.t': 'Тармақ бойынша салыстыру', 'how.2.d': 'Төреші жауаптарды тұжырымдарға бөліп, салыстырады. Өзінен ештеңе ойлап шығармайды.',
    'how.3.t': 'Келісім деңгейі', 'how.3.d': 'Модельдер неде келісті, неде дауласты және шешім алдында нені тексеру керек — бәрін көресің.',
    'cases.title': 'Бұл әсіресе қашан маңызды',
    'cases.tax.t': 'Салық және ЖК', 'cases.tax.d': '2026 жылғы жаңа Салық кодексі: режимдер, ҚҚС, нысандар, МКК хабарламалары.',
    'cases.law.t': 'Шарттар мен құқық', 'cases.law.d': 'Жалға алу, жұмыс, сатып алу, даулар.',
    'cases.study.t': 'Түсу', 'cases.study.d': 'ҰБТ, гранттар, мамандықтар — ЖИ сандарды жиі ойлап шығарады.',
    'cases.biz.t': 'Бизнес шешімдері', 'cases.biz.d': 'Несие, сатып алу, жалдау. Модельдер келіспеген жерде — тәуекел.',
    'check.title': 'ChatGPT-мен бірге жұмыс істейді',
    'check.lead': 'Ештеңені өзгертудің қажеті жоқ. Маңызды жауапты PRISM-ге қой — басқа үш модель оны тармақ бойынша тексереді.',
    'pricing.title': 'Тарифтер', 'pricing.lead': 'Теңгемен төлем: Kaspi және карта.', 'pricing.month': '/ай',
    'pricing.free': 'Тегін', 'pricing.free.d': 'Байқап көру', 'pricing.free.f1': 'Күніне 3 тексеру', 'pricing.free.f2': '3 модель + төреші', 'pricing.free.f3': 'Тарих құрылғыда',
    'pricing.plus': 'Plus', 'pricing.plus.d': 'ЖК, студенттер және ата-аналар үшін', 'pricing.plus.f1': 'Айына 100 тексеру', 'pricing.plus.f2': '«ChatGPT жауабын тексеру» режимі', 'pricing.plus.f3': 'Есепті экспорттау',
    'pricing.pro': 'Pro', 'pricing.pro.d': 'Қатенің бағасы жоғары болғанда', 'pricing.pro.f1': 'Айына 300 тексеру', 'pricing.pro.f2': '5 ең күшті модель', 'pricing.pro.f3': 'Басым жылдамдық',
    'pricing.choose': 'Бастау', 'pricing.popular': 'Көпшілік таңдауы',
    'faq.title': 'Жиі қойылатын сұрақтар',
    'faq.1.q': 'Бұл заңгер не бухгалтердің орнын баса ма?', 'faq.1.a': 'Жоқ. PRISM ЖИ қаншалықты сенімді жауап беретінін және нені тексеру керегін көрсетеді.',
    'faq.2.q': 'ChatGPT-ден айырмашылығы неде?', 'faq.2.a': 'ChatGPT — бір модель, бір жауап. PRISM үш түрлі компанияның модельдерін салыстырады.',
    'faq.3.q': 'Неге рөлдері бар алты агент емес?', 'faq.3.a': 'Зерттеулер дәлдікті рөлдер емес, жауаптардың тәуелсіздігі мен салыстыру беретінін көрсетеді.',
    'faq.4.q': 'Сұрақтарым қайда сақталады?', 'faq.4.a': 'Тарих тек сенің браузеріңде сақталады.',
    'faq.5.q': 'Жауаптар ЖИ жасағаны деп белгіленген бе?', 'faq.5.a': 'Иә, ҚР «Жасанды интеллект туралы» заңына сәйкес.',
    'footer.rights': 'PRISM — Synapse өнімі · Алматы', 'footer.synapse': 'Synapse туралы',
    'app.new': 'Жаңа тексеру', 'app.history': 'Тарих', 'app.empty.history': 'Мұнда тексерулерің шығады.',
    'app.mode.ask': 'Сұрақ қою', 'app.mode.check': 'ЖИ жауабын тексеру',
    'app.topic': 'Тақырып', 'topic.tax': 'Салық және ЖК', 'topic.law': 'Құқық', 'topic.study': 'Түсу', 'topic.business': 'Бизнес', 'topic.general': 'Басқа',
    'app.ph.ask': 'Ақша немесе шешім байланысты сұрақ қой…', 'app.ph.check': 'ChatGPT жауабын қой — әр тұжырымды тексереміз…',
    'app.send': 'Тексеру', 'app.welcome.title': 'Нені тексереміз?', 'app.welcome.lead': 'Әр түрлі компаниялардың үш ЖИ-і тәуелсіз жауап береді, PRISM оларға қаншалықты сенуге болатынын көрсетеді.',
    'app.ex.title': 'Мысалды байқап көр',
    'app.ex1': 'Мен оңайлатылған режимдегі ЖК-мын, ЖШС-мен жұмыс істеймін. Клиент 2026 жылдан бастап менімен жұмыс істеу тиімсіз дейді. Рас па?',
    'app.ex2': 'ChatGPT: «Табыс болмаса, ЖК 910 нысанын тапсырмауы мүмкін. Салық жылына бір рет 31 наурызға дейін төленеді» деді. Рас па?',
    'app.ex3': 'ҰБТ-дан 115 балым бар. Алматыда IT грантына жете ме?',
    'app.models': 'Модельдер тәуелсіз жауап береді', 'app.thinking': 'жауап беруде…', 'app.judging': 'Жауаптарды салыстырудамыз…',
    'app.consensus': 'Модельдердің келісімі', 'app.trust': 'Мәтінге сенуге бола ма', 'app.level.high': 'Жоғары', 'app.level.mid': 'Ішінара', 'app.level.low': 'Төмен', 'app.level.none': 'Өлшенбеді',
    'app.agreed': 'Модельдер неде келіседі', 'app.disputed': 'Қай жерде келіспейді', 'app.verify': 'Шешім алдында тексер',
    'app.escalate': 'Маманға көрсет', 'app.answers': 'Модельдердің жеке жауаптары', 'app.answered': 'жауап берді', 'app.of': '/',
    'app.ai.label': 'ЖИ жасаған. Заң, салық немесе медициналық кеңес емес.',
    'app.demo': 'Демо-режим: талданған мысалдар. Нақты модельдер үшін OpenRouter кілтін қос.',
    'app.copy': 'Есепті көшіру', 'app.copied': 'Көшірілді', 'app.export': '.md жүктеу', 'app.delete': 'Жою',
    'app.limit': 'Бүгінгі тегін тексерулер бітті. Plus — 2 490 ₸/ай.', 'app.error.net': 'Серверге қосылу жоқ.',
    'app.retry': 'Қайталау', 'app.menu': 'Мәзір', 'app.home': 'Басты бет', 'app.left': 'тексеру қалды бүгін',
    'app.verdict.claim': 'дұрыс', 'app.verdict.false': 'қате', 'app.verdict.unclear': 'анық емес', 'app.followup': 'Сұрақты нақтылау…'
  },
  en: {
    'nav.how': 'How it works', 'nav.cases': 'Use cases', 'nav.pricing': 'Pricing', 'nav.faq': 'FAQ', 'nav.open': 'Check an answer',
    'hero.title': 'AI sounds sure. Even when it’s wrong.',
    'hero.lead': 'PRISM asks several AIs from different companies — Claude, GPT and Gemini — the same question and shows where they agree and where they don’t. You see real confidence, not one confident answer.',
    'hero.cta': 'Check', 'hero.note': 'No sign-up · 3 free checks a day',
    'hero.tab.ask': 'Ask a question', 'hero.tab.check': 'Check a ChatGPT answer',
    'hero.ph.ask': 'E.g. My landlord says I can’t get my deposit back if I leave early. Is that true?',
    'hero.ph.check': 'Paste a ChatGPT answer you don’t fully trust',
    'demo.q': 'Can a sole proprietor skip form 910 if there was no income?',
    'demo.verdict': 'Models agree: you can’t',
    'problem.title': 'Why you can’t take one AI at its word',
    'problem.1.n': '94.5%', 'problem.1.t': 'of AI chatbot use in Kazakhstan goes to ChatGPT alone',
    'problem.2.n': '69–88%', 'problem.2.t': 'of AI answers to legal questions were wrong in a Stanford study',
    'problem.3.n': '₸7', 'problem.3.t': 'of tax debt froze the accounts of an entrepreneur who trusted ChatGPT',
    'problem.src': 'Sources: Finprom via Kapital.kz (05.2025), Stanford HAI, Digital Business (11.2025)',
    'how.title': 'How PRISM checks an answer',
    'how.1.t': 'Independent answers', 'how.1.d': 'Three models from different companies answer separately, without seeing each other.',
    'how.2.t': 'Claim-by-claim comparison', 'how.2.d': 'A judge splits the answers into claims and compares them. It adds nothing of its own.',
    'how.3.t': 'Agreement level', 'how.3.d': 'See what the models agree on, where they disagree, and what to verify with a person.',
    'cases.title': 'When it matters most',
    'cases.tax.t': 'Taxes', 'cases.tax.d': 'Rules change; AI often answers from outdated knowledge.',
    'cases.law.t': 'Contracts & law', 'cases.law.d': 'Leases, jobs, purchases, disputes.',
    'cases.study.t': 'Admissions', 'cases.study.d': 'Scores and scholarships — where AI loves to invent numbers.',
    'cases.biz.t': 'Business decisions', 'cases.biz.d': 'Loans, purchases, hiring. Disagreement = your risk.',
    'check.title': 'Works on top of ChatGPT',
    'check.lead': 'Keep using ChatGPT. Paste an important answer into PRISM — three other models check it claim by claim.',
    'pricing.title': 'Pricing', 'pricing.lead': 'Billed in tenge: Kaspi and cards.', 'pricing.month': '/mo',
    'pricing.free': 'Free', 'pricing.free.d': 'Try it', 'pricing.free.f1': '3 checks a day', 'pricing.free.f2': '3 models + judge', 'pricing.free.f3': 'History on your device',
    'pricing.plus': 'Plus', 'pricing.plus.d': 'For founders, students and parents', 'pricing.plus.f1': '100 checks a month', 'pricing.plus.f2': '“Check a ChatGPT answer” mode', 'pricing.plus.f3': 'Export a report for your accountant or lawyer',
    'pricing.pro': 'Pro', 'pricing.pro.d': 'When mistakes are expensive', 'pricing.pro.f1': '300 checks a month', 'pricing.pro.f2': '5 strongest models + strongest judge', 'pricing.pro.f3': 'Priority speed',
    'pricing.choose': 'Get started', 'pricing.popular': 'Most popular',
    'faq.title': 'Questions',
    'faq.1.q': 'Does it replace a lawyer or accountant?', 'faq.1.a': 'No. PRISM shows how confident the AI answer is and what to verify. If models disagree on money or law, we tell you to ask a professional.',
    'faq.2.q': 'How is it different from ChatGPT?', 'faq.2.a': 'ChatGPT is one model and one confident answer. PRISM compares models from three companies; independent agreement deserves more trust.',
    'faq.3.q': 'Why not six role-play agents?', 'faq.3.a': 'Research shows accuracy comes from independent answers and comparison, not from roles. So we dropped the characters.',
    'faq.4.q': 'Where are my questions stored?', 'faq.4.a': 'History stays in your browser. Questions go to the models via OpenRouter only to answer.',
    'faq.5.q': 'Are answers labelled as AI-generated?', 'faq.5.a': 'Yes, as required by Kazakhstan’s AI law.',
    'footer.rights': 'PRISM — a Synapse product · Almaty', 'footer.synapse': 'About Synapse',
    'app.new': 'New check', 'app.history': 'History', 'app.empty.history': 'Your checks will appear here.',
    'app.mode.ask': 'Ask', 'app.mode.check': 'Check an AI answer',
    'app.topic': 'Topic', 'topic.tax': 'Taxes', 'topic.law': 'Law', 'topic.study': 'Admissions', 'topic.business': 'Business', 'topic.general': 'Other',
    'app.ph.ask': 'Ask something where money or a decision depends on the answer…', 'app.ph.check': 'Paste an answer from ChatGPT or another AI — we’ll check each claim…',
    'app.send': 'Check', 'app.welcome.title': 'What should we check?', 'app.welcome.lead': 'Three AIs from different companies answer independently; PRISM shows how far you can trust them.',
    'app.ex.title': 'Try an example',
    'app.ex1': 'I’m a sole proprietor on the simplified regime working with an LLP. My client says since 2026 working with me isn’t profitable. True?',
    'app.ex2': 'ChatGPT said: “A sole proprietor on the simplified regime can skip form 910 if there was no income. Tax is paid once a year by March 31.” True?',
    'app.ex3': 'I scored 115 on the UNT. Is it enough for an IT grant in Almaty?',
    'app.models': 'Models answer independently', 'app.thinking': 'answering…', 'app.judging': 'Comparing answers…',
    'app.consensus': 'Model agreement', 'app.trust': 'Can you trust this text', 'app.level.high': 'High', 'app.level.mid': 'Partial', 'app.level.low': 'Low', 'app.level.none': 'Not measured',
    'app.agreed': 'What the models agree on', 'app.disputed': 'Where they disagree', 'app.verify': 'Verify before deciding',
    'app.escalate': 'Show this to a professional', 'app.answers': 'Each model’s answer', 'app.answered': 'answered', 'app.of': 'of',
    'app.ai.label': 'AI-generated. Not legal, tax or medical advice.',
    'app.demo': 'Demo mode: showing worked examples. Add an OpenRouter key for real models.',
    'app.copy': 'Copy report', 'app.copied': 'Copied', 'app.export': 'Download .md', 'app.delete': 'Delete',
    'app.limit': 'Today’s free checks are used up. Plus is ₸2,490/mo.', 'app.error.net': 'Can’t reach the server. Try again.',
    'app.retry': 'Retry', 'app.menu': 'Menu', 'app.home': 'Home', 'app.left': 'checks left today',
    'app.verdict.claim': 'true', 'app.verdict.false': 'false', 'app.verdict.unclear': 'unclear', 'app.followup': 'Follow up…'
  }
};

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

function applyI18n(lang = getLang()) {
  document.documentElement.lang = lang === 'kz' ? 'kk' : lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n, lang); });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(';').forEach(pair => {
      const [attr, key] = pair.split(':');
      el.setAttribute(attr, t(key, lang));
    });
  });
  document.querySelectorAll('.lang-switch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
}

function setLang(lang) {
  try { localStorage.setItem('prism.lang', lang); } catch {}
  applyI18n(lang);
  document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
}

function initLangSwitch() {
  document.querySelectorAll('.lang-switch button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  applyI18n();
}
