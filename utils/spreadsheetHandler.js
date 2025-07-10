// utils/spreadsheetHandler.js
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

/**
 * スプレッドシート保存先のフルパスを取得
 * @param {string} guildId - DiscordのギルドID
 * @param {string} suffix - ファイル名の末尾（例: '凸スナ報告'）
 * @returns {string} 絶対パス
 */
function getSpreadsheetPath(guildId, suffix = '') {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const fileName = `${guildId}-${ym}${suffix ? `-${suffix}` : ''}.xlsx`;
  const dir = path.join(__dirname, '../data', guildId);

  // ディレクトリがなければ作成
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 ディレクトリ作成: ${dir}`);
  }

  return path.join(dir, fileName);
}

/**
 * Excelワークブックをロードまたは新規作成し、対象シートを返す
 * @param {string} filePath - Excelファイルのパス
 * @param {string} [sheetName='報告'] - シート名
 * @returns {Promise<{ workbook: ExcelJS.Workbook, sheet: ExcelJS.Worksheet }>}
 */
async function loadOrCreateWorkbook(filePath, sheetName = '報告') {
  const workbook = new ExcelJS.Workbook();

  // 既存ファイルがあれば読み込む
  if (fs.existsSync(filePath)) {
    await workbook.xlsx.readFile(filePath);
  }

  // シートがなければ作成
  let sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    sheet = workbook.addWorksheet(sheetName);

    // 初期ヘッダー行
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
  loadOrCreateWorkbook,
};
