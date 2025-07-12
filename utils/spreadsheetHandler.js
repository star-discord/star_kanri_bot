// utils/spreadsheetHandler.js
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { uploadFile, downloadFile } = require('./storage'); // ✁EGCS連携用

/**
 * GCS用ファイルパスを生成（侁E 1234567890123/1234567890123-2025-07-凸スナ報呁Exlsx�E�E * @param {string} guildId
 * @param {string} suffix
 * @returns {string}
 */
function getGCSPath(guildId, suffix = '') {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `${guildId}/${guildId}-${ym}${suffix ? `-${suffix}` : ''}.xlsx`;
}

/**
 * ローカル保存パスを取得（存在しなぁE��合�EチE��レクトリ作�E�E�E * @param {string} guildId
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
 * ワークブックを読み込み or 新規作�E�E�ECS同期込み�E�E * @param {string} guildId
 * @param {string} suffix
 * @param {string} sheetName
 * @returns {Promise<{ workbook: ExcelJS.Workbook, sheet: ExcelJS.Worksheet, localPath: string, gcsPath: string }>}
 */
async function loadOrCreateWorkbook(guildId, suffix = '', sheetName = '報呁E) {
  const localPath = getLocalSpreadsheetPath(guildId, suffix);
  const gcsPath = getGCSPath(guildId, suffix);

  // GCSから最新ファイルをダウンロード（存在しなぁE��合�EスキチE�E�E�E  await downloadFile(gcsPath, localPath);

  const workbook = new ExcelJS.Workbook();
  if (fs.existsSync(localPath)) {
    await workbook.xlsx.readFile(localPath);
  }

  let sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    sheet = workbook.addWorksheet(sheetName);
    sheet.addRow(['日晁E, '何絁E, '何名', '十E', '十E', '十E', '十E', '詳細', '名前']);
  }

  return { workbook, sheet, localPath, gcsPath };
}

/**
 * 保存後、GCSにアチE�Eロードして同期
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
