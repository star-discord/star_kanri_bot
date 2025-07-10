// utils/spreadsheetHandler.js
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { uploadFile, downloadFile } = require('./storage'); // ← ✅ 修正ポイント

/**
 * GCSパスを取得（例: 1234567890123/2025-07-凸スナ報告.xlsx）
 */
function getGCSPath(guildId, suffix = '') {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `${guildId}/${guildId}-${ym}${suffix ? `-${suffix}` : ''}.xlsx`;
}

/**
 * ローカル保存パスを取得
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
 * Excelファイルをロード or 新規作成（GCS連携）
 */
async function loadOrCreateWorkbook(guildId, suffix = '', sheetName = '報告') {
  const localPath = getLocalSpreadsheetPath(guildId, suffix);
  const gcsPath = getGCSPath(guildId, suffix);

  // GCSからダウンロード試行
  await downloadFile(gcsPath, localPath);

  const workbook = new ExcelJS.Workbook();
  if (fs.existsSync(localPath)) {
    await workbook.xlsx.readFile(localPath);
  }

  let sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    sheet = workbook.addWorksheet(sheetName);
    sheet.addRow(['日時', '何組', '何名', '卓1', '卓2', '卓3', '卓4', '詳細', '名前']);
  }

  return { workbook, sheet, localPath, gcsPath };
}

/**
 * 保存して GCS にアップロード
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
