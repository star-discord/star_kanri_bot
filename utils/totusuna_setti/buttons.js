// utils/totusuna_setti/buttons.js
const path = require('path');
const fs = require('fs');

module.exports = {
  async handle(interaction) {
    const customId = interaction.customId;

    // 定義済みパターンと対応ファイル
    const patterns = [
      { prefix: 'tousuna_resend_button_', file: '再送信.js' },
      { prefix: 'tousuna_edit_button_', file: '設定を編集.js' },
      { prefix: 'tousuna_delete_button_', file: '本文削除.js' },
    ];

    for (const { prefix, file } of patterns) {
      if (customId.startsWith(prefix)) {
        const uuid = customId.slice(prefix.length);
        const handlerPath = path.join(__dirname, 'buttons', file);

        if (fs.existsSync(handlerPath)) {
          const handler = require(handlerPath);
          if (typeof handler.handle === 'function') {
            return await handler.handle(interaction, uuid);
          } else {
            console.error(`❌ ${file} に handle 関数が存在しません。`);
          }
        } else {
          console.error(`❌ ハンドラファイルが見つかりません: ${handlerPath}`);
        }
        return;
      }
    }

    // 該当なし
    console.warn(`⚠️ 未対応のカスタムID: ${customId}`);
  },
};
