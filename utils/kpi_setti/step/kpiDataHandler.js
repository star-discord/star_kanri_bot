// ファイル参�E: utils/kpi_setti/kpiDataHandler.js

const fs = require('fs/promises');
const path = require('path');

// KPI保存�Eのベ�EスチE��レクトリ
const baseDir = path.resolve(__dirname, '../../data');

/**
 * KPI目標を保存する * @param {string} guildId
 * @param {object} data
 *  data: {
 *    startDate: 'YYYY/MM/DD',
 *    endDate: 'YYYY/MM/DD',
 *    visitors: number,
 *    shimei_count: number,
 *    shimei_sales: number,
 *    free_sales: number,
 *    total_sales: number,
 *  }
 */
async function saveKpiTarget(guildId, data) {
  const { startDate, endDate } = data;
  const fileName = `KPI_${startDate.replace(/\//g, '')}-${endDate.replace(/\//g, '')}.json`;
  const dir = path.join(baseDir, guildId);
  const filePath = path.join(dir, fileName);

  await fs.mkdir(dir, { recursive: true });

  // 目標をトップレベルに保存  const targetData = {
    target: {
      startDate,
      endDate,
      visitors: data.visitors,
      shimei_count: data.shimei_count,
      shimei_sales: data.shimei_sales,
      free_sales: data.free_sales,
      total_sales: data.total_sales,
    },
    actual: {}, // 実績は空のオブジェクトとして初期化
  };

  await fs.writeFile(filePath, JSON.stringify(targetData, null, 2), 'utf8');
}

/**
 * KPI実績申請を保存し、E��捗ログを文字�Eで返す
 * @param {string} guildId
 * @param {object} data
 *  data: {
 *    date: 'YYYY/MM/DD',
 *    visitors: number,
 *    shimei_count: number,
 *    shimei_sales: number,
 *    free_sales: number,
 *    total_sales: number,
 *  }
 * @returns {Promise<string>} 進捗ログチE��スチE */
async function saveKpiReport(guildId, data) {
  const { date } = data;

  // チE��レクトリと対象ファイルの検索
  const dir = path.join(baseDir, guildId);
  const files = await fs.readdir(dir);

  // ファイル名形弁E KPI_YYYYMMDD-YYYYMMDD.json の中から
  // 申請日(date)が篁E��冁E��入るファイルを探ぁE  let targetFile = null;
  let targetRange = null;

  for (const file of files) {
    if (!file.startsWith('KPI_') || !file.endsWith('.json')) continue;

    const rangeStr = file.slice(4, -5); // YYYYMMDD-YYYYMMDD
    const [start, end] = rangeStr.split('-');
    const startDate = parseDateString(start);
    const endDate = parseDateString(end);
    const checkDate = parseDateString(date.replace(/\//g, ''));

    if (checkDate >= startDate && checkDate <= endDate) {
      targetFile = file;
      targetRange = { start: startDate, end: endDate };
      break;
    }
  }

  if (!targetFile) {
    throw new Error('申請日付が含まれているKPI目標ファイルが見つかりません。');
  }

  const filePath = path.join(dir, targetFile);
  const fileDataRaw = await fs.readFile(filePath, 'utf8');
  const fileData = JSON.parse(fileDataRaw);

  // 実績の保存  if (!fileData.actual) fileData.actual = {};
  fileData.actual[date] = {
    visitors: data.visitors,
    shimei_count: data.shimei_count,
    shimei_sales: data.shimei_sales,
    free_sales: data.free_sales,
    total_sales: data.total_sales,
  };

  await fs.writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf8');

  // 進捗ログの生�E
  const progressLog = generateProgressLog(fileData.target, fileData.actual);

  return progressLog;
}

/**
 * YYYYMMDD形式�E日付文字�EをDateオブジェクトに変換する
 * @param {string} yyyymmdd
 * @returns {Date}
 */
function parseDateString(yyyymmdd) {
  const year = Number(yyyymmdd.slice(0, 4));
  const month = Number(yyyymmdd.slice(4, 6)) - 1;
  const day = Number(yyyymmdd.slice(6, 8));
  return new Date(year, month, day);
}

/**
 * 進捗ログを生成すめE * @param {object} target
 * @param {object} actual
 * @returns {string}
 */
function generateProgressLog(target, actual) {
  const startDate = parseDateString(target.startDate.replace(/\//g, ''));
  const endDate = parseDateString(target.endDate.replace(/\//g, ''));
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  // 実績の日付頁E��並べ替ぁE  const actualDates = Object.keys(actual).sort();

  const logs = actualDates.map((dateStr) => {
    const actualDate = parseDateString(dateStr.replace(/\//g, ''));
    const dayCount = Math.floor((actualDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const progressPercent = (dayCount / totalDays) * 100;

    const act = actual[dateStr];
    const tgt = target;

    function formatRatio(actualVal, targetVal, unit = '') {
      const ratio = targetVal === 0 ? 0 : (actualVal / targetVal) * 100;
      const mark = ratio >= 100 ? '✅' : '❌';
      return `${actualVal}${unit} / ${targetVal}${unit} (${ratio.toFixed(1)}%) ${mark}`;
    }

    return `${dateStr}
期間進捗！E{dayCount}日閁E/ ${totalDays}日間！E{progressPercent.toFixed(1)}%�E�E  ・来客数�E�E{formatRatio(act.visitors, tgt.visitors, '人')}
  ・持E��本数�E�E{formatRatio(act.shimei_count, tgt.shimei_count, '本')}
  ・持E��売上！E{formatRatio(act.shimei_sales, tgt.shimei_sales, '冁E)}
  ・フリー売上！E{formatRatio(act.free_sales, tgt.free_sales, '冁E)}
  ・総売上！E{formatRatio(act.total_sales, tgt.total_sales, '冁E)}
`;
  });

  return logs.join('\n');
}

module.exports = {
  saveKpiTarget,
  saveKpiReport,
};
