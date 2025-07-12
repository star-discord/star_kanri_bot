// utils/totusuna_setti/state/totsusunaTemp.js

const store = new Map();

/**
 * guildId 縺ｨ userId 縺ｮ邨・∩蜷医ｏ縺帙〒繝・・繧ｿ繧貞叙蠕・ * @param {string} guildId 
 * @param {string} userId 
 * @returns {any|null}
 */
function get(guildId, userId) {
  return store.get(`${guildId}:${userId}`) || null;
}

/**
 * guildId 縺ｨ userId 縺ｮ邨・∩蜷医ｏ縺帙〒繝・・繧ｿ繧剃ｿ晏ｭ・ * @param {string} guildId 
 * @param {string} userId 
 * @param {any} data 
 */
function set(guildId, userId, data) {
  store.set(`${guildId}:${userId}`, data);
}

/**
 * guildId 縺ｨ userId 縺ｮ邨・∩蜷医ｏ縺帙・繝・・繧ｿ繧貞炎髯､
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
