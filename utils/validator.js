/**
 * 英数字、アンダースコア、ハイフンのみ許可�E�安�Eな customId / ファイル名等に使用�E�E * 空斁E���EスラチE��ュ・ドット等も除夁E * @param {string} str
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
 * UUIDv4形式に一致するかどぁE��を判宁E * @param {string} str
 * @returns {boolean}
 */
function isUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

/**
 * 数値斁E���EかどぁE��を判定（正負の整数・小数対応！E * @param {string} str
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
