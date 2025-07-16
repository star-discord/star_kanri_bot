// utils/star_chat_gpt_config/configManager.js

const path = require('path');
const { readJSON, writeJSON, ensureGuildJSON } = require('../fileHelper');

async function getChatGPTConfig(guildId) {
  const filePath = await ensureGuildJSON(guildId);
  const config = await readJSON(filePath);
  return config.chatgpt || {};
}

async function saveChatGPTConfig(guildId, chatgptConfig) {
  const filePath = await ensureGuildJSON(guildId);
  const config = await readJSON(filePath);

  config.chatgpt = {
    ...config.chatgpt,
    ...chatgptConfig,
  };

  await writeJSON(filePath, config);
}

module.exports = {
  getChatGPTConfig,
  saveChatGPTConfig,
};
