// ============================================================
// lib/models.js — какие модели проверяют ответ
// Что это: список независимых «экспертов» и «судьи».
// Почему без персонажей (маркетолог, юрист…): исследования показывают,
//   что точность даёт НЕЗАВИСИМОСТЬ ответов и их сравнение, а не роли.
//   (Debate or Vote, NeurIPS 2025; Du et al., ICML 2024)
// Почему разные вендоры: модели одной компании ошибаются похоже.
//   Если Claude, GPT и Gemini пришли к одному выводу независимо — это сильнее.
// Менять модели — только здесь. Ключ берётся из OPENROUTER_API_KEY.
// ============================================================

const SOLVERS = {
  // Бесплатный и Plus: быстрые и дешёвые модели трёх разных компаний
  standard: [
    { id: 'A', vendor: 'Claude', model: 'anthropic/claude-haiku-5.5' },
    { id: 'B', vendor: 'GPT', model: 'openai/gpt-6-luna-pro' },
    { id: 'C', vendor: 'Gemini', model: 'google/gemini-3.8-flash' }
  ],
  // Pro: сильнейшие модели пяти компаний
  pro: [
    { id: 'A', vendor: 'Claude', model: 'anthropic/claude-sonnet-5.5' },
    { id: 'B', vendor: 'GPT', model: 'openai/gpt-6.1-sol' },
    { id: 'C', vendor: 'Gemini', model: 'google/gemini-4-argon' },
    { id: 'D', vendor: 'Grok', model: 'x-ai/grok-4.7' },
    { id: 'E', vendor: 'DeepSeek', model: 'deepseek/deepseek-v4-pro-0813' }
  ]
};

// Судья не отвечает на вопрос сам — он только сравнивает ответы
const JUDGE = {
  standard: 'anthropic/claude-sonnet-5.5',
  pro: 'anthropic/claude-opus-5.5'
};

module.exports = { SOLVERS, JUDGE };
