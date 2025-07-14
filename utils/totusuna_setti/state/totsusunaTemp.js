
// utils/totusuna_setti/state/totsusunaTemp.js

const store = new Map();

/**
 * @param {string} guildId
 * @param {string} userId
 * @returns {object|null}
 */
function get(guildId, userId) {
  return store.get(`${guildId}:${userId}`) || null;
}

/**
 * @param {string} guildId
 * @param {string} userId
 * @param {object} data
 */
function set(guildId, userId, data) {
  store.set(`${guildId}:${userId}`, data);
}

/**
 * @param {string} guildId
 * @param {string} userId
 */
function clear(guildId, userId) {
  return store.delete(`${guildId}:${userId}`);
}

/**
 * Get all stored data for debugging
 */
function getAll() {
  return Array.from(store.entries());
}

module.exports = { get, set, clear, getAll };
