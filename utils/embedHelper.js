// utils/embedHelper.js
const { EmbedBuilder } = require('discord.js');

// 既孁E 管琁E��E��用UIのEmbed
function createAdminEmbed(title, description, color = 0x0099ff) {
  return new EmbedBuilder()
    .setTitle(`${title} 🔒 管琁E��E��用`)
    .setDescription(description)
    .setColor(color);
}

// ✁E新規追加: 権限エラー用Embed
function createAdminRejectEmbed() {
  return new EmbedBuilder()
    .setTitle('❁E管琁E��E��限が忁E��でぁE)
    .setDescription('こ�Eコマンド�E **管琁E��E��ールに登録されたユーザーのみ** 使用できます、E)
    .setColor(0xff0000);
}

module.exports = {
  createAdminEmbed,
  createAdminRejectEmbed
};
