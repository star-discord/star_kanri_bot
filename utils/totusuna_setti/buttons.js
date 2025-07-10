// utils/totusuna_setti/buttons.js
const path = require('path');

module.exports = {
  async handle(interaction) {
    const customId = interaction.customId;

    // 再送信ボタン: tousuna_resend_button_<uuid>
    if (customId.startsWith('tousuna_resend_button_')) {
      const uuid = customId.replace('tousuna_resend_button_', '');
      const handler = require('./buttons/再送信.js');
      return await handler.handle(interaction, uuid);
    }

    // 設定を編集ボタン: tousuna_edit_button_<uuid>
    if (customId.startsWith('tousuna_edit_button_')) {
      const uuid = customId.replace('tousuna_edit_button_', '');
      const handler = require('./buttons/設定を編集.js');
      return await handler.handle(interaction, uuid);
    }

    // 本文削除ボタン: tousuna_delete_button_<uuid>
    if (customId.startsWith('tousuna_delete_button_')) {
      const uuid = customId.replace('tousuna_delete_button_', '');
      const handler = require('./buttons/本文削除.js');
      return await handler.handle(interaction, uuid);
    }

    // 他のボタンが必要になったらここに追加
    return;
  },
};
