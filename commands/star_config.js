const {
  SlashCommandBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot設定')
    .setDescription('管理者ロールの設定を行います'),

  async execute(interaction) {
    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId('set_admin_roles')
      .setPlaceholder('管理者ロールを選択')
      .setMinValues(1)
      .setMaxValues(5);

    const row = new ActionRowBuilder().addComponents(roleSelect);

    await interaction.reply({
      content: '管理者として許可するロールを選択してください：',
      components: [row],
      ephemeral: true
    });
  }
};
