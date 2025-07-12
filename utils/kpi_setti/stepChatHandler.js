const path = require('path');
const { ensureDirectory, writeJSON, readJSON } = require('../fileHelper');

const activeTargetSessions = new Map(); // KPI目標設定用
const activeReportSessions = new Map(); // KPI実績申請用

const targetQuestions = [
  { key: 'start_date', text: '開始日を入力してください（例: 2025/07/13）' },
  { key: 'end_date', text: '終了日を入力してください（例: 2025/07/18）' },
  { key: 'visitors', text: '来客数目標を入力してください（※数字のみ）' },
  { key: 'shimei_count', text: '指名本数目標を入力してください（※数字のみ）' },
  { key: 'shimei_sales', text: '指名売上目標を入力してください（※数字のみ）' },
  { key: 'free_sales', text: 'フリー売上目標を入力してください（※数字のみ）' },
  { key: 'total_sales', text: '純売上目標を入力してください（※数字のみ）' },
];

const reportQuestions = [
  { key: 'date', text: '報告する日付を入力してください（例: 2025/07/13）' },
  { key: 'visitors', text: '来客数を入力してください（※数字のみ）' },
  { key: 'shimei_count', text: '指名本数を入力してください（※数字のみ）' },
  { key: 'shimei_sales', text: '指名売上を入力してください（※数字のみ）' },
  { key: 'free_sales', text: 'フリー売上を入力してください（※数字のみ）' },
  { key: 'total_sales', text: '純売上を入力してください（※数字のみ）' },
];

// 全角数字→半角数字変換関数
function toHalfWidth(str) {
  return str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
}

/**
 * KPI目標データを保存する関数
 * @param {string} guildId 
 * @param {object} data 
 */
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

/**
 * KPI申請（実績入力）を保存し目標と比較してログを返す関数
 * @param {string} guildId 
 * @param {object} data 
 */
