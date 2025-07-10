// utils/spreadsheetHandler.js
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

/**
 * 対象ギルドのスプレッドシートファイルのパスを生成
 * @param {string} guildId
 * @param {string} suffix 例: '凸スナ報告'
 * @returns {string} 絶対パス
 */
function getSpreadsheetPath(guildId, suffix = '') {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const fileName = `${guildId}-${ym}${suffix ? `-${suffix}` : ''}.xlsx`;
  const dir = path.join(__dirname, 'data', guildId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return path.join(dir, fileName);
}

/**
 * スプレッドシートと対象シートを取得（存在しなければ作成）
 * @param {string} filePath
 * @param {string} sheetName
 * @returns {Promise<{ workbook: ExcelJS.Workbook, sheet: ExcelJS.Worksheet }>}
 */
async function loadOrCreateWorkbook(filePath, sheetName = '報告') {
  const workbook = new ExcelJS.Workbook();

  if (fs.existsSync(filePath)) {
    await workbook.xlsx.readFile(filePath);
  }

  let sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    sheet = workbook.addWorksheet(sheetName);
    // 初期ヘッダー行
    sheet.addRow(['日時', '何組', '何名', '卓1', '卓2', '卓3', '卓4', '詳細', '名前']);
  }

  return { workbook, sheet };
}

module.exports = {
  getSpreadsheetPath,
  loadOrCreateWorkbook,
};
