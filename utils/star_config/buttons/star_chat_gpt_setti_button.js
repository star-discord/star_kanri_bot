// utils/star_config/buttons/star_chat_gpt_setti_button.js
const { MessageFlags } = require('discord.js');
const { createAdminEmbed } = require('../../embedHelper');

module.exports = {
  customId: 'star_chat_gpt_setti_button',
  
  async handle(interaction) {
    try {
      const embed = createAdminEmbed(
        '🤖 今日のChatGPT情報',
        '今日のChatGPT関連情報をお届けします！'
      ).addFields(
        {
          name: '🌤️ 天気情報',
          value: '今日は晴れの予報です。外出時は日焼け対策をお忘れなく！',
          inline: false
        },
        {
          name: '📰 ニュース',
          value: 'AI技術の最新動向について注目が集まっています。',
          inline: false
        },
        {
          name: '💡 豆知識',
          value: 'ChatGPTは2022年11月に公開され、世界中で注目を集めています。',
          inline: false
        }
      );

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error('ChatGPTボタン処理エラー:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ エラーが発生しました。しばらく時間をおいて再度お試しください。',
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }
};
