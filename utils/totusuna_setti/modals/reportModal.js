const path = require('path');
const dayjs = require('dayjs');
const { writeCsvRow } = require('../../spreadsheetHandler');
const { MessageFlagsBitField } = require('discord.js');
const { configManager } = require('../../configManager');

module.exports = {
  customIdStart: 'totusuna_modal:',

  /**
   * 凸スナ報告モーダル送信後の処理
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

    const guildId = interaction.guildId;
    const username = interaction.user.username;
    const now = dayjs();
    const timestamp = now.format('YYYY-MM-DD HH:mm:ss');
    const ym = now.format('YYYY-MM');

    const uuid = interaction.customId.replace(this.customIdStart, '');

    try {
      // 入力値取得
      const group = interaction.fields.getTextInputValue('group');
      const name = interaction.fields.getTextInputValue('name');
      const table1 = interaction.fields.getTextInputValue('table1') || '';
      const table2 = interaction.fields.getTextInputValue('table2') || '';
      const table3 = interaction.fields.getTextInputValue('table3') || '';
      const table4 = interaction.fields.getTextInputValue('table4') || '';
      const detail = interaction.fields.getTextInputValue('detail') || '';

      const tableText = [table1, table2, table3, table4]
        .filter(t => t)
        .map((t, i) => `・項目${i + 1}: ${t}`)
        .join('\n');
      const report = `📝 **凸スナ報告**\n組数: ${group}組\n名前: ${name}名\n${tableText ? `${tableText}\n` : ''}詳細: ${detail || 'なし'}`;

      const instance = await configManager.getTotusunaInstance(guildId, uuid);
      if (!instance) {
        return await interaction.editReply({ content: '⚠️ 対応する凸スナ設置データが見つかりません。' });
      }

      try {
        const targetChannel = await interaction.client.channels.fetch(instance.installChannelId);
        if (targetChannel?.isTextBased()) {
          await targetChannel.send({ content: report });
        } else {
          console.warn(`[reportModal] テキストチャンネルではありません: ${instance.installChannelId}`);
        }
      } catch (err) {
        console.error(`[reportModal] チャンネル送信失敗:`, err);
      }

      const csvPath = path.join(__dirname, '../../../data', guildId, `${guildId}-${ym}-凸スナ報告.csv`);
      try {
        await writeCsvRow(csvPath, [
          timestamp,
          group,
          name,
          table1,
          table2,
          table3,
          table4,
          detail,
          username,
        ]);
      } catch (err) {
        console.error('[reportModal] CSV書き込み失敗:', err);
        // This is a non-fatal error, so we just log it and continue.
      }

      await interaction.editReply({ content: '✅ 報告を送信し、記録しました。' });
    } catch (error) {
      console.error(`[reportModal] 処理中エラー (uuid: ${uuid}):`, error);
      if (interaction.deferred) {
        await interaction.editReply({ content: '❌ 凸スナ報告処理中にエラーが発生しました。' });
      }
    }
  },
};
