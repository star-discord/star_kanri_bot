const { EmbedBuilder } = require('discord.js');
const { getChatCompletion } = require('../../openai');
const { createErrorEmbed, createBaseEmbed, COLORS } = require('../../embedHelper');
const { configManager } = require('../../configManager');
const { getOpenAIUsage } = require('../../openaiUsage');

// プロンプトとエラーメッセージを集中管理
const INFO_CONFIG = {
  weather: {
    prompt: '今日の東京の天気は？',
    error: '天気情報の取得に失敗しました。',
  },
  news: {
    prompt: '今日の主要なニュースを3つ教えて',
    error: 'ニュースの取得に失敗しました。',
  },
  trivia: {
    prompt: '面白い豆知識を一つ教えて',
    error: '豆知識の取得に失敗しました。',
  },
};

/**
 * OpenAIから指定された情報を取得する汎用関数
 * @param {'weather' | 'news' | 'trivia'} type - 取得する情報の種類
 * @returns {Promise<string>}
 */
async function fetchInfo(type) {
  const config = INFO_CONFIG[type];
  if (!config) return '不明な情報タイプです。';

  try {
    const res = await getChatCompletion(config.prompt);
    if (res.error) return `❌ ${res.message}`;

    return res.choices[0]?.message?.content || '有効な応答がありませんでした。';
  } catch (error) {
    console.error(`[fetchInfo:${type}] Error:`, error);
    return `❌ ${config.error}`;
  }
}

module.exports = {
  customId: 'star_chat_gpt_setti_button',
  /**
   * ChatGPT情報ボタンのインタラクションを処理します。
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;

    // タイムアウトを防ぐために、すぐに応答を遅延させます。
    await interaction.deferReply();

    try {
      // 全てのデータを並行して取得します。
      const [weather, news, trivia, usageInfo] = await Promise.all([
        fetchInfo('weather'),
        fetchInfo('news'),
        fetchInfo('trivia', guildId), // 修正: ギルドIDを渡す
        // fetchUsageInfo(guildId),  // 使用量表示は一旦削除
      ]);

      const embed = createBaseEmbed({
        title: '🤖 今日のChatGPT情報',
        color: COLORS.SUCCESS,
      })
        .addFields(
          { name: '☀️ 天気', value: weather.slice(0, 1024) },
          { name: '📰 ニュース', value: news.slice(0, 1024) },  
          { name: '💡 豆知識', value: trivia.slice(0, 1024) },  
          // { name: '📊 使用量', value: usageInfo.slice(0, 1024) } // 使用量表示は一旦削除
        )
        .setFooter({ text: 'Powered by OpenAI' }); // フッターを上書き

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('ChatGPTボタン処理エラー:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('処理エラー', 'ChatGPTからの情報取得中に予期せぬエラーが発生しました。')]
      });
    }
  }
};