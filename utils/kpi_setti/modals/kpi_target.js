const path = require('path');
const fs = require('fs');
const { readJSON, writeJSON, ensureDirectory } = require('../../fileHelper');

/**
 * KPI目標設定モーダルの処理
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
module.exports = async (interaction) => {
  const guildId = interaction.guildId;
  const start = interaction.fields.getTextInputValue('start_date'); // 例: 2025/07/13
  const end = interaction.fields.getTextInputValue('end_date');     // 例: 2025/07/18
  const getNumber = (id) => parseInt(interaction.fields.getTextInputValue(id), 10) || 0;

  const goals = {
    '来客数': getNumber('visitors'),
    '指名本数': getNumber('shimei_count'),
    '指名売上': getNumber('shimei_sales'),
    'フリー売上': getNumber('free_sales'),
    '純売上': getNumber('total_sales'),
  };

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
    return await interaction.reply({
      content: '⚠️ 日付の形式が正しくないか、開始日が終了日より後になっています。',
      ephemeral: true,
    });
  }

  // ファイル名生成：KPI_YYYY_MM_DD-日.json 形式
  const startFormatted = start.replace(/\//g, '_'); // "2025/07/13" → "2025_07_13"
  const endDay = endDate.getDate();                  // 18
  const fileName = `KPI_${startFormatted}-${endDay}.json`;

  const dataDir = path.join(__dirname, `../../data/${guildId}`);
  await ensureDirectory(dataDir);

  const filePath = path.join(dataDir, fileName);

  // 実績データの初期化（期間内の各日付に0でセット）
  const actual = {};
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split('T')[0].replace(/-/g, '/'); // "2025/07/13"
    actual[key] = {
      '来客数': 0,
      '指名本数': 0,
      '指名売上': 0,
      'フリー売上': 0,
      '純売上': 0
    };
  }

  const saveData = {
    期間: {
      開始日: start,
      終了日: end,
    },
    目標: goals,
    実績: actual
  };

  await writeJSON(filePath, saveData);

  await interaction.reply({
    content: `✅ KPI目標を設定しました。\n期間：${start} ～ ${end}`,
    ephemeral: true
  });
};
