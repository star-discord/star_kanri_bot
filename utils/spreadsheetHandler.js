// utils/spreadsheetHandler.js
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

/**
 * スプレッドシート保存先のフルパスを取得
 * ファイル名形式: <guildId>-YYYY-MM[-suffix].xlsx
 * @param {string} guildId - DiscordのギルドID
 * @param {string} [suffix=''] - ファイル名の末尾（例: '凸スナ報告'）
 * @returns {string} 絶対パス
 */
function getSpreadsheetPath(guildId, suffix = '') {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const fileName = `${guildId}-${ym}${suffix ? `-${suffix}` : ''}.xlsx`;
  const dir = path.join(__dirname, '../data', guildId);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 ディレクトリ作成: ${dir}`);
  }

  return path.join(dir, fileName);
}

/**
 * Excelファイルを読み込むか新規作成し、ワークシートを返す
 * シートが存在しない場合は作成し、ヘッダーも追加
 * @param {string} filePath - Excelファイルのフルパス
 * @param {string} [sheetName='報告'] - 対象シート名
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
    sheet.addRow([
      '日時',
      '何組',
      '何名',
      '卓1',
      '卓2',
      '卓3',
      '卓4',
      '詳細',
      '名前'
    ]);
  }

  return { workbook, sheet };
}

module.exports = {
  getSpreadsheetPath,
  loadOrCreateWorkbook
};

