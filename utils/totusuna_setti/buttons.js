const inputBody = require('./buttons/input_body');

module.exports = {
  [inputBody.customId]: async (interaction, ...args) => {
    await inputBody.handle(interaction, ...args);
  },

  // 追加のボタン処理があれば下に追加可能
  // 例: [deleteButton.customId]: async (interaction) => { ... }
};
