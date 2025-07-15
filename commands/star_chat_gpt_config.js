// commands/star_chat_gpt_config.js
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlagsBitField } = require('discord.js');
const { configManager } = require('../utils/configManager');
const { checkAdmin } = require('../utils/permissions/checkAdmin');
const { createAdminEmbed } = require('../utils/embedHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star_chat_gpt_config')
    .setDescription('STAR ChatGPT の設定を表示または変更します'),
  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        return interaction.editReply({
          embeds: [
            createAdminEmbed('❌ 権限がありません', 'このコマンドを実行するには管理者権限が必要です。')
          ]
        });
      }

      const config = await configManager.getChatGPTConfig(interaction.guildId);

      const embed = createAdminEmbed(
        '🤖 ChatGPT設定管理',
        'ChatGPTの各種設定を管理できます。'
      ).addFields(
        {
          name: '🔧 設定項目',
          value: '• APIキー\n• 最大トークン数\n• 温度設定\n• プロンプト設定',
          inline: false
        },
        {
          name: '📋 現在の状態',
          value: `APIキー: ${config.apiKey ? '✅ 設定済み' : '❌ 未設定'}\n最大トークン: ${config.maxTokens}\n温度: ${config.temperature}`,
          inline: false
        }
      );

      const configButton = new ButtonBuilder()
        .setCustomId('chatgpt_config_button')
        .setLabel('⚙️ 設定変更')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(configButton);

      await interaction.editReply({
        embeds: [embed],
        components: [row],
      });
    } catch (error) {
      console.error('ChatGPT設定コマンドエラー:', error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: '❌ 設定コマンドの実行中にエラーが発生しました。' });
      } else {
        await interaction.reply({ content: '❌ 設定コマンドの実行中にエラーが発生しました。', flags: MessageFlagsBitField.Flags.Ephemeral });
      }
    }
  }
};
