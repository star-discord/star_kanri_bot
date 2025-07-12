const path = require('path');
const fs = require('fs');
const { readJSON, writeJSON } = require('../../fileHelper');

/**
 * KPI数値入力モーダルの処理
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
module.exports = async (interaction) => {
  const guildId = interaction.guildId;
  const dataDir = path.join(__dirname, `../../data/${guildId}`);

  const date = interaction.fields.getTextInputValue('date'); // 例: 2025/07/13
  const getNumber = (id) => parseInt(interaction.fields.getTextInputValue(id), 10) || 0;

  const inputValues = {
    '来客数': getNumber('visitors'),
    '指名本数': getNumber('shimei_count'),
    '指名売上': getNumber('shimei_sales'),
    'フリー売上': getNumber('free_sales'),
    '純売上': getNumber('total_sales'),
  };

  // KPIファイル検索
  const files = fs.readdirSync(dataDir).filter(f => f.startsWith('KPI_') && f.endsWith('.json'));
  let matchedFile = null;
  let kpiData = null;

  for (const file of files) {
    const json = await readJSON(path.join(dataDir, file));
    const start = new Date(json.期間.開始日);
    const end = new Date(json.期間.終了日);
    const target = new Date(date);
    if (target >= start && target <= end) {
      matchedFile = file;
      kpiData = json;
      break;
    }
  }

  if (!matchedFile || !kpiData) {
    return await interaction.reply({
      content: `⚠️ 入力された日付（${date}）に対応するKPI目標が見つかりません。`,
      ephemeral: true,
    });
  }

  // 実績データを更新
  kpiData.実績[date] = inputValues;
  await writeJSON(path.join(dataDir, matchedFile), kpiData);

  // 進捗計算用
  const goals = kpiData.目標;
  const actual = inputValues;

  const fields = Object.keys(goals).map((key) => {
    const goal = goals[key];
    const value = actual[key];
    const percent = goal > 0 ? ((value / goal) * 100).toFixed(1) : '0';
    const isClear = value >= goal;
    return `• ${key}：${value} / ${goal}${key.includes('売上') ? '円' : (key.includes('本') ? '本' : '人')}（${percent}%）${isClear ? '✅' : '❌'}`;
  });

  // 期間進捗計算
  const start = new Date(kpiData.期間.開始日);
  const end = new Date(kpiData.期間.終了日);
  const now = new Date(date);
  const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const currentDay = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;

  const message = [
    `📅 ${date}`,
    `期間進捗：${currentDay}日目 / ${totalDays}日間（${((currentDay / totalDays) * 100).toFixed(1)}%）`,
    ...fields,
  ].join('\n');

  await interaction.reply({ content: message, ephemeral: true });
};
