const { EmbedBuilder } = require('discord.js');
const { getChatCompletion } = require('../../openai');
const { createErrorEmbed } = require('../../embedHelper');

/**
 * Fetches weather information from OpenAI.
 * @returns {Promise<string>}
 */
async function getWeather() {
  const res = await getChatCompletion('今日の東京の天気は？');
  if (res.error) throw new Error(res.message);
  return res.choices[0].message.content;
}

/**
 * Fetches news from OpenAI.
 * @returns {Promise<string>}
 */
async function getNews() {
  const res = await getChatCompletion('今日の主要なニュースを3つ教えて');
  if (res.error) throw new Error(res.message);
  return res.choices[0].message.content;
}

/**
 * Fetches trivia from OpenAI.
 * @returns {Promise<string>}
 */
async function getTrivia() {
  const res = await getChatCompletion('面白い豆知識を一つ教えて');
  if (res.error) throw new Error(res.message);
  return res.choices[0].message.content;
}

module.exports = {
  customId: 'star_chat_gpt_setti_button',
  /**
   * Handles the ChatGPT info button interaction.
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    // Defer the reply immediately to prevent timeout.
    await interaction.deferReply();

    try {
      // Fetch all data in parallel.
      const [weather, news, trivia] = await Promise.all([
        getWeather().catch(e => `天気情報取得エラー: ${e.message}`),
        getNews().catch(e => `ニュース取得エラー: ${e.message}`),
        getTrivia().catch(e => `豆知識取得エラー: ${e.message}`)
      ]);

      const embed = new EmbedBuilder()
        .setTitle('🤖 今日のChatGPT情報')
        .addFields(
          { name: '☀️ 天気', value: weather.slice(0, 1024) },
          { name: '📰 ニュース', value: news.slice(0, 1024) },
          { name: '💡 豆知識', value: trivia.slice(0, 1024) }
        )
        .setColor(0x00ff00)
        .setFooter({ text: 'Powered by OpenAI' });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('ChatGPTボタン処理エラー:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('処理エラー', 'ChatGPTからの情報取得中に予期せぬエラーが発生しました。')]
      });
    }
  }
};