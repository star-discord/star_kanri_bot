// utils/openaiUsage.js
const axios = require('axios');

const OPENAI_BILLING_URL = 'https://api.openai.com/v1/dashboard/billing/usage';

/**
 * OpenAI API の当月利用量を取得する
 * @param {string} apiKey 組織管理者レベルのAPIキー
 * @returns {Promise<{usage: string, raw: object} | {error: true, message: string, status?: number}>} 使用量情報またはエラーオブジェクト
 */
async function getOpenAIUsage(apiKey) {
  try {
    const now = new Date();
    // OpenAI APIはUTC基準の日付を要求するため、`Date.UTC` を使用して正確な日付を生成
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().split('T')[0];
    // 翌日の日付をUTCで取得することで、当日分までを確実に含める
    const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString().split('T')[0];

    const response = await axios.get(
      `${OPENAI_BILLING_URL}?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    const usageInCents = response.data.total_usage; // 単位：セント
    return {
      usage: (usageInCents / 100).toFixed(2), // ドル換算して小数点以下2桁に
      raw: response.data,
    };
  } catch (error) {
    console.error('使用量取得エラー:', error.response?.data || error.message);
    return {
      error: true,
      message: '💸 使用量の取得に失敗しました（キーが個人用で対応していない可能性あり）。',
      status: error.response?.status,
    };
  }
}

module.exports = { getOpenAIUsage };