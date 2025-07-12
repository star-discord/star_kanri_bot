const path = require('path');
const { loadHandlers } = require('../handlerLoader');

// utils/kpi_setti/buttons ディレクトリからすべてのボタンハンドラを読み込む
const handlers = loadHandlers(path.join(__dirname, 'buttons'));

/**
 * カスタムIDに一致するボタンハンドラを返す
 * @param {string} customId
 * @returns {{ handle(interaction): Promise<void> } | null}
 */
module.exports = (customId) => {
  return handlers(customId);
};
