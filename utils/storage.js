// utils/storage.js
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

// .env 等で設定する環境変数
const BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const KEY_FILE = process.env.GCP_CREDENTIALS_JSON || 'gcp-service-account.json';

// GCS 利用可否の判定
const isGCSConfigured = BUCKET_NAME && PROJECT_ID && fs.existsSync(KEY_FILE);

if (!isGCSConfigured) {
  console.warn('警告: GCS設定が不足しているため、storage.js の機能は無効化されます。');
}

// ストレージ初期化（有効な場合のみ）
const storage = isGCSConfigured ? new Storage({
  projectId: PROJECT_ID,
  keyFilename: KEY_FILE
}) : null;

const bucket = isGCSConfigured ? storage.bucket(BUCKET_NAME) : null;

/**
 * GCS にファイルをアップロード
 * @param {string} localFilePath - ローカルファイルのパス
 * @param {string} destinationPath - GCS保存パス（例: 1234567890123/2025-07-凸スナ報告.xlsx）
 */
async function uploadFile(localFilePath, destinationPath) {
  if (!isGCSConfigured) return;
  if (!fs.existsSync(localFilePath)) {
    console.warn(`警告: アップロード用ファイルが存在しません: ${localFilePath}`);
    return;
  }

  try {
    await bucket.upload(localFilePath, {
      destination: destinationPath,
      gzip: true,
      metadata: { cacheControl: 'no-cache' }
    });
    console.log(`クラウド: アップロード完了 ${destinationPath}`);
  } catch (err) {
    console.error(`エラー: アップロード失敗 ${destinationPath}`, err);
  }
}

/**
 * GCS からファイルをダウンロード
 * @param {string} destinationPath - GCS上のファイルパス
 * @param {string} localFilePath - 保存先ローカルパス
 * @returns {Promise<boolean>} - 成功ならtrue
 */
async function downloadFile(destinationPath, localFilePath) {
  if (!isGCSConfigured) return false;

  try {
    await bucket.file(destinationPath).download({ destination: localFilePath });
    console.log(`ダウンロード: ダウンロード完了 ${destinationPath}`);
    return true;
  } catch (err) {
    console.warn(`警告: ダウンロード失敗（存在しない可能性あり） ${destinationPath}`);
    return false;
  }
}

module.exports = {
  uploadFile,
  downloadFile
};
