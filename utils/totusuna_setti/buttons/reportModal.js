// utils/totusuna_setti/modals/reportModal.js
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { writeCsvRow } = require('../../spreadsheetHandler');

module.exports = {
  async handle(interaction) {
    const guildId = interaction.guildId;
    const username = interaction.user.username;
    const now = dayjs();
    const timestamp = now.format('YYYY-MM-DD HH:mm:ss');
    const ym = now.format('YYYY-MM');

    const group = interaction.fields.getTextInputValue('group');
    const name = interaction.fields.getTextInputValue('name');
    const table1 = interaction.fields.getTextInputValue('table1') || '';
    const table2 = interaction.fields.getTextInputValue('table2') || '';
    const table3 = interaction.fields.getTextInputValue('table3') || '';
    const table4 = interaction.fields.getTextInputValue('table4') || '';
    const detail = interaction.fields.getTextInputValue('detail') || '';

    const tableText = [table1, table2, table3, table4].filter(t => t).map((t, i) => `卓${i + 1}: ${t}`).join('\n');
    const report = `📝 **凸スナ報告**\n組: ${group}組\n名: ${name}名\n${tableText ? `${tableText}\n` : ''}詳細: ${detail}`;

    // チャンネル送信（設置チャンネルにのみ送信）
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(dataPath)) {
      return interaction.reply({ content: '⚠ 設定ファイルが見つかりません。', ephemeral: true });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const install = Object.values(json.totsusuna || {}).find(v => v && v.installChannelId);

    if (!install) {
      return interaction.reply({ content: '⚠ 凸スナ設置チャンネルが未設定です。', ephemeral: true });
    }

    const targetChannel = await interaction.client.channels.fetch(install.installChannelId);
    if (targetChannel) {
      await targetChannel.send({ content: report });
    }

    // CSV書き込み
    const csvPath = path.join(__dirname, '../../../data', guildId, `${guildId}-${ym}-凸スナ報告.csv`);
    await writeCsvRow(csvPath, [timestamp, group, name, table1, table2, table3, table4, detail, username]);

    await interaction.reply({ content: '✅ 報告を送信し、記録しました。', ephemeral: true });
  }
};
