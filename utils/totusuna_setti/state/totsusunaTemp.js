// utils/totusuna_setti/state/totsusunaTemp.js

const store = new Map();

function get(guildId, userId) {
  return store.get(`${guildId}:${userId}`) || null;
}

function set(guildId, userId, data) {
  store.set(`${guildId}:${userId}`, data);
}

function clear(guildId, userId) {
  store.delete(`${guildId}:${userId}`);
}

module.exports = {
  get,
  set,
  clear,
};
