// utils/star_chat_gpt_setti/buttons/star_chat_gpt_setti_button.js
const { MessageFlags } = require('discord.js');
const { createAdminEmbed } = require('../../embedHelper');

module.exports = {
  customId: 'star_chat_gpt_setti_button',
  
  async handle(interaction) {
    try {
      const embed = createAdminEmbed(
        '🤁E今日のChatGPT惁E��',
        '今日のChatGPT関連惁E��をお届けします！E
      ).addFields(
        {
          name: '🌤�E�E天気情報',
          value: '今日は晴れ�E予報です。外�E時�E日焼け対策をお忘れなく！E,
          inline: false
        },
        {
          name: '📰 ニュース',
          value: 'AI技術�E最新動向につぁE��注目が集まってぁE��す、E,
          inline: false
        },
        {
          name: '💡 豁E��譁E,
          value: 'ChatGPTは2022年11月に公開され、世界中で注目を集めてぁE��す、E,
          inline: false
        }
      );

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error('ChatGPTボタン処琁E��ラー:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❁Eエラーが発生しました。しばらく時間をおぁE��再度お試しください、E,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }
};
