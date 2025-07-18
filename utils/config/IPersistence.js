// utils/config/IPersistence.js

/**
 * @interface
 */
class IPersistence {
  /**
   * @param {string} guildId
   * @returns {Promise<object | null>}
   */
  load(guildId) { throw new Error("Not implemented"); }
  /** @param {string} guildId @param {object} config */
  save(guildId, config) { throw new Error("Not implemented"); }
}

module.exports = { IPersistence };