// utils/tempStore.js
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

// 環境変数から設定取得
const BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const KEY_FILE = process.env.GCP_CREDENTIALS_JSON || 'gcp-service-account.json';

// 設定検証
const isKeyFileValid = fs.existsSync(KEY_FILE);
const isGCSConfigured = Boolean(BUCKET_NAME && PROJECT_ID && isKeyFileValid);

// 初期化時警告
if (!isGCSConfigured) {
  console.warn('[tempStore] ⚠️ GCS設定が不完全なため、一時ストレージ機能は無効化されます。');
  if (!BUCKET_NAME) console.warn('  - GCS_BUCKET_NAME が設定されていません。');
  if (!PROJECT_ID) console.warn('  - GCP_PROJECT_ID が設定されていません。');
  if (!isKeyFileValid) console.warn(`  - GCP_CREDENTIALS_JSON ファイルが存在しません: ${KEY_FILE}`);
}

// ストレージ初期化
const storage = isGCSConfigured ? new Storage({
  projectId: PROJECT_ID,
  keyFilename: KEY_FILE,
}) : null;

const bucket = isGCSConfigured ? storage.bucket(BUCKET_NAME) : null;

/**
 * 一時ファイルを GCS にアップロード
 * @param {string} localFilePath - ローカルファイルパス
 * @param {string} destinationPath - GCS保存先（例: temp/guildId/filename.ext）
 * @returns {Promise<boolean>}
 */
async function uploadFile(localFilePath, destinationPath) {
  if (!isGCSConfigured) {
    console.warn('[tempStore] アップロードは無効（GCS未構成）');
    return false;
  }

  if (!fs.existsSync(localFilePath)) {
    console.warn(`[tempStore] ⚠️ ファイルが存在しません: ${localFilePath}`);
    return false;
  }

  try {
    await bucket.upload(localFilePath, {
      destination: destinationPath,
      gzip: true,
      metadata: { cacheControl: 'no-cache' },
    });
    console.log(`[tempStore] ✅ アップロード完了: ${destinationPath}`);
    return true;
  } catch (err) {
    console.error(`[tempStore] ❌ アップロード失敗: ${destinationPath}`, err);
    return false;
  }
}

/**
 * 一時ファイルを GCS からダウンロード
 * @param {string} destinationPath - GCSのファイルパス
 * @param {string} localFilePath - 保存先ローカルパス
 * @returns {Promise<boolean>}
 */
async function downloadFile(destinationPath, localFilePath) {
  if (!isGCSConfigured) {
    console.warn('[tempStore] ダウンロードは無効（GCS未構成）');
    return false;
  }

  try {
    await bucket.file(destinationPath).download({ destination: localFilePath });
    console.log(`[tempStore] ✅ ダウンロード完了: ${destinationPath}`);
    return true;
  } catch (err) {
    console.warn(`[tempStore] ⚠️ ダウンロード失敗（存在しない可能性あり）: ${destinationPath}`);
    return false;
  }
}

module.exports = {
  uploadFile,
  downloadFile,
  isGCSConfigured,
};
