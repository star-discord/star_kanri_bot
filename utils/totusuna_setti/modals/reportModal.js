const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { writeCsvRow } = require('../../spreadsheetHandler');
const { MessageFlagsBitField } = require('discord.js');

module.exports = {
  customIdStart: 'totusuna_modal:',

  /**
   * 凸スナ報告モーダル送信後の処理
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
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

      // ファイルの存在確認と読み込み
      const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
      if (!fs.existsSync(dataPath)) {
        if (!interaction.replied && !interaction.deferred) {
          return await interaction.reply({
            content: '⚠️ 設定ファイルが見つかりません。',
            flags: MessageFlagsBitField.Ephemeral,
          });
        }
        return;
      }

      let json;
      try {
        json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      } catch (err) {
        console.error('[reportModal] JSONパース失敗:', err);
        if (!interaction.replied && !interaction.deferred) {
          return await interaction.reply({
            content: '❌ 設定ファイルの読み込みに失敗しました。',
            flags: MessageFlagsBitField.Ephemeral,
          });
        }
        return;
      }

      const instance = (json.totusuna?.instances || []).find(i => i.id === uuid);
      if (!instance) {
        if (!interaction.replied && !interaction.deferred) {
          return await interaction.reply({
            content: '⚠️ 対応する凸スナ設置データが見つかりません。',
            flags: MessageFlagsBitField.Ephemeral,
          });
        }
        return;
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
      }

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '✅ 報告を送信し、記録しました。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    } catch (error) {
      console.error('[reportModal] 処理中エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ 凸スナ報告処理中にエラーが発生しました。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    }
  },
};
