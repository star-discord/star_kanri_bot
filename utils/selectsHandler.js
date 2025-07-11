// utils/selectsHandler.js

module.exports = async (interaction) => {
  switch (interaction.customId) {
    case 'totusuna_select_main':
      // 設置チャンネルの選択処理
      return require('./totusuna_setti/selects/install_channel')(interaction);

    case 'totusuna_select_replicate':
      // 複製チャンネルの選択処理
      return require('./totusuna_setti/selects/replicate_channel')(interaction);

    default:
      console.warn(`⚠️ 未対応の selectMenu customId: ${interaction.customId}`);
      return interaction.reply({
        content: '⚠️ この選択はまだ処理に対応していません。',
        ephemeral: true
      });
  }
};
