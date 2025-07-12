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

      // 縺薙％縺ｧ險ｭ螳壹ｒ菫晏ｭ倥☆繧句・逅・ｒ霑ｽ蜉
      // 萓・ 繝・・繧ｿ繝吶・繧ｹ繧・ヵ繧｡繧､繝ｫ縺ｫ菫晏ｭ・

      const embed = createAdminEmbed(
        '笨・ChatGPT險ｭ螳壽峩譁ｰ螳御ｺ・,
        'ChatGPT縺ｮ險ｭ螳壹′豁｣蟶ｸ縺ｫ譖ｴ譁ｰ縺輔ｌ縺ｾ縺励◆縲・
      ).addFields(
        {
          name: 'API繧ｭ繝ｼ',
          value: apiKeyField ? '險ｭ螳壽ｸ医∩ (****)' : '譛ｪ險ｭ螳・,
          inline: true
        },
        {
          name: '譛螟ｧ繝医・繧ｯ繝ｳ謨ｰ',
          value: maxTokensField || '譛ｪ險ｭ螳・,
          inline: true
        },
        {
          name: '貂ｩ蠎ｦ險ｭ螳・,
          value: temperatureField || '譛ｪ險ｭ螳・,
          inline: true
        }
      );

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });

    } catch (error) {
      console.error('ChatGPT險ｭ螳壹Δ繝ｼ繝繝ｫ蜃ｦ逅・お繝ｩ繝ｼ:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '笶・險ｭ螳壹・菫晏ｭ倅ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }
};
