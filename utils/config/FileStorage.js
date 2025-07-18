// utils/config/FileStorage.js
const { IPersistence } = require('./IPersistence');
const { ensureGuildJSON, readJSON, writeJSON } = require('../fileHelper');

/**
 * @implements {IPersistence}
 */
class FileStorage {
  /**
   * @param {string} [baseDir='data']
   */
  constructor(baseDir = 'data') {
    /** @private */
    this.baseDir = baseDir;
  }

  /**
   * @param {string} guildId
   * @returns {Promise<object | null>}
   */
  async load(guildId) {
    try {
      const filePath = await ensureGuildJSON(guildId, this.baseDir);
      return await readJSON(filePath);
    } catch (error) {
      console.error(`[FileStorage] データのロードに失敗: ${guildId}`, error);
      return null;
    }
  }

  /**
   * @param {string} guildId
   * @param {object} config
   * @returns {Promise<void>}
   */
  async save(guildId, config) {
    try {
      const filePath = await ensureGuildJSON(guildId, this.baseDir);
      await writeJSON(filePath, config);
    } catch (error) {
      console.error(`[FileStorage] データの保存に失敗: ${guildId}`, error);
      throw error; // エラーを再スローして ConfigManager で処理
    }
  }
}

module.exports = { FileStorage };