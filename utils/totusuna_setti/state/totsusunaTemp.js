const map = new Map();

module.exports = {
  set(userId, state) {
    map.set(userId, state);
  },

  get(userId) {
    return map.get(userId);
  },

  update(userId, partial) {
    const current = map.get(userId) || {};
    map.set(userId, { ...current, ...partial });
  },

  delete(userId) {
    map.delete(userId);
  },

  has(userId) {
    return map.has(userId);
  },
};
