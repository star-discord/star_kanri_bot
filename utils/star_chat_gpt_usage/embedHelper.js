// utils/star_chat_gpt_usage/embedHelper.js

const { EmbedBuilder } = require('discord.js');

/**
 * 管理者向けメッセージ埋め込みを作成
 * @param {string} title
 * @param {string} description
 * @returns {EmbedBuilder}
 */
function createAdminEmbed(title, description) {
  return new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle(title)
    .setDescription(description);
}

/**
 * エラーメッセージ用埋め込みを作成
 * @param {string} title
 * @param {string} description
 * @returns {EmbedBuilder}
 */
function createErrorEmbed(title, description) {
  return new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle(title)
    .setDescription(description);
}

/**
 * 成功メッセージ用埋め込みを作成
 * @param {string} title
 * @param {string} description
 * @returns {EmbedBuilder}
 */
function createSuccessEmbed(title, description) {
  return new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle(title)
    .setDescription(description);
}

module.exports = {
  createAdminEmbed,
  createErrorEmbed,
  createSuccessEmbed,
};
