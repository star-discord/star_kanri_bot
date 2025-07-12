// 繝輔ぃ繧､繝ｫ蜿ら・: utils/kpi_setti/kpiDataHandler.js

const fs = require('fs/promises');
const path = require('path');

// KPI菫晏ｭ伜・縺ｮ繝吶・繧ｹ繝・ぅ繝ｬ繧ｯ繝医Μ
const baseDir = path.resolve(__dirname, '../../data');

/**
 * KPI逶ｮ讓吶ｒ菫晏ｭ倥☆繧・ * @param {string} guildId
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

  // 逶ｮ讓吶・繝医ャ繝励Ξ繝吶Ν縺ｫ菫晏ｭ・  const targetData = {
    target: {
      startDate,
      endDate,
      visitors: data.visitors,
      shimei_count: data.shimei_count,
      shimei_sales: data.shimei_sales,
      free_sales: data.free_sales,
      total_sales: data.total_sales,
    },
    actual: {}, // 螳溽ｸｾ縺ｯ遨ｺ縺ｮ繧ｪ繝悶ず繧ｧ繧ｯ繝医→縺励※蛻晄悄蛹・  };

  await fs.writeFile(filePath, JSON.stringify(targetData, null, 2), 'utf8');
}

/**
 * KPI螳溽ｸｾ逕ｳ隲九ｒ菫晏ｭ倥＠縲・ｲ謐励Ο繧ｰ繧呈枚蟄怜・縺ｧ霑斐☆
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
 * @returns {Promise<string>} 騾ｲ謐励Ο繧ｰ繝・く繧ｹ繝・ */
async function saveKpiReport(guildId, data) {
  const { date } = data;

  // 繝・ぅ繝ｬ繧ｯ繝医Μ縺ｨ蟇ｾ雎｡繝輔ぃ繧､繝ｫ縺ｮ讀懃ｴ｢
  const dir = path.join(baseDir, guildId);
  const files = await fs.readdir(dir);

  // 繝輔ぃ繧､繝ｫ蜷榊ｽ｢蠑・ KPI_YYYYMMDD-YYYYMMDD.json 縺ｮ荳ｭ縺九ｉ
  // 逕ｳ隲区律(date)縺檎ｯ・峇蜀・↓蜈･繧九ヵ繧｡繧､繝ｫ繧呈爾縺・  let targetFile = null;
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
    throw new Error('逕ｳ隲区律莉倥′遽・峇蜀・↓縺ゅｋKPI逶ｮ讓吶ヵ繧｡繧､繝ｫ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・);
  }

  const filePath = path.join(dir, targetFile);
  const fileDataRaw = await fs.readFile(filePath, 'utf8');
  const fileData = JSON.parse(fileDataRaw);

  // 螳溽ｸｾ縺ｮ菫晏ｭ・  if (!fileData.actual) fileData.actual = {};
  fileData.actual[date] = {
    visitors: data.visitors,
    shimei_count: data.shimei_count,
    shimei_sales: data.shimei_sales,
    free_sales: data.free_sales,
    total_sales: data.total_sales,
  };

  await fs.writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf8');

  // 騾ｲ謐励Ο繧ｰ縺ｮ逕滓・
  const progressLog = generateProgressLog(fileData.target, fileData.actual);

  return progressLog;
}

/**
 * YYYYMMDD蠖｢蠑上・譌･莉俶枚蟄怜・繧奪ate繧ｪ繝悶ず繧ｧ繧ｯ繝医↓螟画鋤縺吶ｋ
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
 * 騾ｲ謐励Ο繧ｰ繧堤函謌舌☆繧・ * @param {object} target
 * @param {object} actual
 * @returns {string}
 */
function generateProgressLog(target, actual) {
  const startDate = parseDateString(target.startDate.replace(/\//g, ''));
  const endDate = parseDateString(target.endDate.replace(/\//g, ''));
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  // 螳溽ｸｾ縺ｮ譌･莉倬・↓荳ｦ縺ｹ譖ｿ縺・  const actualDates = Object.keys(actual).sort();

  const logs = actualDates.map((dateStr) => {
    const actualDate = parseDateString(dateStr.replace(/\//g, ''));
    const dayCount = Math.floor((actualDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const progressPercent = (dayCount / totalDays) * 100;

    const act = actual[dateStr];
    const tgt = target;

    function formatRatio(actualVal, targetVal, unit = '') {
      const ratio = targetVal === 0 ? 0 : (actualVal / targetVal) * 100;
      const mark = ratio >= 100 ? '笨・ : '笶・;
      return `${actualVal}${unit} / ${targetVal}${unit} (${ratio.toFixed(1)}%) ${mark}`;
    }

    return `${dateStr}
譛滄俣騾ｲ謐暦ｼ・{dayCount}譌･髢・/ ${totalDays}譌･髢難ｼ・{progressPercent.toFixed(1)}%・・  繝ｻ譚･螳｢謨ｰ・・{formatRatio(act.visitors, tgt.visitors, '莠ｺ')}
  繝ｻ謖・錐譛ｬ謨ｰ・・{formatRatio(act.shimei_count, tgt.shimei_count, '譛ｬ')}
  繝ｻ謖・錐螢ｲ荳奇ｼ・{formatRatio(act.shimei_sales, tgt.shimei_sales, '蜀・)}
  繝ｻ繝輔Μ繝ｼ螢ｲ荳奇ｼ・{formatRatio(act.free_sales, tgt.free_sales, '蜀・)}
  繝ｻ邱丞｣ｲ荳奇ｼ・{formatRatio(act.total_sales, tgt.total_sales, '蜀・)}
`;
  });

  return logs.join('\n');
}

module.exports = {
  saveKpiTarget,
  saveKpiReport,
};
