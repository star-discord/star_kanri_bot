// utils/star_chat_gpt_setti/buttons/star_chat_gpt_setti_button.js
const { MessageFlags } = require('discord.js');
const { createAdminEmbed } = require('../../embedHelper');

module.exports = {
  customId: 'star_chat_gpt_setti_button',
  
  async handle(interaction) {
    try {
      const embed = createAdminEmbed(
        '､・莉頑律縺ｮChatGPT諠・ｱ',
        '莉頑律縺ｮChatGPT髢｢騾｣諠・ｱ繧偵♀螻翫￠縺励∪縺呻ｼ・
      ).addFields(
        {
          name: '研・・螟ｩ豌玲ュ蝣ｱ',
          value: '莉頑律縺ｯ譎ｴ繧後・莠亥ｱ縺ｧ縺吶ょ､門・譎ゅ・譌･辟ｼ縺大ｯｾ遲悶ｒ縺雁ｿ倥ｌ縺ｪ縺擾ｼ・,
          inline: false
        },
        {
          name: '堂 繝九Η繝ｼ繧ｹ',
          value: 'AI謚陦薙・譛譁ｰ蜍募髄縺ｫ縺､縺・※豕ｨ逶ｮ縺碁寔縺ｾ縺｣縺ｦ縺・∪縺吶・,
          inline: false
        },
        {
          name: '庁 雎・衍隴・,
          value: 'ChatGPT縺ｯ2022蟷ｴ11譛医↓蜈ｬ髢九＆繧後∽ｸ也阜荳ｭ縺ｧ豕ｨ逶ｮ繧帝寔繧√※縺・∪縺吶・,
          inline: false
        }
      );

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error('ChatGPT繝懊ち繝ｳ蜃ｦ逅・お繝ｩ繝ｼ:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '笶・繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲ゅ＠縺ｰ繧峨￥譎る俣繧偵♀縺・※蜀榊ｺｦ縺願ｩｦ縺励￥縺縺輔＞縲・,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }
};
