// utils/totusuna_setti/modals.js
const path = require('path');

module.exports = {
  async handle(interaction) {
    const customId = interaction.customId;

    // 凸スナ本文入力モーダル
    if (customId === 'totusuna_content_modal') {
      const handler = require('./modals/本文入力をする.js');
      return await handler.handle(interaction);
    }

    // 凸スナ報告モーダル（例: tousuna_modal_<uuid>）
    if (customId.startsWith('tousuna_modal_')) {
      const uuid = customId.split('tousuna_modal_')[1];
      const handler = require('./modals/凸スナ報告.js');
      return await handler.handle(interaction, uuid);
    }

    // 凸スナ設定編集モーダル（例: tousuna_edit_modal_<uuid>）
    if (customId.startsWith('tousuna_edit_modal_')) {
      const uuid = customId.split('tousuna_edit_modal_')[1];
      const handler = require('./modals/設定を編集.js');
      return await handler.handle(interaction, uuid);
    }

    console.warn('[modals.js] 未対応の customId:', customId);
  }
};
