// utils/star_chat_gpt_setti/buttons/star_chat_gpt_setti_button.js
const { MessageFlagsBitField } = require('discord.js');
const { createAdminEmbed } = require('../../embedHelper');
const { getChatCompletion } = require('../../openai');

module.exports = {
  customId: 'star_chat_gpt_setti_button',
  
  async handle(interaction) {
    try {
      // ChatGPT API呼び出しを並列化
      const [weatherResponse, newsResponse, triviaResponse] = await Promise.all([
        getChatCompletion('今日の天気情報を簡潔に教えてください。'),
        getChatCompletion('最新のAI技術ニュースを簡潔に教えてください。'),
        getChatCompletion('ChatGPTに関する豆知識を1つ教えてください。'),
      ]);

      // フォールバック取得用ヘルパー
      function getContent(response, fallbackKey, defaultText) {
        if (response.error) {
          console.warn(`${fallbackKey}取得エラー:`, response.message);
          return response.fallback_content?.[fallbackKey] || defaultText;
        }
        return response?.choices?.[0]?.message?.content || defaultText;
      }

      const weatherInfo = getContent(weatherResponse, 'weather', '今日は晴れの予報です。外出時は日焼け対策をお忘れなく！');
      const newsInfo = getContent(newsResponse, 'news', 'AI技術の最新動向について注目が集まっています。');
      const triviaInfo = getContent(triviaResponse, 'trivia', 'ChatGPTは2022年11月に公開され、世界中で注目を集めています。');

      const embed = createAdminEmbed(
        '🤖 今日のChatGPT情報',
        '今日のChatGPT関連情報をお届けします！'
      ).addFields(
        { name: '🌤️ 天気情報', value: weatherInfo, inline: false },
        { name: '📰 ニュース', value: newsInfo, inline: false },
        { name: '💡 豆知識', value: triviaInfo, inline: false }
      );

      if (weatherResponse.error || newsResponse.error || triviaResponse.error) {
        embed.setFooter({
          text: '⚠️ 一部の情報はChatGPT APIの制限により取得できませんでした。'
        });
      }

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlagsBitField.Ephemeral,
      });
    } catch (error) {
      console.error('ChatGPTボタン処理エラー:', error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ ChatGPT機能は現在利用できません。API制限またはネットワークエラーが発生しています。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    }
  }
};
