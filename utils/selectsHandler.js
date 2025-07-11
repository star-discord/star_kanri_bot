// utils/selectsHandler.js

module.exports = async (interaction) => {
  switch (interaction.customId) {
    case 'tousuna_select_main':
      return require('./totusuna_setti/selects/設置チャンネル.js')(interaction);

    case 'tousuna_select_replicate':
      return require('./totusuna_setti/selects/複製チャンネル.js')(interaction);

    default:
      console.warn(`⚠️ 未対応の selectMenu customId: ${interaction.customId}`);
      return interaction.reply({
        content: '⚠️ この選択はまだ処理に対応していません。',
        ephemeral: true
      });
  }
};
