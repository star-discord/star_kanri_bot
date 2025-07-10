// commands/star_config.js
const { SlashCommandBuilder } = require('discord.js');
const { readJSON, writeJSON, ensureGuildJSON } = require('../utils/fileHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot設定')
    .setDescription('管理者用の設定を行います')
    .addRoleOption(option =>
      option.setName('管理者ロール')
        .setDescription('管理者権限を与えるロールを指定します')
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const role = interaction.options.getRole('管理者ロール');

    // ギルド設定ファイルの確保と読み込み
    const filePath = ensureGuildJSON(guildId);
    const data = readJSON(filePath);

    // star_config セクションがなければ初期化
    if (!data.star_config) data.star_config = {};

    // 同じロールがすでに設定されていた場合の通知（任意）
    if (data.star_config.adminRoleId === role.id) {
      return await interaction.reply({
        content: `⚠️ 既に <@&${role.id}> は管理者ロールに設定されています。`,
        flags: 1 << 6 // Ephemeral 相当
      });
    }

    // 管理者ロールIDの設定
    data.star_config.adminRoleId = role.id;

    // 保存
    writeJSON(filePath, data);

    // ログ出力
    console.log(`🛠️ ${interaction.guild.name} (${guildId}) の管理者ロールを ${role.name} に設定`);

    // 応答（flags で ephemeral）
    await interaction.reply({
      content: `✅ 管理者ロールを <@&${role.id}> に設定しました。`,
      flags: 1 << 6
    });
  }
};
