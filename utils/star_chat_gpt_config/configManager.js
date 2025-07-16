// utils/star_chat_gpt_config/configManager.js

const path = require('path');
const { readJSON, writeJSON, ensureGuildJSON } = require('../fileHelper');

/**
 * ChatGPT設定を取得
 * @param {string} guildId
 * @returns {Promise<object>}
 */
async function getChatGPTConfig(guildId) {
  const filePath = await ensureGuildJSON(guildId);
  const config = await readJSON(filePath);
  return config.chatgpt || {};
}

/**
 * ChatGPT設定を保存
 * @param {string} guildId
 * @param {object} chatgptConfig
 * @returns {Promise<void>}
 */
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
