## ボタンハンドラの書き方


```js
// utils/<feature>/buttons/xxx_button.js
module.exports = {
  customId: 'xxx_button',
  handle: async (interaction) => {
    // ボタン押下時の処理
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: 'ボタンが押されました', flags: 1 << 6 });
    } else {
      await interaction.reply({ content: 'ボタンが押されました', flags: 1 << 6 });
    }
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
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: 'セレクトが選択されました', flags: 1 << 6 });
    } else {
      await interaction.reply({ content: 'セレクトが選択されました', flags: 1 << 6 });
    }
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
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: 'モーダルが送信されました', flags: 1 << 6 });
    } else {
      await interaction.reply({ content: 'モーダルが送信されました', flags: 1 << 6 });
    }
  }
};
```

---

## リスト（StringSelectMenu）ハンドラの書き方

```js
// utils/<feature>/selects/xxx_list.js
module.exports = {
  customId: 'xxx_list',
  handle: async (interaction) => {
    // リスト選択時の処理
    const selected = interaction.values;
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: `選択された値: ${selected.join(', ')}`, flags: 1 << 6 });
    } else {
      await interaction.reply({ content: `選択された値: ${selected.join(', ')}`, flags: 1 << 6 });
    }
  }
};
```
