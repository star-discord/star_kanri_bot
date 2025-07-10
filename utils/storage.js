// utils/storage.js
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

// 必要な環境変数（.env に定義）
const BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const KEY_FILE = process.env.GCP_CREDENTIALS_JSON || 'gcp-service-account.json';

if (!BUCKET_NAME || !PROJECT_ID || !fs.existsSync(KEY_FILE)) {
  console.warn('⚠️ GCS設定が正しく行われていません。storage.js の使用は制限されます。');
}

const storage = new Storage({
  projectId: PROJECT_ID,
  keyFilename: KEY_FILE
});

const bucket = storage.bucket(BUCKET_NAME);

/**
 * GCS へファイルをアップロード
 * @param {string} localFilePath - ローカルファイルのパス
 * @param {string} destinationPath - GCS上の保存パス（例: guildId/2025-07-凸スナ報告.xlsx）
 * @returns {Promise<void>}
 */
async function uploadFile(localFilePath, destinationPath) {
  if (!BUCKET_NAME || !fs.existsSync(localFilePath)) return;

  await bucket.upload(localFilePath, {
    destination: destinationPath,
    gzip: true,
    metadata: {
      cacheControl: 'no-cache',
    }
  });

  console.log(`☁️ アップロード完了: ${destinationPath}`);
}

/**
 * GCS からファイルをダウンロード
 * @param {string} destinationPath - GCS上の保存パス
 * @param {string} localFilePath - 保存先ローカルパス
 * @returns {Promise<boolean>} - 成功時 true、失敗時 false
 */
async function downloadFile(destinationPath, localFilePath) {
  if (!BUCKET_NAME) return false;

  try {
    await bucket.file(destinationPath).download({ destination: localFilePath });
    console.log(`⬇️ ダウンロード完了: ${destinationPath}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ GCSファイルが見つかりません: ${destinationPath}`);
    return false;
  }
}

module.exports = {
  uploadFile,
  downloadFile
};
