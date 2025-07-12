// utils/kpi_setti/utils.js

/**
 * YYYY/MM/DD 蠖｢蠑上・譌･莉俶枚蟄怜・縺九←縺・°繧貞愛螳・
 */
function validateDate(str) {
  return /^\d{4}\/\d{2}\/\d{2}$/.test(str);
}

/**
 * 蜊願ｧ呈焚蟄励°縺ｩ縺・°繧貞愛螳・
 */
function isHalfWidthNumber(str) {
  return /^\d+$/.test(str);
}

module.exports = {
  validateDate,
  isHalfWidthNumber,
};
