// commands/star_chat_gpt_config.js

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlagsBitField,
} = require('discord.js');
const { configManager } = require('../utils/configManager');
const { checkAdmin } = require('../utils/permissions/checkAdmin');
const { createAdminEmbed } = require('../utils/embedHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star_chat_gpt_config')
    .setDescription('STAR ChatGPT の設定を表示または変更します'),

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        return await interaction.editReply({
          embeds: [
            createAdminEmbed(
              '❌ 権限がありません',
              'このコマンドはサーバー管理者のみが実行できます。'
            )
          ]
        });
      }

      const config = await configManager.getChatGPTConfig(interaction.guildId);

      const embed = createAdminEmbed(
        '🤖 ChatGPT設定管理',
        'ChatGPTの各種設定を以下の通り表示しています。'
      ).addFields(
        {
          name: '🔧 設定項目',
          value: '• APIキー\n• 最大トークン数\n• 温度設定\n• プロンプト（未表示）',
        },
        {
          name: '📋 現在の状態',
          value: [
            `APIキー: ${config.apiKey ? '✅ 設定済み' : '❌ 未設定'}`,
            `最大トークン数: ${config.maxTokens ?? '未設定'}`,
            `温度: ${config.temperature ?? '未設定'}`,
          ].join('\n'),
        }
      );

      const configButton = new ButtonBuilder()
        .setCustomId('star_chat_gpt:config')  // 名前空間風に明示
        .setLabel('⚙️ 設定を変更する')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(configButton);

      await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

    } catch (error) {
      console.error('[star_chat_gpt_config] コマンド実行エラー:', error);

      const errorMessage = {
        content: '❌ 設定の取得中にエラーが発生しました。',
        flags: MessageFlagsBitField.Flags.Ephemeral,
      };

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  },
};
