// utils/config/ICache.js

/**
 * @interface
 */
class ICache {
  /** @param {string} guildId */
  get(guildId) { throw new Error("Not implemented"); }
  /** @param {string} guildId @param {object} config */
  set(guildId, config) { throw new Error("Not implemented"); }
  /** @param {string} guildId */
  invalidate(guildId) { throw new Error("Not implemented"); }
}

module.exports = { ICache };