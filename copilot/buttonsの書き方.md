## ボタンハンドラの書き方

```js
// utils/<feature>/buttons/xxx_button.js
module.exports = {
  customId: 'xxx_button',
  handle: async (interaction) => {
    // ボタン押下時の処理
    await interaction.reply({ content: 'ボタンが押されました', ephemeral: true });
  }
};
```

