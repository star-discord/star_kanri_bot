/**
 * 闍ｱ謨ｰ蟄励√い繝ｳ繝繝ｼ繧ｹ繧ｳ繧｢縲√ワ繧､繝輔Φ縺ｮ縺ｿ險ｱ蜿ｯ・亥ｮ牙・縺ｪ customId / 繝輔ぃ繧､繝ｫ蜷咲ｭ峨↓菴ｿ逕ｨ・・ * 遨ｺ譁・ｭ励・繧ｹ繝ｩ繝・す繝･繝ｻ繝峨ャ繝育ｭ峨ｂ髯､螟・ * @param {string} str
 * @returns {boolean}
 */
function isSafeName(str) {
  return typeof str === 'string'
    && str.length > 0
    && /^[a-zA-Z0-9_-]+$/.test(str)
    && !str.includes('..')
    && !str.includes('/')
    && !str.includes('\\');
}

/**
 * UUIDv4蠖｢蠑上↓荳閾ｴ縺吶ｋ縺九←縺・°繧貞愛螳・ * @param {string} str
 * @returns {boolean}
 */
function isUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

/**
 * 謨ｰ蛟､譁・ｭ怜・縺九←縺・°繧貞愛螳夲ｼ域ｭ｣雋縺ｮ謨ｴ謨ｰ繝ｻ蟆乗焚蟇ｾ蠢懶ｼ・ * @param {string} str
 * @returns {boolean}
 */
function isNumeric(str) {
  return typeof str === 'string' && !isNaN(str) && !isNaN(parseFloat(str));
}

module.exports = {
  isSafeName,
  isUUID,
  isNumeric
};
