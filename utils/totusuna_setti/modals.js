// utils/totusuna_setti/modals.js

const inputModal = require('./modals/本文入力をする');
const editModal = require('./modals/編集');
const reportModal = require('./modals/凸スナ報告');

module.exports = {
  async handle(interaction) {
    const id = interaction.customId;

    // 本文入力用モーダル
    if (id === 'tousuna_content_modal') {
      return inputModal.handle(interaction);
    }

    // 編集用モーダル
    if (id.startsWith('tousuna_edit_modal_')) {
      return editModal.handle(interaction);
    }

    // 凸スナ報告モーダル
    if (id.startsWith('tousuna_modal_')) {
      return reportModal.handle(interaction);
    }

    // 未対応の場合は無視
    console.warn(`❗ 未対応のモーダルID: ${id}`);
  },
};
