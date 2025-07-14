```js
// utils/<feature>/selects/xxx_list.js
module.exports = {
  customId: 'xxx_list',
  handle: async (interaction) => {
    // リスト選択時の処理
    const selected = interaction.values;
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: `選択された値: ${selected.join(', ')}`, ephemeral: true });
    } else {
      await interaction.reply({ content: `選択された値: ${selected.join(', ')}`, ephemeral: true });
    }
  }
};
```