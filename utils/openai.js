// utils/openai.js
const { OpenAIApi, Configuration } = require('openai');
const dotenv = require('dotenv');
dotenv.config();

// 迺ｰ蠅・､画焚縺ｮ蟄伜惠遒ｺ隱搾ｼ・PI繧ｭ繝ｼ蠢・茨ｼ・
if (!process.env.OPENAI_API_KEY) {
  console.warn('笞・・OPENAI_API_KEY 縺瑚ｨｭ螳壹＆繧後※縺・∪縺帙ｓ縲０penAI騾｣謳ｺ縺ｯ辟｡蜉ｹ縺ｫ縺ｪ繧翫∪縺吶・);
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports = openai;
