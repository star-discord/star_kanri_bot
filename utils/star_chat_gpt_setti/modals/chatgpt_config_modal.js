// utils/star_chat_gpt_setti/modals/chatgpt_config_modal.js
const { MessageFlags } = require('discord.js');
const { createAdminEmbed } = require('../../embedHelper');

module.exports = {
  customId: 'chatgpt_config_modal',
  
  async handle(interaction) {
    try {
      const apiKeyField = interaction.fields.getTextInputValue('chatgpt_api_key');
      const maxTokensField = interaction.fields.getTextInputValue('chatgpt_max_tokens');
      const temperatureField = interaction.fields.getTextInputValue('chatgpt_temperature');

      // ここで設定を保存する処理を追加
      // 例: データベースやファイルに保存

      const embed = createAdminEmbed(
        'ChatGPT設定更新完了',
        'ChatGPTの設定が正常に更新されました。'
      ).addFields(
        {
          name: 'APIキー',
          value: apiKeyField ? '設定済み (****)' : '未設定',
          inline: true
        },
        {
          name: '最大トークン数',
          value: maxTokensField || '未設定',
          inline: true
        },
        {
          name: '温度設定',
          value: temperatureField || '未設定',
          inline: true
        }
      );

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlagsBitField.Ephemeral,
      });

    } catch (error) {
      console.error('ChatGPT設定モーダル処理エラー:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '設定の保存中にエラーが発生しました。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    }
  }
};
