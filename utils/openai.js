// utils/openai.js
const { OpenAIApi, Configuration } = require('openai');
const dotenv = require('dotenv');
dotenv.config();

// 環境変数の存在確認（APIキー必須）
if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY が設定されていません。OpenAI連携は無効になります。');
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

/**
 * OpenAI APIエラーハンドリング付きラッパー関数
 * @param {Function} apiCall - OpenAI API呼び出し関数
 * @param {Object} fallbackResponse - エラー時のフォールバックレスポンス
 * @returns {Promise<Object>} API結果またはフォールバックレスポンス
 */
async function safeOpenAICall(apiCall, fallbackResponse = null) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI APIキーが設定されていません。フォールバック応答を返します。');
    return fallbackResponse || {
      error: true,
      message: 'OpenAI APIが設定されていません。',
      type: 'configuration_error'
    };
  }

  try {
    const response = await apiCall();
    return response;
  } catch (error) {
    console.error('OpenAI APIエラー:', error.response?.data || error.message);
    
    // エラータイプ別の処理
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      
      switch (apiError.code) {
        case 'insufficient_quota':
          return {
            error: true,
            message: '🚫 OpenAI APIのクォータを超過しました。課金プランを確認してください。',
            type: 'quota_exceeded',
            details: 'APIの月次利用限度額に達しています。'
          };
          
        case 'rate_limit_exceeded':
          return {
            error: true,
            message: '⏳ APIリクエストが多すぎます。しばらく時間をおいて再試行してください。',
            type: 'rate_limit',
            details: 'リクエスト頻度制限に達しています。'
          };
          
        case 'invalid_api_key':
          return {
            error: true,
            message: '🔑 OpenAI APIキーが無効です。設定を確認してください。',
            type: 'authentication_error',
            details: 'APIキーの再設定が必要です。'
          };
          
        default:
          return {
            error: true,
            message: `❌ OpenAI APIエラー: ${apiError.message}`,
            type: apiError.type || 'unknown_error',
            details: apiError.message
          };
      }
    }
    
    // ネットワークエラーやその他のエラー
    return fallbackResponse || {
      error: true,
      message: '🌐 OpenAI APIへの接続に失敗しました。ネットワーク接続を確認してください。',
      type: 'network_error',
      details: error.message
    };
  }
}

/**
 * ChatGPT完了API呼び出し（エラーハンドリング付き）
 * @param {string} prompt - 送信するプロンプト
 * @param {Object} options - API呼び出しオプション
 * @returns {Promise<Object>} 応答結果またはエラー情報
 */
async function getChatCompletion(prompt, options = {}) {
  const defaultOptions = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
    temperature: 0.7,
    ...options
  };
  
  return await safeOpenAICall(
    () => openai.createChatCompletion(defaultOptions),
    {
      error: true,
      message: '🤖 申し訳ございませんが、現在ChatGPT機能をご利用いただけません。',
      type: 'service_unavailable',
      fallback_content: {
        weather: '今日の天気情報は取得できませんでした。',
        news: '最新ニュースは取得できませんでした。',
        trivia: 'ChatGPTは大規模言語モデルの一種で、様々な質問に答えることができます。'
      }
    }
  );
}

module.exports = {
  openai,
  safeOpenAICall,
  getChatCompletion
};
