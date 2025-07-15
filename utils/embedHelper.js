// utils/embedHelper.js
const { EmbedBuilder } = require('discord.js');

const COLORS = {
  PRIMARY: 0x0099ff,
  SUCCESS: 0x00AE86,
  ERROR: 0xff0000,
  WARNING: 0xFEE75C,
};

/**
 * 標準的なフッターとタイムスタンプを持つ基本的なEmbedを作成します。
 * @param {import('discord.js').EmbedBuilderOptions} options - Embedのオプション
 * @returns {EmbedBuilder}
 */
function createBaseEmbed(options) {
  const { footer = { text: 'STAR管理bot' }, ...rest } = options;
  return new EmbedBuilder(rest)
    .setFooter(footer)
    .setTimestamp();
}

/**
 * 管理者専用UIのEmbedを作成します。
 * @param {string} title - Embedのタイトル
 * @param {string} description - Embedの説明
 * @returns {EmbedBuilder}
 */
function createAdminEmbed(title, description) {
  return createBaseEmbed({
    title: `🔒 ${title} (管理者専用)`,
    description,
    color: COLORS.PRIMARY,
  });
}

/**
 * 権限が不足していることを示すEmbedを作成します。
 * @returns {EmbedBuilder}
 */
function createAdminRejectEmbed() {
  return createBaseEmbed({
    title: '❌ 権限がありません',
    description: 'この操作を実行するには、管理者権限または指定された管理者ロールが必要です。',
    color: COLORS.ERROR,
  });
}

/**
 * 成功メッセージ用のEmbedを作成します。
 * @param {string} title - 成功メッセージのタイトル
 * @param {string} description - 成功メッセージの詳細
 * @returns {EmbedBuilder}
 */
function createSuccessEmbed(title, description) {
  return createBaseEmbed({
    title: `✅ ${title}`,
    description,
    color: COLORS.SUCCESS,
  });
}

/**
 * エラーメッセージ用のEmbedを作成します。
 * @param {string} title - エラーメッセージのタイトル
 * @param {string} description - エラーメッセージの詳細
 * @returns {EmbedBuilder}
 */
function createErrorEmbed(title, description) {
  return createBaseEmbed({
    title: `❌ ${title}`,
    description,
    color: COLORS.ERROR,
  });
}

/**
 * 警告メッセージ用のEmbedを作成します。
 * @param {string} title - 警告メッセージのタイトル
 * @param {string} description - 警告メッセージの詳細
 * @returns {EmbedBuilder}
 */
function createWarningEmbed(title, description) {
  return createBaseEmbed({
    title: `⚠️ ${title}`,
    description,
    color: COLORS.WARNING,
  });
}

module.exports = {
  COLORS,
  createBaseEmbed,
  createAdminEmbed,
  createAdminRejectEmbed,
  createSuccessEmbed,
  createErrorEmbed,
  createWarningEmbed,
};
