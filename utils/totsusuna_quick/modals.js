const path = require('path');

module.exports = {
  async handle(interaction) {
    const customId = interaction.customId;

    if (customId === 'quick_input_modal') {
      const handler = require(path.join(__dirname, 'modals', '本文入力.js'));
      return await handler.handle(interaction);
    }

    // 他に追加する場合はここに分岐
  },
};
