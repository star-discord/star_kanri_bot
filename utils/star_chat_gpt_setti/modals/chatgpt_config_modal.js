const { MessageFlagsBitField } = require('discord.js');
const { logAndReplyError } = require('../../../utils/errorHelper');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../../utils/fileHelper');
const { createSuccessEmbed } = require('../../../utils/embedHelper');

module.exports = {
  customId: 'star_chatgpt_setti_modal',

  async handle(interaction) {
    console.log('[star_chatgpt_setti_modal] 処理開始:', { user: interaction.user.tag, guild: interaction.guildId });

    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({
        content: '⚠️ この操作はサーバー内でのみ実行してください。',
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
    }

    try {
      // 応答タイムアウト回避のため、まずdefer
      await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

      const filePath = await ensureGuildJSON(guildId);
      const data = await readJSON(filePath);

      // ユーザー入力を取得しtrim
      const apiKeyRaw = interaction.fields.getTextInputValue('chatgpt_api_key')?.trim() ?? '';
      const maxTokensRaw = interaction.fields.getTextInputValue('chatgpt_max_tokens')?.trim() ?? '';
      const temperatureRaw = interaction.fields.getTextInputValue('chatgpt_temperature')?.trim() ?? '';

      // maxTokensのバリデーション（正の整数のみ許容、小数不可）
      let maxTokens = null;
      if (maxTokensRaw !== '') {
        maxTokens = Number(maxTokensRaw);
        if (
          !Number.isInteger(maxTokens) ||
          !Number.isSafeInteger(maxTokens) ||
          maxTokens <= 0 ||
          maxTokens > 8192 // OpenAI APIのモデル上限を考慮
        ) {
          await interaction.editReply({
            content: '❌ 「1回の最大返答文字数」は **1〜8192の範囲の整数** で入力してください。',
          });
          return;
        }
      }

      // temperatureのバリデーション（0以上1以下の範囲で許容）
      let temperature = null;
      if (temperatureRaw !== '') {
        if (isNaN(temperatureRaw)) {
          await interaction.editReply({ content: '❌ 「ChatGPTの曖昧さ」は **数値を入力してください**。' });
          return;
        }
        temperature = Number(temperatureRaw);
        if (Number.isNaN(temperature) || temperature < 0 || temperature > 1) {
          await interaction.editReply({ content: '❌ 「ChatGPTの曖昧さ」は **0〜1の範囲で入力してください**。' });
          return;
        }
      }

      // 空文字はnullとして保存
      data.chatgpt = {
        apiKey: apiKeyRaw !== '' ? apiKeyRaw : null,
        maxTokens,
        temperature,
      };

      await writeJSON(filePath, data); // ファイル書き込み

      const embed = createSuccessEmbed('ChatGPT設定', '設定を保存しました。');

      // deferred済みならeditReply、そうでなければreply
      if (interaction.deferred || interaction.replied) {
        console.log('[star_chatgpt_setti_modal] 処理完了 - 設定更新 (editReply):',
          { apiKey: data.chatgpt.apiKey, maxTokens: data.chatgpt.maxTokens, temperature: data.chatgpt.temperature });

        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.reply({ embeds: [embed], flags: MessageFlagsBitField.Flags.Ephemeral });
      }

    } catch (error) {
      await logAndReplyError(
        interaction,
        error,
        '❌ 設定の保存中にエラーが発生しました。'
      );
    }
  },
};
