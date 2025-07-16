// utils/openaiUsage.js
const axios = require('axios');

const OPENAI_BILLING_URL = 'https://api.openai.com/v1/dashboard/billing/usage';

/**
 * OpenAI API の当月利用量を取得する
 * 
 * この関数は管理者用のAPIキーを用いて、当月のOpenAIの使用量（USD）を取得します。
 * 一般ユーザー向けAPIキーでは取得できないことがあります。
 * 
 * @param {string} apiKey 組織管理者レベルのOpenAI APIキー
 * @returns {Promise<{
 *   usage: string,
 *   raw: object
 * } | {
 *   error: true,
 *   message: string,
 *   status?: number
 * }>} 使用量情報 または エラーオブジェクト
 */
async function getOpenAIUsage(apiKey) {
  try {
    const now = new Date();

    // OpenAIはUTC基準なので、UTC日付で月初〜翌日を取得
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
      .toISOString().split('T')[0];
    const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
      .toISOString().split('T')[0];

    const response = await axios.get(
      `${OPENAI_BILLING_URL}?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    const usageInCents = response.data.total_usage; // セント単位
    const usageInDollars = (usageInCents / 100).toFixed(2);

    return {
      usage: usageInDollars,
      raw: response.data,
    };
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;

    console.error('🔻 OpenAI 使用量取得エラー:', data || error.message);

    return {
      error: true,
      message: '💸 使用量の取得に失敗しました（個人キーでは取得できない場合があります）。',
      status,
    };
  }
}

module.exports = { getOpenAIUsage };
