const store = new Map();

function makeKey(guildId, userId) {
  return `${guildId}:${userId}`;
}

/**
 * @param {string} guildId
 * @param {string} userId
 * @returns {object|null}
 */
function get(guildId, userId) {
  return store.get(makeKey(guildId, userId)) || null;
}

/**
 * @param {string} guildId
 * @param {string} userId
 * @param {object} data
 */
function set(guildId, userId, data) {
  store.set(makeKey(guildId, userId), data);
}

/**
 * @param {string} guildId
 * @param {string} userId
 * @returns {boolean}
 */
function clear(guildId, userId) {
  return store.delete(makeKey(guildId, userId));
}

/**
 * Get all stored data for debugging
 */
function getAll() {
  return Array.from(store.entries());
}

module.exports = { get, set, clear, getAll, makeKey };
