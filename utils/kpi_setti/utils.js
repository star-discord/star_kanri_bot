// utils/kpi_setti/utils.js

/**
 * YYYY/MM/DD 形式の日付文字列かどうかを判定
 */
function validateDate(str) {
  return /^\d{4}\/\d{2}\/\d{2}$/.test(str);
}

/**
 * 半角数字かどうかを判定
 */
function isHalfWidthNumber(str) {
  return /^\d+$/.test(str);
}

module.exports = {
  validateDate,
  isHalfWidthNumber,
};
