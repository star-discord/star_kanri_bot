// utils/storage.js
require('dotenv').config(); // ← .env を読み込む

const { Storage } = require('@google-cloud/storage');
const path = require('path');

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const bucketName = process.env.GCS_BUCKET_NAME;

if (!keyPath || !bucketName) {
  throw new Error('GOOGLE_APPLICATION_CREDENTIALS または GCS_BUCKET_NAME が .env に定義されていません');
}

// Storage クライアント初期化
const storage = new Storage({
  keyFilename: path.resolve(keyPath)
});

module.exports = {
  /**
   * 指定したローカルファイルを GCS にアップロード
   * @param {string} localPath - ローカルのファイルパス
   * @param {string} destination - GCS 上の保存先パス
   */
  async uploadFile(localPath, destination) {
    await storage.bucket(bucketName).upload(localPath, {
      destination
    });
  },

  /**
   * GCS 上のファイルをローカルにダウンロード
   * @param {string} srcFilename - GCS 内のファイルパス
   * @param {string} destPath - ローカル保存先パス
   */
  async downloadFile(srcFilename, destPath) {
    const options = { destination: destPath };
    await storage.bucket(bucketName).file(srcFilename).download(options);
  },

  /**
   * GCS 上のファイルをテキストで読み取る
   * @param {string} filename - GCS ファイルパス
   * @returns {Promise<string>}
   */
  async getFileContents(filename) {
    const [contents] = await storage.bucket(bucketName).file(filename).download();
    return contents.toString('utf8');
  },

  /**
   * GCS 上のファイルにテキストを書き込む（上書き）
   * @param {string} filename - GCS ファイルパス
   * @param {string|Buffer} contents - 保存内容
   */
  async saveFileContents(filename, contents) {
    await storage.bucket(bucketName).file(filename).save(contents);
  }
};
