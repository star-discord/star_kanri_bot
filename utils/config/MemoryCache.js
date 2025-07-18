// utils/config/MemoryCache.js
const { ICache } = require('./ICache');

/**
 * @implements {ICache}
 */
class MemoryCache {
  constructor() {
    /** @private @type {Map<string, object>} */
    this.cache = new Map();
  }

  /**
   * @param {string} guildId
   * @returns {object | undefined}
   */
  get(guildId) {
    return this.cache.get(guildId);
  }

  /**
   * @param {string} guildId
   * @param {object} config
   */
  set(guildId, config) {
    this.cache.set(guildId, config);
  }

  invalidate(guildId) {
    this.cache.delete(guildId);
  }
}

module.exports = { MemoryCache };