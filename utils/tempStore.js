// utils/tempStore.js
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

const BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const KEY_FILE = process.env.GCP_CREDENTIALS_JSON || 'gcp-service-account.json';

const isGCSConfigured = BUCKET_NAME && PROJECT_ID && fs.existsSync(KEY_FILE);

if (!isGCSConfigured) {
  console.warn('⚠️ 警告: GCS設定が不足しているため、storage.js の機能は無効化されます。');
  if (!BUCKET_NAME) console.warn('  - GCS_BUCKET_NAME が設定されていません。');
  if (!PROJECT_ID) console.warn('  - GCP_PROJECT_ID が設定されていません。');
  if (!fs.existsSync(KEY_FILE)) console.warn(`  - GCP_CREDENTIALS_JSON ファイルが見つかりません: ${KEY_FILE}`);
}

const storage = isGCSConfigured ? new Storage({
  projectId: PROJECT_ID,
  keyFilename: KEY_FILE,
}) : null;

const bucket = isGCSConfigured ? storage.bucket(BUCKET_NAME) : null;

/**
 * GCS にファイルをアップロード
 * @param {string} localFilePath - ローカルファイルのパス
 * @param {string} destinationPath - GCS保存パス
 * @returns {Promise<boolean>} - 成功ならtrue
 */
async function uploadFile(localFilePath, destinationPath) {
  if (!isGCSConfigured) return false;
  if (!fs.existsSync(localFilePath)) {
    console.warn(`警告: アップロード用ファイルが存在しません: ${localFilePath}`);
    return false;
  }

  try {
    await bucket.upload(localFilePath, {
      destination: destinationPath,
      gzip: true,
      metadata: { cacheControl: 'no-cache' },
    });
    console.log(`クラウド: アップロード完了 ${destinationPath}`);
    return true;
  } catch (err) {
    console.error(`エラー: アップロード失敗 ${destinationPath}`, err);
    return false;
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
  downloadFile,
};
