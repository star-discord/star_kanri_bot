/**
 * ファイル名やcustomIdなどに使える「安全な文字列」かを検証する
 * 英数字、アンダースコア、ハイフンのみ許可
 * @param {string} str
 * @returns {boolean}
 */
function isSafeName(str) {
  return typeof str === 'string' && /^[a-zA-Z0-9_\-]+$/.test(str);
}

module.exports = { isSafeName };
