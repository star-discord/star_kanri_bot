const activeSessions = new Map(); // userId -> { step: number, data: {} }

const questions = [
  { key: 'start_date', text: '開始日を入力してください（例: 2025/07/13）' },
  { key: 'end_date', text: '終了日を入力してください（例: 2025/07/18）' },
  { key: 'visitors', text: '来客数目標を入力してください（※数字のみ）' },
  { key: 'shimei_count', text: '指名本数目標を入力してください（※数字のみ）' },
  { key: 'shimei_sales', text: '指名売上目標を入力してください（※数字のみ）' },
  { key: 'free_sales', text: 'フリー売上目標を入力してください（※数字のみ）' },
  { key: 'total_sales', text: '純売上目標を入力してください（※数字のみ）' },
];

// 全角数字→半角数字変換関数
function toHalfWidth(str) {
  return str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
}

/**
 * ステップチャット用メッセージハンドラ
 * @param {import('discord.js').Message} message
 */
async function handleStepChatMessage(message) {
  if (message.author.bot) return;

  const userId = message.author.id;
  if (!activeSessions.has(userId)) return; // セッション無ければ無視

  const session = activeSessions.get(userId);
  const currentStep = session.step;

  let input = message.content.trim();

  // 日付入力ステップ（0,1）
  if (currentStep === 0 || currentStep === 1) {
    if (!/\d{4}\/\d{2}\/\d{2}/.test(input)) {
      return message.channel.send('日付形式が正しくありません。YYYY/MM/DDの形式で入力してください。');
    }
  } else {
    // 数値ステップは全角数字を半角に変換してからチェック
    input = toHalfWidth(input);
    if (isNaN(parseInt(input, 10))) {
      return message.channel.send('数値を入力してください（半角・全角数字どちらでも可）。');
    }
    input = parseInt(input, 10);
  }

  // 回答を保存
  session.data[questions[currentStep].key] = input;
  session.step++;

  if (session.step >= questions.length) {
    activeSessions.delete(userId);

    // ここで保存処理を呼ぶ例（外部モジュール等に差し替え可能）
    await saveKpiTarget(message.guildId, session.data);

    await message.channel.send('✅ KPI目標設定が完了しました！');

  } else {
    // 次の質問を送る
    await message.channel.send(questions[session.step].text);
  }
}

/**
 * KPI目標をファイルに保存する仮の関数（実装例）
 * @param {string} guildId 
 * @param {object} data 
 */
const path = require('path');
const { ensureDirectory, writeJSON } = require('../fileHelper');

async function saveKpiTarget(guildId, data) {
  const startFormatted = data.start_date.replace(/\//g, '_');
  const endDay = new Date(data.end_date).getDate();
  const fileName = `KPI_${startFormatted}-${endDay}.json`;
  const dataDir = path.join(__dirname, `../../data/${guildId}`);
  await ensureDirectory(dataDir);
  const filePath = path.join(dataDir, fileName);

  // 実績初期化
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  const actual = {};
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split('T')[0].replace(/-/g, '/');
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
      開始日: data.start_date,
      終了日: data.end_date,
    },
    目標: {
      '来客数': data.visitors,
      '指名本数': data.shimei_count,
      '指名売上': data.shimei_sales,
      'フリー売上': data.free_sales,
      '純売上': data.total_sales,
    },
    実績: actual
  };

  await writeJSON(filePath, saveData);
}

module.exports = {
  activeSessions,
  handleStepChatMessage,
};
