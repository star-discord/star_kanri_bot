const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナクイック設置')
    .setDescription('即時に凸スナ設置を行います（本文のみ）')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('quick_input_modal')
      .setTitle('クイック凸スナ本文入力');

    const input = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('本文（プレースホルダー）')
      .setPlaceholder('本文を入力してください')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);

    try {
      await interaction.showModal(modal);
    } catch (err) {
      console.error('❌ モーダル表示エラー:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ モーダルの表示に失敗しました。',
          flags: 1 << 6,
        });
      }
    }
  },
};
