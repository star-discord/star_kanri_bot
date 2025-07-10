// utils/totusuna_setti/buttons.js

const fs = require('fs');
const path = require('path');

const buttonsDir = path.join(__dirname, 'buttons');

// ボタンモジュール読み込み
const buttonModules = fs.readdirSync(buttonsDir)
  .filter(file => file.endsWith('.js'))
  .map(file => require(path.join(buttonsDir, file)));

// 中継ハンドラー
module.exports = {
  async handle(interaction) {
    const customId = interaction.customId;

    for (const mod of buttonModules) {
      // 明示的な customId 定義を優先（customId or customIdStart）
      if (mod.customId && mod.customId === customId) {
        return mod.handle(interaction);
      }
      if (mod.customIdStart && customId.startsWith(mod.customIdStart)) {
        return mod.handle(interaction);
      }
    }

    console.warn(`❗ 未対応のボタン: ${customId}`);
  }
};
