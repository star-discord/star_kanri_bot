// utils/totusuna_setti/state/totsusunaTemp.js

const store = new Map();

/**
 * guildId と userId の絁E��合わせでチE�Eタを取征E * @param {string} guildId 
 * @param {string} userId 
 * @returns {any|null}
 */
function get(guildId, userId) {
  return store.get(`${guildId}:${userId}`) || null;
}

/**
 * guildId と userId の絁E��合わせでチE�Eタを保孁E * @param {string} guildId 
 * @param {string} userId 
 * @param {any} data 
 */
function set(guildId, userId, data) {
  store.set(`${guildId}:${userId}`, data);
}

/**
 * guildId と userId の絁E��合わせ�EチE�Eタを削除
 * @param {string} guildId 
 * @param {string} userId 
 */
function clear(guildId, userId) {
  store.delete(`${guildId}:${userId}`);
}

module.exports = {
  get,
  set,
  clear,
};
