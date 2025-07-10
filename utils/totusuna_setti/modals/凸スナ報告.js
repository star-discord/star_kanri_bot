// utils/totusuna_setti/modals/凸スナ報告.js
const path = require('path');
const fs = require('fs');
const { writeToSheet } = require('../spreadSheet');

module.exports = async function handleTousunaReportModal(interaction) {
  const modalId = interaction.customId;
  const match = modalId.match(/^tousuna_modal_(.+)$/);
  if (!match) return;

  const instanceId = match[1];
  const guildId = interaction.guildId;
  const username = interaction.user.username;

  const group = interaction.fields.getTextInputValue('group');
  const name = interaction.fields.getTextInputValue('name');
  const table1 = interaction.fields.getTextInputValue('table1');
  const table2 = interaction.fields.getTextInputValue('table2');
  const table3 = interaction.fields.getTextInputValue('table3');
  const table4 = interaction.fields.getTextInputValue('table4');
  const detail = interaction.fields.getTextInputValue('detail') || '';

  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const dataPath = path.join(__dirname, `../../../data/${guildId}/${guildId}.json`);

  if (!fs.existsSync(dataPath)) {
    await interaction.reply({ content: '❌ 報告処理に失敗しました。(設定ファイル未存在)', flags: InteractionResponseFlags.Ephemeral });
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const instance = data?.tousuna?.instances?.find(i => i.id === instanceId);

  if (!instance) {
    await interaction.reply({ content: '❌ この設置は存在しません。', flags: InteractionResponseFlags.Ephemeral });
    return;
  }

  const entry = {
    date: now.toISOString(),
    group,
    name,
    table1,
    table2,
    table3,
    table4,
    detail,
    username,
  };

  await writeToSheet(guildId, yearMonth, entry);

  const tableText = [table1, table2, table3, table4]
    .filter(Boolean)
    .map((v, i) => `- 卓${i + 1}: ${v}`)
    .join('\n');

  const report = `📝 **凸スナ報告**\n組: ${group}組\n名: ${name}名\n卓:\n${tableText || '(なし)'}\n詳細: ${detail || '(なし)'}`;

  const messageChannel = await interaction.guild.channels.fetch(instance.messageChannelId);
  if (messageChannel) {
    await messageChannel.send({ content: report });
  }

  await interaction.reply({ content: '✅ 凸スナ報告を送信・保存しました！', flags: InteractionResponseFlags.Ephemeral });
};
