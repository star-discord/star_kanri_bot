// commands/star_chat_gpt_usage.js

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { checkAdmin } = require('../utils/permissions/checkAdmin');
const { getOpenAIUsage } = require('../utils/openaiUsage');
const { configManager } = require('../utils/configManager');
const {
  createAdminEmbed,
  createErrorEmbed,
  createSuccessEmbed,
} = require('../utils/star_chat_gpt_usage/embedHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star_chat_gpt_使用率')
    .setDescription('今月のOpenAI API使用量を表示します')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      // 管理者権限チェック
      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        const noPermissionEmbed = createAdminEmbed(
          '❌ 権限がありません',
          'この操作は管理者のみ実行可能です。'
        );
        return await interaction.editReply({ embeds: [noPermissionEmbed] });
      }

      const guildId = interaction.guildId;
      const config = await configManager.getChatGPTConfig(guildId);

      // APIキー未設定の場合のエラーメッセージ
      if (!config.apiKey) {
        const noApiKeyEmbed = createErrorEmbed(
          'APIキー未設定',
          'ChatGPTのAPIキーが未設定のため、使用量を取得できません。'
        );
        return await interaction.editReply({ embeds: [noApiKeyEmbed] });
      }

      // OpenAI 使用量取得
      const usageResult = await getOpenAIUsage(config.apiKey);

      if (usageResult.error) {
        const errorEmbed = createErrorEmbed(
          '使用量取得エラー',
          usageResult.message || '不明なエラーが発生しました。'
        );
        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      // 成功メッセージ
      const usageEmbed = createSuccessEmbed(
        '💸 OpenAI 今月の使用量',
        `現在の使用量は **$${usageResult.usage} USD** です。\n\n※この値は OpenAI ダッシュボードから取得された最新データです。`
      );

      await interaction.editReply({ embeds: [usageEmbed] });
    } catch (error) {
      console.error('❌ [star_chat_gpt_使用率] エラー:', error);
      const internalErrorEmbed = createErrorEmbed(
        '内部エラー',
        '処理中にエラーが発生しました。'
      );
      await interaction.editReply({ embeds: [internalErrorEmbed] });
    }
  },
};
