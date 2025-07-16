// utils/openai.js

const OpenAI = require('openai');
const { ensureGuildJSON, readJSON } = require('./fileHelper');

/**
 * OpenAI API呼び出しの安全なラッパー
 */
async function safeOpenAICall(apiCall, fallbackResponse) {
  try {
    return await apiCall();
  } catch (error) {
    console.error('OpenAI APIエラー:', error.message, error.code);
    let message = 'OpenAI APIエラーが発生しました。';
    if (error.code === 'invalid_api_key') {
      message = '無効なAPIキーが設定されています。';
    } else if (error.code === 'insufficient_quota') {
      message = 'APIの利用制限に達しました。';
    } else if (error.code === 'rate_limit_exceeded') {
      message = 'APIのリクエスト制限を超えました。';
    }
    return fallbackResponse || { error: true, message };
  }
}

/**
 * ChatGPT APIを呼び出す（ギルドごとの設定を適用）
 */
async function getChatCompletion(prompt, guildId, options = {}) {
  const { chatgpt } = await readGuildChatGPTConfig(guildId);

  if (!chatgpt?.apiKey) {
    return { error: true, message: 'APIキーが設定されていません。' };
  }

  const openai = new OpenAI({ apiKey: chatgpt.apiKey });

  const defaultOptions = {
    model: chatgpt.model || 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: chatgpt.maxTokens || 150,
    temperature: chatgpt.temperature ?? 0.7,
    ...options,
  };

  return await safeOpenAICall(
    () => openai.chat.completions.create(defaultOptions),
    {
      error: true,
      message: '🤖 申し訳ございませんが、現在ChatGPT機能をご利用いただけません。',
    }
  );
}

async function readGuildChatGPTConfig(guildId) {
  const filePath = await ensureGuildJSON(guildId);
  const config = await readJSON(filePath);
  return config;
}

module.exports = {
  getChatCompletion,
};
