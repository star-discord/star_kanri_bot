// utils/openai.js
const { OpenAIApi, Configuration } = require('openai');
const dotenv = require('dotenv');
dotenv.config();

// 環墁E��数の存在確認！EPIキー忁E��！E
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠�E�EOPENAI_API_KEY が設定されてぁE��せん。OpenAI連携は無効になります、E);
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports = openai;
