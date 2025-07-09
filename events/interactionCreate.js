// events/interactionCreate.js
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const { sendToMultipleChannels } = require('../utils/sendToMultipleChannels');
const config = require('../config.json');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // 1. スラッシュコマンド処理
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: '❌ コマンド実行中にエラーが発生しました。',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: '❌ コマンド実行中にエラーが発生しました。',
            ephemeral: true,
          });
        }
      }
    }

    // 2. ボタン押下時「凸スナ報告」→ モーダル表示
    if (interaction.isButton() && interaction.customId === 'tousuna_report_button') {
      const modal = new ModalBuilder()
        .setCustomId('tousuna_modal')
        .setTitle('凸スナ報告');

      const groupInput = new TextInputBuilder()
        .setCustomId('group')
        .setLabel('組（例: 3）')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const nameInput = new TextInputBuilder()
        .setCustomId('name')
        .setLabel('名（例: 15）')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const detailInput = new TextInputBuilder()
        .setCustomId('detail')
        .setLabel('詳細（任意）')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

      const row1 = new ActionRowBuilder().addComponents(groupInput);
      const row2 = new ActionRowBuilder().addComponents(nameInput);
      const row3 = new ActionRowBuilder().addComponents(detailInput);

      await interaction.showModal(modal.addComponents(row1, row2, row3));
    }

    // 3. モーダル送信後 → 複数チャンネルに報告送信
    if (interaction.isModalSubmit() && interaction.customId === 'tousuna_modal') {
      const group = interaction.fields.getTextInputValue('group');
      const name = interaction.fields.getTextInputValue('name');
      const detail = interaction.fields.getTextInputValue('detail') || '(なし)';

      const groupCount = parseInt(group, 10);
      const tableText = Array.from({ length: groupCount }, (_, i) => `- ${i + 1}組目卓：`).join('\n');

      const report = `📝 **凸スナ報告**\n` +
        `組: ${group}組\n名: ${name}名\n詳細: ${detail}\n卓:\n${tableText}`;

      await sendToMultipleChannels(client, config.tousunaReportChannels, report);

      await interaction.reply({ content: '✅ 報告を送信しました！', ephemeral: true });
    }
  },
};
