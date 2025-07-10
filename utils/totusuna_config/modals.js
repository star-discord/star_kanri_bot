const path = require('path');

module.exports = {
  async handle(interaction) {
    const { customId } = interaction;

    if (customId.startsWith('edit_body_modal_')) {
      const handler = require(path.join(__dirname, 'modals', '本文修正.js'));
      return await handler.handle(interaction);
    }

    // 他のモーダルはここに分岐
  },
};
