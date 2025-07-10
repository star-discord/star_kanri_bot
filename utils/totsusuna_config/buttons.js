const path = require('path');

module.exports = {
  async handle(interaction) {
    const { customId } = interaction;

    if (customId.startsWith('tousuna_edit_button_')) {
      const handler = require(path.join(__dirname, 'buttons', '設定を編集.js'));
      return await handler.handle(interaction);
    }

    // 他の設定ボタンはここに追加可能
  },
};
