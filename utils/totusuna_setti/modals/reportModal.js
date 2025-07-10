const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { writeCsvRow } = require('../../spreadsheetHandler');
const { InteractionResponseFlags } = require('discord.js');

module.exports = {
  customIdStart: 'tousuna_modal_', // ← 追加（tousuna_report_button_ → tousuna_modal_）

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

    const report = `📝 **凸スナ報告**
組: ${group}組
名: ${name}名
${tableText ? `${tableText}\n` : ''}詳細: ${detail || 'なし'}`;

    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '⚠ 設定ファイルが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const install = Object.values(json.tousuna?.instances || {}).find(v => v?.installChannelId);

    if (!install) {
      return await interaction.reply({
        content: '⚠ 凸スナ設置チャンネルが未設定です。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    try {
      const targetChannel = await interaction.client.channels.fetch(install.installChannelId);
      if (targetChannel?.isTextBased()) {
        await targetChannel.send({ content: report });
      } else {
        console.warn(`[reportModal] テキストチャンネルでない: ${install.installChannelId}`);
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
