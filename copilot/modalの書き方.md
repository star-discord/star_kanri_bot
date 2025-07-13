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

---

## セレクトハンドラの書き方

```js
// utils/<feature>/selects/xxx_select.js
module.exports = {
  customId: 'xxx_select',
  handle: async (interaction) => {
    // セレクト選択時の処理
    await interaction.reply({ content: 'セレクトが選択されました', ephemeral: true });
  }
};
```

---

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
