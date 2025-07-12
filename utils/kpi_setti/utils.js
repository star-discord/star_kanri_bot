// utils/kpi_setti/utils.js

/**
 * YYYY/MM/DD 形式�E日付文字�EかどぁE��を判宁E
 */
function validateDate(str) {
  return /^\d{4}\/\d{2}\/\d{2}$/.test(str);
}

/**
 * 半角数字かどぁE��を判宁E
 */
function isHalfWidthNumber(str) {
  return /^\d+$/.test(str);
}

module.exports = {
  validateDate,
  isHalfWidthNumber,
};
