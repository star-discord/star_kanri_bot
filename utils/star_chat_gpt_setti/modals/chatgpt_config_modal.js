const { logAndReplyError } = require('../../utils/errorHelper');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../utils/fileHelper');
const { createSuccessEmbed } = require('../../utils/embedHelper');

module.exports = {
  customId: 'chatgpt_config_modal',

  async handle(interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({
        content: '⚠️ この操作はサーバー内でのみ実行してください。',
        ephemeral: true,
      });
    }

    try {
      // 応答タイムアウト回避のため、まずdefer
      await interaction.deferReply({ ephemeral: true });

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
        if (!Number.isInteger(maxTokens) || maxTokens <= 0) {
          return await interaction.editReply({ content: '❌ 「1回の最大返答文字数」は正の整数で入力してください。' });
        }
      }

      // temperatureのバリデーション（0以上1以下の範囲で許容）
      let temperature = null;
      if (temperatureRaw !== '') {
        temperature = Number(temperatureRaw);
        if (Number.isNaN(temperature) || temperature < 0 || temperature > 1) {
          return await interaction.editReply({ content: '❌ 「ChatGPTの曖昧さ」は0〜1の範囲で入力してください。' });
        }
      }

      // 空文字はnullとして保存
      data.chatgpt = {
        apiKey: apiKeyRaw !== '' ? apiKeyRaw : null,
        maxTokens,
        temperature,
      };

      await writeJSON(filePath, data);

      const embed = createSuccessEmbed('ChatGPT設定', '設定を保存しました。');

      // deferred済みならeditReply、そうでなければreply
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }

    } catch (error) {
      await logAndReplyError(interaction, error, '設定の保存中にエラーが発生しました。しばらくしてから再試行してください。');
      return;
    }
  },
};
