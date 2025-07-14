// 仮コマンド: 実装予定
module.exports = {
  data: {
    name: 'totusuna_config_fixed',
    description: '仮: totusuna_config_fixed コマンド（未実装）'
  },
  async execute(interaction) {
    await interaction.reply({ content: 'このコマンドは現在未実装です。', ephemeral: true });
  }
};
