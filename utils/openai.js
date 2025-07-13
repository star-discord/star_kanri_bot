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

module.exports = openai;
