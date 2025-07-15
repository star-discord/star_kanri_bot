// utils/openaiUsage.js
const axios = require('axios');

/**
 * OpenAI API の当月利用量を取得する
 * @param {string} apiKey 組織管理者レベルのAPIキー
 * @returns {Promise<object>}
 */
async function getOpenAIUsage(apiKey) {
  try {
    const now = new Date();
    // APIはUTCの日付を要求するため、ローカルタイムゾーンに関わらずYYYY-MM-DD形式を生成する
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().split('T')[0];
    const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 翌日まで含めることで当日分も取得

    const response = await axios.get(
      `https://api.openai.com/v1/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      }
    );

    const usageInCents = response.data.total_usage; // 単位：セント
    return {
      usage: (usageInCents / 100).toFixed(2), // ドル換算
      raw: response.data
    };
  } catch (error) {
    console.error('使用量取得エラー:', error.response?.data || error.message);
    return {
      error: true,
      message: '💸 使用量の取得に失敗しました（キーが個人用で対応していない可能性あり）。',
    };
  }
}

module.exports = { getOpenAIUsage };