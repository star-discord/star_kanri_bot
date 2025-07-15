const OpenAI = require('openai');
const { ensureGuildJSON, readJSON } = require('./fileHelper');

/**
 * OpenAI API呼び出しの安全なラッパー
 * エラーハンドリングとフォールバックを提供
 * @param {Function} apiCall API呼び出し関数
 * @param {Object} fallbackResponse エラー時の代替レスポンス
 * @returns {Promise<Object>}
 */
async function safeOpenAICall(apiCall, fallbackResponse) {
  try {
    return await apiCall();
  } catch (error) {
    console.error('OpenAI APIエラー:', error.message, error.code);
    // より詳細なエラーハンドリング（必要に応じて追加）
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
 * @param {string} prompt プロンプト
 * @param {string} guildId ギルドID
 * @param {Object} options (optional)
 * @returns {Promise<Object>}
 */
async function getChatCompletion(prompt, guildId, options = {}) {
  const { chatgpt } = await readGuildChatGPTConfig(guildId);

  if (!chatgpt?.apiKey) {
    return { error: true, message: 'APIキーが設定されていません。' };
  }

  // OpenAI クライアントを初期化（APIキーを使用）
  const openai = new OpenAI({ apiKey: chatgpt.apiKey });

    const defaultOptions = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: chatgpt.maxTokens || 150,
    temperature: chatgpt.temperature || 0.7,
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

/**
 * ギルドのChatGPT設定を読み込む
 * @param {string} guildId ギルドID
 * @returns {Promise<Object>} 設定オブジェクト
 */
async function readGuildChatGPTConfig(guildId) {
  const filePath = await ensureGuildJSON(guildId);
  const config = await readJSON(filePath);
  return config;
}

module.exports = {
  getChatCompletion,
};
