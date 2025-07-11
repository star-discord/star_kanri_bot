// utils/totusuna_setti/state/totsusunaTemp.js

const store = new Map();

/**
 * guildId と userId の組み合わせでデータを取得
 * @param {string} guildId 
 * @param {string} userId 
 * @returns {any|null}
 */
function get(guildId, userId) {
  return store.get(`${guildId}:${userId}`) || null;
}

/**
 * guildId と userId の組み合わせでデータを保存
 * @param {string} guildId 
 * @param {string} userId 
 * @param {any} data 
 */
function set(guildId, userId, data) {
  store.set(`${guildId}:${userId}`, data);
}

/**
 * guildId と userId の組み合わせのデータを削除
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
