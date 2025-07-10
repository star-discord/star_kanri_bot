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

    // 凸スナ本文 編集モーダル
    if (customId.startsWith('tousuna_edit_modal_')) {
      const handler = require('./modals/本文編集.js');
      return await handler.handle(interaction);
    }

    console.warn('[modals.js] 未対応の customId:', customId);
  }
};
