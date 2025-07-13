// utils/embedHelper.js
const { EmbedBuilder } = require('discord.js');

// 既存 管理者専用UIのEmbed
function createAdminEmbed(title, description, color = 0x0099ff) {
  return new EmbedBuilder()
    .setTitle(`${title} 🔒 管理者専用`)
    .setDescription(description)
    .setColor(color);
}

// 新規追加: 権限エラー用Embed
function createAdminRejectEmbed() {
  return new EmbedBuilder()
    .setTitle('❌ 管理者権限が必要です')
    .setDescription('このコマンドは **管理者ロールに登録されたユーザーのみ** 使用できます。')
    .setColor(0xff0000);
}

module.exports = {
  createAdminEmbed,
  createAdminRejectEmbed
};
