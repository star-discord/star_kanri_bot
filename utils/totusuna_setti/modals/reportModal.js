// utils/totusuna_setti/modals/reportModal.js
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { writeCsvRow } = require('../../spreadsheetHandler');
const { InteractionResponseFlags } = require('discord.js');

module.exports = {
  customIdStart: 'totusuna_modal:', // ← UUID対応のためコロン形式に変更

  /**
   * 凸スナ報告モーダル送信後処理
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const username = interaction.user.username;
    const now = dayjs();
    const timestamp = now.format('YYYY-MM-DD HH:mm:ss');
    const ym = now.format('YYYY-MM');

    // UUIDを抽出
    const uuid = interaction.customId.replace(this.customIdStart, '');

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
      .map((t, i) => `卓${i + 1}: ${t}`)
      .join('\n');

    const report = `📝 **凸スナ報告**\n組: ${group}組\n名: ${name}名\n${tableText ? `${tableText}\n` : ''}詳細: ${detail || 'なし'}`;

    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '⚠ 設定ファイルが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const instance = (json.totusuna?.instances || []).find(i => i.id === uuid);

    if (!instance) {
      return await interaction.reply({
        content: '⚠ 対応する凸スナ設置情報が見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    try {
      const targetChannel = await interaction.client.channels.fetch(instance.installChannelId);
      if (targetChannel?.isTextBased()) {
        await targetChannel.send({ content: report });
      } else {
        console.warn(`[reportModal] テキストチャンネルでない: ${instance.installChannelId}`);
      }
    } catch (err) {
      console.error(`[reportModal] チャンネル送信失敗:`, err);
    }

    const csvPath = path.join(__dirname, '../../../data', guildId, `${guildId}-${ym}-凸スナ報告.csv`);
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

    await interaction.reply({
      content: '✅ 報告を送信し、記録しました。',
      flags: InteractionResponseFlags.Ephemeral,
    });
  },
};
