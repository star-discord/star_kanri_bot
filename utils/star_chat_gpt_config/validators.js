function validateMaxTokens(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}

function validateTemperature(value) {
  const n = Number(value);
  return typeof n === 'number' && n >= 0 && n <= 1;
}

module.exports = {
  validateMaxTokens,
  validateTemperature,
};
