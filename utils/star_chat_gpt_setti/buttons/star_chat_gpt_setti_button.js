// utils/star_chat_gpt_setti/buttons/star_chat_gpt_setti_button.js

const { ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlagsBitField } = require('discord.js');
const { createBaseEmbed, createErrorEmbed, COLORS } = require('../../embedHelper');
const { getChatCompletion } = require('../../openai');
const { safeReply, safeDefer } = require('../../safeReply');

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
 * 指定されたタイプの情報をChatGPTから取得
 * @param {string} type - weather, news, trivia のいずれか
 * @param {string} guildId
 * @returns {Promise<string>} 応答テキスト
 */
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
  // ボタンのcustomIdはプレフィックス形式に統一
  customId: 'star_chat_gpt_setti:main',

  /**
   * ボタン押下時の処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const channel = interaction.channel;

    try {
      // 応答期限をクリアするために defer する
      await safeDefer(interaction);

      // 元のメッセージを削除（可能なら）
      if (interaction.message?.deletable) {
        try {
          await interaction.message.delete();
        } catch (deleteError) {
          if (deleteError.code === 10008) {
            console.log(`[${this.customId}] メッセージは既に削除済みでした: ${interaction.message.id}`);
          } else {
            console.warn(`[${this.customId}] 元メッセージの削除に失敗しました:`, deleteError);
          }
        }
      }

      // ChatGPTから複数情報を並列取得
      const [weather, news, trivia] = await Promise.all([
        fetchInfo('weather', guildId),
        fetchInfo('news', guildId),
        fetchInfo('trivia', guildId),
      ]);

      // Embedを作成
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

      // ボタンを作成（再利用可能な形式で）
      const infoButton = new ButtonBuilder()
        .setCustomId('star_chat_gpt_setti:main')
        .setLabel('🤖 今日のChatGPT')
        .setStyle(ButtonStyle.Primary);

      const configButton = new ButtonBuilder()
        .setCustomId('star_chat_gpt_setti:open_config')
        .setLabel('⚙️ 設定')
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(infoButton, configButton);

      // 新規メッセージをチャンネルに送信
      await channel.send({ embeds: [embed], components: [row] });

      // defer済みなのでここでは応答不要

    } catch (error) {
      console.error('star_chat_gpt_setti_button エラー:', error);

      try {
        await safeReply(interaction, {
          embeds: [createErrorEmbed('処理エラー', 'ChatGPTから情報取得中にエラーが発生しました。')],
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      } catch (replyError) {
        console.error('エラー応答の送信に失敗しました:', replyError);
      }
    }
  },
};
