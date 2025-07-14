// 仮コマンド: 実装予定
module.exports = {
  data: {
    name: 'totsusuna_quick',
    description: '仮: totsusuna_quick コマンド（未実装）'
  },
  async execute(interaction) {
    await interaction.reply({ content: 'このコマンドは現在未実装です。', ephemeral: true });
  }
};