async function saveKpiReport(guildId, data) {
  // KPIファイル名は目標設定期間から決定
  // ここは簡易的にdata.dateの年と月から想定ファイル名を作成（運用に合わせて調整要）
  const reportDate = new Date(data.date);
  const year = reportDate.getFullYear();
  const month = (reportDate.getMonth() + 1).toString().padStart(2, '0');
  const day = reportDate.getDate();

  // 例：KPI_2025_0713-18.jsonのような形式ファイル名は動的に検索する必要があるが
  // ここでは単純に KIPI_2025_07.json などを想定。運用に合わせて変更してください。
  // もし複数期間あるなら該当期間ファイルを検索する処理を実装してください。

  // ここでは仮に「KPI_2025_07.json」形式ファイルを使用
  const dataDir = path.join(__dirname, `../../data/${guildId}`);

  // 例としてディレクトリ内ファイルを検索し、報告日が期間内のファイルを探す簡易実装
  const fs = require('fs').promises;
  const files = await fs.readdir(dataDir);
  let targetFile = null;

  for (const file of files) {
    if (!file.startsWith('KPI_')) continue;
    const fullPath = path.join(dataDir, file);
    try {
      const json = await readJSON(fullPath);
      if (!json || !json.期間) continue;
      const start = new Date(json.期間.開始日);
      const end = new Date(json.期間.終了日);
      if (reportDate >= start && reportDate <= end) {
        targetFile = fullPath;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!targetFile) {
    throw new Error('該当するKPI目標設定ファイルが見つかりません。');
  }

  const kpiData = await readJSON(targetFile);

  // 実績データを更新
  const dateKey = data.date.replace(/-/g, '/');
  if (!kpiData.実績[dateKey]) {
    kpiData.実績[dateKey] = {
      '来客数': 0,
      '指名本数': 0,
      '指名売上': 0,
      'フリー売上': 0,
      '純売上': 0,
    };
  }

  kpiData.実績[dateKey]['来客数'] = data.visitors;
  kpiData.実績[dateKey]['指名本数'] = data.shimei_count;
  kpiData.実績[dateKey]['指名売上'] = data.shimei_sales;
  kpiData.実績[dateKey]['フリー売上'] = data.free_sales;
  kpiData.実績[dateKey]['純売上'] = data.total_sales;

  await writeJSON(targetFile, kpiData);

  // 目標と比較してログ文字列を作成
  const goal = kpiData.目標;
  const periodStart = new Date(kpiData.期間.開始日);
  const periodEnd = new Date(kpiData.期間.終了日);
  const periodDays = Math.floor((periodEnd - periodStart) / (1000*60*60*24)) + 1;

  const daysPassed = Math.floor((reportDate - periodStart) / (1000*60*60*24)) + 1;
  const progressPercent = (daysPassed / periodDays) * 100;

  function checkMark(val, goalVal) {
    return val >= goalVal ? '✅' : '❌';
  }

  const formatPercent = (val, goalVal) => {
    if (goalVal === 0) return '100.0%';
    return ((val / goalVal) * 100).toFixed(1) + '%';
  };

  const lines = [];
  lines.push(`${data.date} 進捗：${daysPassed}日間 / ${periodDays}日間 (${progressPercent.toFixed(1)}%)`);
  lines.push(`  • 来客数：${data.visitors} / ${goal['来客数']}人 (${formatPercent(data.visitors, goal['来客数'])}) ${checkMark(data.visitors, goal['来客数'])}`);
  lines.push(`  • 指名本数：${data.shimei_count}本 / ${goal['指名本数']}本 (${formatPercent(data.shimei_count, goal['指名本数'])}) ${checkMark(data.shimei_count, goal['指名本数'])}`);
  lines.push(`  • 指名売上：${data.shimei_sales}円 / ${goal['指名売上']}円 (${formatPercent(data.shimei_sales, goal['指名売上'])}) ${checkMark(data.shimei_sales, goal['指名売上'])}`);
  lines.push(`  • フリー売上：${data.free_sales}円 / ${goal['フリー売上']}円 (${formatPercent(data.free_sales, goal['フリー売上'])}) ${checkMark(data.free_sales, goal['フリー売上'])}`);
  lines.push(`  • 純売上：${data.total_sales}円 / ${goal['純売上']}円 (${formatPercent(data.total_sales, goal['純売上'])}) ${checkMark(data.total_sales, goal['純売上'])}`);

  return lines.join('\n');
}

/**
 * ステップチャット用メッセージハンドラ
 * KPI目標設定 or KPI申請のどちらかの対話を処理
 * @param {import('discord.js').Message} message
 */
async function handleStepChatMessage(message) {
  if (message.author.bot) return;

  const userId = message.author.id;

  let session, questions, isTarget;

  if (activeTargetSessions.has(userId)) {
    session = activeTargetSessions.get(userId);
    questions = targetQuestions;
    isTarget = true;
  } else if (activeReportSessions.has(userId)) {
    session = activeReportSessions.get(userId);
    questions = reportQuestions;
    isTarget = false;
  } else {
    return; // セッション無し
  }

  const currentStep = session.step;
  let input = message.content.trim();

  // 入力検証
  if (['start_date', 'end_date', 'date'].includes(questions[currentStep].key)) {
    if (!/\d{4}\/\d{2}\/\d{2}/.test(input)) {
      return message.channel.send('日付形式が正しくありません。YYYY/MM/DDの形式で入力してください。');
    }
  } else {
    input = toHalfWidth(input);
    if (isNaN(parseInt(input, 10))) {
      return message.channel.send('数値を入力してください（半角・全角数字どちらでも可）。');
    }
    input = parseInt(input, 10);
  }

  // 回答保存
  session.data[questions[currentStep].key] = input;
  session.step++;

  if (session.step >= questions.length) {
    if (isTarget) {
      activeTargetSessions.delete(userId);
      await saveKpiTarget(message.guildId, session.data);
      await message.channel.send('✅ KPI目標設定が完了しました！');
    } else {
      activeReportSessions.delete(userId);
      try {
        const logMsg = await saveKpiReport(message.guildId, session.data);
        await message.channel.send('✅ KPI申請（実績入力）が完了しました！\n' + '```' + logMsg + '```');
      } catch (err) {
        await message.channel.send('❌ KPI申請の保存に失敗しました：' + err.message);
      }
    }
  } else {
    await message.channel.send(questions[session.step].text);
  }
}

module.exports = {
  activeTargetSessions,
  activeReportSessions,
  handleStepChatMessage,
  saveKpiTarget,
  saveKpiReport,
};
