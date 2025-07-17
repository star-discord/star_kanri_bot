const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlagsBitField } = require('discord.js');
const { checkAdmin } = require('../utils/permissions/checkAdmin');
const { createAdminEmbed } = require('../utils/embedHelper');
const { idManager } = require('../utils/idManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star_chat_gpt_setti')
    .setDescription('指定チャンネルにChatGPT案内メッセージとボタンを設置します'),

  async execute(interaction) {
    try {
      // 3秒ルール回避のため、ephemeralフラグ付きで遅延応答
      await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        return await interaction.editReply({
          embeds: [createAdminEmbed('❌ 権限がありません', 'このコマンドは管理者専用です。')],
        });
      }

      // ボタンの customId を明確に統一
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(idManager.createButtonId('star_chat_gpt_setti', 'today_gpt'))
          .setLabel('🤖 今日のChatGPT')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(idManager.createButtonId('star_chat_gpt_setti', 'open_config'))
          .setLabel('⚙️ 設定')
          .setStyle(ButtonStyle.Secondary)
      );

      const content = `🤖 **ChatGPT案内**\n以下のボタンを押すと、「天気」「ニュース」「豆知識」などの情報が届きます。`;

      await interaction.editReply({ content, components: [row] });

    } catch (error) {
      console.error('star_chat_gpt_setti 実行エラー:', error);

      // 重複応答を避けるため、応答状態をチェック
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: '❌ エラーが発生しました。再度お試しください。',
        });
      } else {
        await interaction.reply({
          content: '❌ エラーが発生しました。再度お試しください。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      }
    }
  },
};
