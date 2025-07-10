// utils/totusuna_setti/buttons.js
module.exports = {
  async handle(interaction) {
    const customId = interaction.customId;

    // 凸スナ報告ボタン → reportButton.js
    if (customId.startsWith('tousuna_report_button_')) {
      return require('./buttons/reportButton').handle(interaction);
    }

    // 本文入力ボタン（設置者用）→ inputButton.js
    if (customId === 'input_body_button') {
      return require('./buttons/inputButton').handle(interaction);
    }

    // 編集・削除ボタン → editButton.js
    if (customId.startsWith('edit_tousuna_') || customId.startsWith('delete_tousuna_')) {
      return require('./buttons/editButton').handle(interaction);
    }

    console.warn(`[不明なボタンID] ${customId}`);
  },
};

