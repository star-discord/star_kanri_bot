const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const requireAdmin = require('../utils/permissions/requireAdmin');
const { createAdminEmbed } = require('../utils/embedHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設置')
    .setDescription('指定チャンネルに凸スナ案内メッセージとボタンを設置します（管理者専用）'),

  execute: requireAdmin(async (interaction) => {
    try {
      // Deferral is now handled centrally in index.js for this command.
      // This avoids "already replied" errors and deprecation warnings.
      // await interaction.deferReply({ ephemeral: true });

      // 凸スナ設置用のボタンを作成
      const installButton = new ButtonBuilder()
        .setCustomId('totusuna_install_button')
        .setLabel('新規設置')
        .setStyle(ButtonStyle.Primary);

      const configButton = new ButtonBuilder()
        .setCustomId('totusuna_config_button')
        .setLabel('⚙️ 設定管理')
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(installButton, configButton);

      // 管理者向けの案内メッセージ
      const embed = createAdminEmbed(
        '📝 凸スナ設置・管理メニュー',
        '以下のボタンから凸スナの設置・管理を行うことができます。'
      ).addFields(
        {
          name: '📝 新規設置',
          value: 'モーダルから本文やタイトルを細かく設定して、新しい凸スナをチャンネルに設置します。',
          inline: true
        },
        {
          name: '⚙️ 設定管理',
          value: '既存の凸スナの確認、本文の編集、または削除を行います。',
          inline: false
        },
      );

      // editReplyで応答
      await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

    } catch (error) {
      console.error('凸スナ設置コマンドエラー:', error);
      const errorMessage = { content: '❌ 凸スナ設置コマンドの実行中にエラーが発生しました。', ephemeral: true };
      try {
        // Use followUp for safety, as it works for both deferred and replied interactions.
        await interaction.followUp(errorMessage);
      } catch (replyError) {
        console.error('❌ エラー応答の送信に失敗:', replyError);
      }
    }
  })
};
