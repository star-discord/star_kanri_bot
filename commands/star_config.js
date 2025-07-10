// 1. commands/star_config.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
  PermissionsBitField,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot設定')
    .setDescription('管理者ロールの設定を行います'),

  async execute(interaction) {
    // パーミッションチェック（サーバー管理者のみ許可）
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return await interaction.reply({
        content: '⚠️ このコマンドは管理者のみ実行できます。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId('set_admin_roles')
      .setPlaceholder('管理者ロールを選択してください')
      .setMinValues(1)
      .setMaxValues(5); // 最大5個まで選択可能

    const row = new ActionRowBuilder().addComponents(roleSelect);

    await interaction.reply({
      content: '🛠️ 管理者として許可するロールを選択してください：',
      components: [row],
      flags: InteractionResponseFlags.Ephemeral,
    });
  }
};
