// utils/star_chat_gpt_setti/buttons/star_chat_gpt_setti_button.js

const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { createBaseEmbed, createErrorEmbed, COLORS } = require('../../embedHelper');
const { getChatCompletion } = require('../../openai');

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

async function fetchInfo(type, guildId) {
  const config = INFO_CONFIG[type];
  if (!config) return '不明な情報タイプです。';

  try {
    const res = await getChatCompletion(config.prompt, guildId);
    if (res.error) return `❌ ${res.message}`;

    return res.choices[0]?.message?.content || '有効な応答がありませんでした。';
  } catch (error) {
    console.error(`[fetchInfo:${type}] Error for guild ${guildId}:`, error);
    return `❌ ${config.error}`;
  }
}

module.exports = {
  customId: 'star_chat_gpt_setti_button',

  /**
   * ボタン押下時の処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const channel = interaction.channel;

    try {
      // 元メッセージを削除（権限があれば）
      if (interaction.message.deletable) {
        await interaction.message.delete();
      }

      // 情報を並列取得
      const [weather, news, trivia] = await Promise.all([
        fetchInfo('weather', guildId),
        fetchInfo('news', guildId),
        fetchInfo('trivia', guildId),
      ]);

      // Embed作成
      const embed = createBaseEmbed({
        title: '🤖 今日のChatGPT情報',
        color: COLORS.SUCCESS,
      })
        .addFields(
          { name: '☀️ 天気', value: weather.slice(0, 1024) },
          { name: '📰 ニュース', value: news.slice(0, 1024) },
          { name: '💡 豆知識', value: trivia.slice(0, 1024) },
        )
        .setFooter({ text: 'Powered by OpenAI' });

      // ボタンを再作成
      const infoButton = new ButtonBuilder()
        .setCustomId('star_chat_gpt_setti_button')
        .setLabel('🤖 今日のChatGPT')
        .setStyle(ButtonStyle.Primary);

      const configButton = new ButtonBuilder()
        .setCustomId('chatgpt_config_button')
        .setLabel('⚙️ 設定')
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(infoButton, configButton);

      // 新メッセージをチャンネルに送信
      await channel.send({ embeds: [embed], components: [row] });

      // ボタン押下応答は更新なしでACKのみ（重複応答回避）
      await interaction.deferUpdate();

    } catch (error) {
      console.error('star_chat_gpt_setti_button エラー:', error);

      // エラー時は可能なら返信
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          embeds: [createErrorEmbed('処理エラー', 'ChatGPTから情報取得中にエラーが発生しました。')],
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed('処理エラー', 'ChatGPTから情報取得中にエラーが発生しました。')],
          ephemeral: true,
        });
      }
    }
  },
};
