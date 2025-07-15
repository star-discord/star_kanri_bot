## モーダルハンドラの書き方

```js
// utils/<feature>/modals/xxx_modal.js
module.exports = {
  customId: 'xxx_modal',
  handle: async (interaction) => {
    // モーダル送信時の処理
    await interaction.reply({ content: 'モーダルが送信されました', ephemeral: true });
  }
};
```
