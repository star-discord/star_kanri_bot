// utils/star_chat_gpt_config/modals/config_modal.js

const { getChatGPTConfig, saveChatGPTConfig } = require('../configManager');
const { validateMaxTokens, validateTemperature } = require('../validators');
const { safeReply } = require('../../safeReply');
const { MessageFlagsBitField, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  customId: 'star_chat_gpt_config_modal',

  async handle(interaction) {
    try {
      const apiKey = interaction.fields.getTextInputValue('star_chat_gpt_config_api_key')?.trim();
      const maxTokensStr = interaction.fields.getTextInputValue('max_tokens');
      const temperatureStr = interaction.fields.getTextInputValue('temperature');

      const maxTokens = Number(maxTokensStr);
      const temperature = Number(temperatureStr);

      if (!validateMaxTokens(maxTokens)) {
        return await safeReply(interaction, {
          content: '❌ 「1回の最大返答文字数」は正の整数で入力してください。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      }

      if (!validateTemperature(temperature)) {
        return await safeReply(interaction, {
          content: '❌ 「ChatGPTの曖昧さ」は0〜1の数値で入力してください。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      }

      const config = await getChatGPTConfig(interaction.guildId);
      config.maxTokens = maxTokens;
      config.temperature = temperature;
      if (apiKey) {
        config.apiKey = apiKey;
      }
      await saveChatGPTConfig(interaction.guildId, config);

      // ログメッセージ作成
      const logMessage = `🤖 ChatGPT設定が更新されました\n- 最大トークン数: ${maxTokens}\n- 曖昧さ: ${temperature}\n- APIキー: ${apiKey ? '設定済み（非表示）' : '未設定'}`;

      // テキストチャンネル一覧から選択用のセレクトメニュー作成
      const textChannels = interaction.guild.channels.cache
        .filter(c => c.isTextBased())
        .map(c => ({
          label: c.name,
          description: `ID: ${c.id}`,
          value: c.id,
        })).slice(0, 25); // Discordの選択肢は最大25件

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_chat_channels')
        .setPlaceholder('ChatGPTを有効にするチャンネルを選択 (複数可)')
        .setMinValues(1)
        .setMaxValues(Math.min(textChannels.length, 25))
        .addOptions(textChannels);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      // モーダル送信チャンネルにログ＋セレクトメニュー付きメッセージ送信
      await interaction.channel.send({ content: logMessage, components: [row] });

      // ユーザーにはエフェメラルで完了通知
      await safeReply(interaction, {
        content: '✅ 設定を受け付けました。下のメッセージからチャンネルを選択してください。',
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });

    } catch (error) {
      console.error(`⚠️ ChatGPT設定モーダル処理エラー (Guild: ${interaction.guildId}):`, error);
      await safeReply(interaction, {
        content: '❌ 設定の保存または表示に失敗しました。時間を置いて再度お試しください。',
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
    }
  },
};
