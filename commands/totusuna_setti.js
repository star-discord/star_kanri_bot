const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const requireAdmin = require('../utils/permissions/requireAdmin');
const { createAdminEmbed } = require('../utils/embedHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設置')
    .setDescription('指定チャンネルに凸スナ案内メッセージとボタンを設置します（管理者専用）'),

  execute: requireAdmin(async (interaction) => {
    try {
      // 3秒ルール対策: 最初にdeferReply（flagsではなく ephemeral を使用）
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral: true });
      }

      // 凸スナ設置用のボタンを作成
      const installButton = new ButtonBuilder()
        .setCustomId('totusuna_install_button')
        .setLabel('📝 凸スナ設置')
        .setStyle(ButtonStyle.Primary);

      const configButton = new ButtonBuilder()
        .setCustomId('totusuna_config_button')
        .setLabel('⚙️ 設定管理')
        .setStyle(ButtonStyle.Secondary);

      const quickButton = new ButtonBuilder()
        .setCustomId('totusuna_quick_button')
        .setLabel('⚡ クイック設置')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(installButton, configButton, quickButton);

      // 管理者向けの案内メッセージ
      const embed = createAdminEmbed(
        '📝 凸スナ設置メニュー',
        '以下のボタンから凸スナの設置・管理を行うことができます。'
      ).addFields(
        {
          name: '📝 凸スナ設置',
          value: '新しい凸スナを作成してチャンネルに設置します',
          inline: false
        },
        {
          name: '⚙️ 設定管理',
          value: '既存の凸スナの確認・編集・削除を行います',
          inline: false
        },
        {
          name: '⚡ クイック設置',
          value: 'テンプレートを使用して素早く凸スナを設置します',
          inline: false
        }
      );

      // editReplyで応答
      await interaction.editReply({
        embeds: [embed],
        components: [row]
      });

    } catch (error) {
      console.error('凸スナ設置コマンドエラー:', error);
      // 二重応答防止
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ 凸スナ設置コマンドの実行中にエラーが発生しました。',
          ephemeral: true
        });
      } else if (interaction.deferred && !interaction.replied) {
        await interaction.editReply({
          content: '❌ 凸スナ設置コマンドの実行中にエラーが発生しました。',
          ephemeral: true
        });
      } else {
        await interaction.followUp({
          content: '❌ 凸スナ設置コマンドの実行中にエラーが発生しました。',
          ephemeral: true
        });
      }
    }
  })
};
