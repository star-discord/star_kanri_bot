// utils/spreadsheetHandler.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { uploadFile, downloadFile, getFileContents, saveFileContents } = require('./storage');

/**
 * 保存ファイルの絶対パスを取得
 */
function getLocalSpreadsheetPath(guildId, suffix = '') {
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
 * Google Cloud Storage 上のパスを取得
 */
function getGCSPath(guildId, suffix = '') {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `spreadsheet/${guildId}/${guildId}-${ym}${suffix ? `-${suffix}` : ''}.xlsx`;
}

/**
 * Excel ファイルをローカル or GCS からロードしてワークブックを返す
 */
async function loadOrCreateWorkbook(guildId, suffix = '', sheetName = '報告') {
  const localPath = getLocalSpreadsheetPath(guildId, suffix);
  const gcsPath = getGCSPath(guildId, suffix);
  const workbook = new ExcelJS.Workbook();

  // GCSからダウンロードしてローカルに保存（なければスキップ）
  try {
    if (!fs.existsSync(localPath)) {
      await downloadFile(gcsPath, localPath);
      console.log(`☁️ GCSからダウンロード: ${gcsPath}`);
    }
  } catch (err) {
    console.warn(`⚠️ GCSからのダウンロードに失敗: ${gcsPath}`, err);
  }

  // ローカルファイルが存在するなら読み込み
  if (fs.existsSync(localPath)) {
    await workbook.xlsx.readFile(localPath);
  }

  // シートがなければ追加
  let sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    sheet = workbook.addWorksheet(sheetName);
    sheet.addRow(['日時', '何組', '何名', '卓1', '卓2', '卓3', '卓4', '詳細', '名前']);
  }

  return { workbook, sheet, localPath, gcsPath };
}

/**
 * Excelファイルを保存し、GCSにアップロードする
 */
async function saveAndSyncWorkbook(workbook, localPath, gcsPath) {
  await workbook.xlsx.writeFile(localPath);
  console.log(`💾 ローカル保存: ${localPath}`);

  await uploadFile(localPath, gcsPath);
  console.log(`☁️ GCSへアップロード: ${gcsPath}`);
}

module.exports = {
  getLocalSpreadsheetPath,
  getGCSPath,
  loadOrCreateWorkbook,
  saveAndSyncWorkbook
};
