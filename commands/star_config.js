// commands/star_config.js
const { SlashCommandBuilder, ActionRowBuilder, RoleSelectMenuBuilder } = require('discord.js');
const { ensureGuildJSON, readJSON, writeJSON } = require('../utils/fileHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot設定')
    .setDescription('管理者用の設定を行います'),

  async execute(interaction) {
    const guildId = interaction.guild.id;

    // UIとしてロール選択メニュー表示
    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId('star_config_select_admin_roles')
      .setPlaceholder('👑 管理者ロールを選択してください（複数可）')
      .setMinValues(1)
      .setMaxValues(5); // 任意の最大数

    const row = new ActionRowBuilder().addComponents(roleSelect);

    await interaction.reply({
      content: '🔧 管理者として許可するロールを選択してください。',
      components: [row],
      ephemeral: true,
    });
  }
};
