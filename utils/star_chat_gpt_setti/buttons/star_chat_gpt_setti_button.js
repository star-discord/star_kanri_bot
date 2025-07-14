// utils/star_chat_gpt_setti/buttons/star_chat_gpt_setti_button.js
const { MessageFlags } = require('discord.js');
const { createAdminEmbed } = require('../../embedHelper');
const { getChatCompletion } = require('../../openai');

module.exports = {
  customId: 'star_chat_gpt_setti_button',
  
  async handle(interaction) {
    try {
      // ChatGPT API呼び出し（エラーハンドリング付き）
      const weatherResponse = await getChatCompletion('今日の天気情報を簡潔に教えてください。');
      const newsResponse = await getChatCompletion('最新のAI技術ニュースを簡潔に教えてください。');
      const triviaResponse = await getChatCompletion('ChatGPTに関する豆知識を1つ教えてください。');

      let weatherInfo = '今日は晴れの予報です。外出時は日焼け対策をお忘れなく！';
      let newsInfo = 'AI技術の最新動向について注目が集まっています。';
      let triviaInfo = 'ChatGPTは2022年11月に公開され、世界中で注目を集めています。';

      // APIエラー時のフォールバック処理
      if (weatherResponse.error) {
        console.warn('天気情報取得エラー:', weatherResponse.message);
        if (weatherResponse.fallback_content?.weather) {
          weatherInfo = weatherResponse.fallback_content.weather;
        }
      } else {
        weatherInfo = weatherResponse?.choices?.[0]?.message?.content || weatherInfo;
      }

      if (newsResponse.error) {
        console.warn('ニュース情報取得エラー:', newsResponse.message);
        if (newsResponse.fallback_content?.news) {
          newsInfo = newsResponse.fallback_content.news;
        }
      } else {
        newsInfo = newsResponse?.choices?.[0]?.message?.content || newsInfo;
      }

      if (triviaResponse.error) {
        console.warn('豆知識情報取得エラー:', triviaResponse.message);
        if (triviaResponse.fallback_content?.trivia) {
          triviaInfo = triviaResponse.fallback_content.trivia;
        }
      } else {
        triviaInfo = triviaResponse?.choices?.[0]?.message?.content || triviaInfo;
      }

      const embed = createAdminEmbed(
        '🤖 今日のChatGPT情報',
        '今日のChatGPT関連情報をお届けします！'
      ).addFields(
        {
          name: '🌤️ 天気情報',
          value: weatherInfo,
          inline: false
        },
        {
          name: '📰 ニュース',
          value: newsInfo,
          inline: false
        },
        {
          name: '💡 豆知識',
          value: triviaInfo,
          inline: false
        }
      );

      // API制限エラーがある場合は警告を追加
      const hasErrors = weatherResponse.error || newsResponse.error || triviaResponse.error;
      if (hasErrors) {
        embed.setFooter({ 
          text: '⚠️ 一部の情報はChatGPT APIの制限により取得できませんでした。' 
        });
      }

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (error) {
      console.error('ChatGPTボタン処理エラー:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ ChatGPT機能は現在利用できません。API制限またはネットワークエラーが発生しています。',
          ephemeral: true,
        });
      }
    }
  }
};
