// utils/storage.js
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

// .env 遲峨〒險ｭ螳壹☆繧狗腸蠅・､画焚
const BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const KEY_FILE = process.env.GCP_CREDENTIALS_JSON || 'gcp-service-account.json';

// GCS 蛻ｩ逕ｨ蜿ｯ蜷ｦ縺ｮ蛻､螳・
const isGCSConfigured = BUCKET_NAME && PROJECT_ID && fs.existsSync(KEY_FILE);

if (!isGCSConfigured) {
  console.warn('笞・・GCS險ｭ螳壹′荳崎ｶｳ縺励※縺・ｋ縺溘ａ縲《torage.js 縺ｮ讖溯・縺ｯ辟｡蜉ｹ蛹悶＆繧後∪縺吶・);
}

// 繧ｹ繝医Ξ繝ｼ繧ｸ蛻晄悄蛹厄ｼ域怏蜉ｹ縺ｪ蝣ｴ蜷医・縺ｿ・・
const storage = isGCSConfigured ? new Storage({
  projectId: PROJECT_ID,
  keyFilename: KEY_FILE
}) : null;

const bucket = isGCSConfigured ? storage.bucket(BUCKET_NAME) : null;

/**
 * GCS 縺ｫ繝輔ぃ繧､繝ｫ繧偵い繝・・繝ｭ繝ｼ繝・
 * @param {string} localFilePath - 繝ｭ繝ｼ繧ｫ繝ｫ繝輔ぃ繧､繝ｫ縺ｮ繝代せ
 * @param {string} destinationPath - GCS菫晏ｭ倥ヱ繧ｹ・井ｾ・ 1234567890123/2025-07-蜃ｸ繧ｹ繝雁ｱ蜻・xlsx・・
 */
async function uploadFile(localFilePath, destinationPath) {
  if (!isGCSConfigured) return;
  if (!fs.existsSync(localFilePath)) {
    console.warn(`笞・・繧｢繝・・繝ｭ繝ｼ繝牙・繝輔ぃ繧､繝ｫ縺悟ｭ伜惠縺励∪縺帙ｓ: ${localFilePath}`);
    return;
  }

  try {
    await bucket.upload(localFilePath, {
      destination: destinationPath,
      gzip: true,
      metadata: { cacheControl: 'no-cache' }
    });
    console.log(`笘・ｸ・繧｢繝・・繝ｭ繝ｼ繝牙ｮ御ｺ・ ${destinationPath}`);
  } catch (err) {
    console.error(`笶・繧｢繝・・繝ｭ繝ｼ繝牙､ｱ謨・ ${destinationPath}`, err);
  }
}

/**
 * GCS 縺九ｉ繝輔ぃ繧､繝ｫ繧偵ム繧ｦ繝ｳ繝ｭ繝ｼ繝・
 * @param {string} destinationPath - GCS荳翫・繝輔ぃ繧､繝ｫ繝代せ
 * @param {string} localFilePath - 菫晏ｭ伜・繝ｭ繝ｼ繧ｫ繝ｫ繝代せ
 * @returns {Promise<boolean>} - 謌仙粥縺ｪ繧・true
 */
async function downloadFile(destinationPath, localFilePath) {
  if (!isGCSConfigured) return false;

  try {
    await bucket.file(destinationPath).download({ destination: localFilePath });
    console.log(`筮・ｸ・繝繧ｦ繝ｳ繝ｭ繝ｼ繝牙ｮ御ｺ・ ${destinationPath}`);
    return true;
  } catch (err) {
    console.warn(`笞・・繝繧ｦ繝ｳ繝ｭ繝ｼ繝牙､ｱ謨暦ｼ亥ｭ伜惠縺励↑縺・庄閭ｽ諤ｧ縺ゅｊ・・ ${destinationPath}`);
    return false;
  }
}

module.exports = {
  uploadFile,
  downloadFile
};
