// utils/star_chat_gpt_config/validators.js

function validateMaxTokens(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n <= 4096;
}

function validateTemperature(value) {
  const n = Number(value);
  return typeof n === 'number' && !isNaN(n) && n >= 0 && n <= 1;
}

module.exports = {
  validateMaxTokens,
  validateTemperature,
};
