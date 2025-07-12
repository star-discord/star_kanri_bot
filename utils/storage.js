// utils/storage.js
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

// .env 等で設定する環墁E��数
const BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const KEY_FILE = process.env.GCP_CREDENTIALS_JSON || 'gcp-service-account.json';

// GCS 利用可否の判宁E
const isGCSConfigured = BUCKET_NAME && PROJECT_ID && fs.existsSync(KEY_FILE);

if (!isGCSConfigured) {
  console.warn('⚠�E�EGCS設定が不足してぁE��ため、storage.js の機�Eは無効化されます、E);
}

// ストレージ初期化（有効な場合�Eみ�E�E
const storage = isGCSConfigured ? new Storage({
  projectId: PROJECT_ID,
  keyFilename: KEY_FILE
}) : null;

const bucket = isGCSConfigured ? storage.bucket(BUCKET_NAME) : null;

/**
 * GCS にファイルをアチE�EローチE
 * @param {string} localFilePath - ローカルファイルのパス
 * @param {string} destinationPath - GCS保存パス�E�侁E 1234567890123/2025-07-凸スナ報呁Exlsx�E�E
 */
async function uploadFile(localFilePath, destinationPath) {
  if (!isGCSConfigured) return;
  if (!fs.existsSync(localFilePath)) {
    console.warn(`⚠�E�EアチE�Eロード�Eファイルが存在しません: ${localFilePath}`);
    return;
  }

  try {
    await bucket.upload(localFilePath, {
      destination: destinationPath,
      gzip: true,
      metadata: { cacheControl: 'no-cache' }
    });
    console.log(`☁E��EアチE�Eロード完亁E ${destinationPath}`);
  } catch (err) {
    console.error(`❁EアチE�Eロード失敁E ${destinationPath}`, err);
  }
}

/**
 * GCS からファイルをダウンローチE
 * @param {string} destinationPath - GCS上�Eファイルパス
 * @param {string} localFilePath - 保存�Eローカルパス
 * @returns {Promise<boolean>} - 成功なめEtrue
 */
async function downloadFile(destinationPath, localFilePath) {
  if (!isGCSConfigured) return false;

  try {
    await bucket.file(destinationPath).download({ destination: localFilePath });
    console.log(`⬁E��Eダウンロード完亁E ${destinationPath}`);
    return true;
  } catch (err) {
    console.warn(`⚠�E�Eダウンロード失敗（存在しなぁE��能性あり�E�E ${destinationPath}`);
    return false;
  }
}

module.exports = {
  uploadFile,
  downloadFile
};
