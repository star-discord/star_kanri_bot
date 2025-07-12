// utils/spreadsheetHandler.js
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { uploadFile, downloadFile } = require('./storage'); // 笨・GCS騾｣謳ｺ逕ｨ

/**
 * GCS逕ｨ繝輔ぃ繧､繝ｫ繝代せ繧堤函謌撰ｼ井ｾ・ 1234567890123/1234567890123-2025-07-蜃ｸ繧ｹ繝雁ｱ蜻・xlsx・・ * @param {string} guildId
 * @param {string} suffix
 * @returns {string}
 */
function getGCSPath(guildId, suffix = '') {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `${guildId}/${guildId}-${ym}${suffix ? `-${suffix}` : ''}.xlsx`;
}

/**
 * 繝ｭ繝ｼ繧ｫ繝ｫ菫晏ｭ倥ヱ繧ｹ繧貞叙蠕暦ｼ亥ｭ伜惠縺励↑縺・ｴ蜷医・繝・ぅ繝ｬ繧ｯ繝医Μ菴懈・・・ * @param {string} guildId
 * @param {string} suffix
 * @returns {string}
 */
function getLocalSpreadsheetPath(guildId, suffix = '') {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const fileName = `${guildId}-${ym}${suffix ? `-${suffix}` : ''}.xlsx`;
  const dir = path.join(__dirname, '../data', guildId);

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return path.join(dir, fileName);
}

/**
 * 繝ｯ繝ｼ繧ｯ繝悶ャ繧ｯ繧定ｪｭ縺ｿ霎ｼ縺ｿ or 譁ｰ隕丈ｽ懈・・・CS蜷梧悄霎ｼ縺ｿ・・ * @param {string} guildId
 * @param {string} suffix
 * @param {string} sheetName
 * @returns {Promise<{ workbook: ExcelJS.Workbook, sheet: ExcelJS.Worksheet, localPath: string, gcsPath: string }>}
 */
async function loadOrCreateWorkbook(guildId, suffix = '', sheetName = '蝣ｱ蜻・) {
  const localPath = getLocalSpreadsheetPath(guildId, suffix);
  const gcsPath = getGCSPath(guildId, suffix);

  // GCS縺九ｉ譛譁ｰ繝輔ぃ繧､繝ｫ繧偵ム繧ｦ繝ｳ繝ｭ繝ｼ繝会ｼ亥ｭ伜惠縺励↑縺・ｴ蜷医・繧ｹ繧ｭ繝・・・・  await downloadFile(gcsPath, localPath);

  const workbook = new ExcelJS.Workbook();
  if (fs.existsSync(localPath)) {
    await workbook.xlsx.readFile(localPath);
  }

  let sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    sheet = workbook.addWorksheet(sheetName);
    sheet.addRow(['譌･譎・, '菴慕ｵ・, '菴募錐', '蜊・', '蜊・', '蜊・', '蜊・', '隧ｳ邏ｰ', '蜷榊燕']);
  }

  return { workbook, sheet, localPath, gcsPath };
}

/**
 * 菫晏ｭ伜ｾ後；CS縺ｫ繧｢繝・・繝ｭ繝ｼ繝峨＠縺ｦ蜷梧悄
 * @param {ExcelJS.Workbook} workbook
 * @param {string} localPath
 * @param {string} gcsPath
 */
async function saveAndSyncWorkbook(workbook, localPath, gcsPath) {
  await workbook.xlsx.writeFile(localPath);
  await uploadFile(localPath, gcsPath);
}

module.exports = {
  getLocalSpreadsheetPath,
  getGCSPath,
  loadOrCreateWorkbook,
  saveAndSyncWorkbook,
};
