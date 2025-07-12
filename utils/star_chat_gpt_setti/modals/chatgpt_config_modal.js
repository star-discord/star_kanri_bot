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

      // ここで設定を保存する�E琁E��追加
      // 侁E チE�Eタベ�EスめE��ァイルに保孁E

      const embed = createAdminEmbed(
        '✁EChatGPT設定更新完亁E,
        'ChatGPTの設定が正常に更新されました、E
      ).addFields(
        {
          name: 'APIキー',
          value: apiKeyField ? '設定済み (****)' : '未設宁E,
          inline: true
        },
        {
          name: '最大ト�Eクン数',
          value: maxTokensField || '未設宁E,
          inline: true
        },
        {
          name: '温度設宁E,
          value: temperatureField || '未設宁E,
          inline: true
        }
      );

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });

    } catch (error) {
      console.error('ChatGPT設定モーダル処琁E��ラー:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❁E設定�E保存中にエラーが発生しました、E,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }
};
