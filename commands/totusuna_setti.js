// commands/totusuna_setti.js

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlagsBitField } = require('discord.js');
const { checkAdmin } = require('../utils/permissions/checkAdmin');
const { createAdminEmbed, createAdminRejectEmbed } = require('../utils/embedHelper');
const { logAndReplyError } = require('../utils/errorHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設置')
    .setDescription('指定チャンネルに凸スナ案内メッセージとボタンを設置します（管理者専用）'),

  async execute(interaction) {
    try {
      // 軽量コマンドなので deferReply は行わない（中央ハンドラが defer していない前提）
      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        return await interaction.reply({
          embeds: [createAdminRejectEmbed()],
          flags: MessageFlagsBitField.Flags.Ephemeral
        });
      }

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
        { name: '📝 新規設置',
          value: 'モーダルから本文やタイトルを細かく設定して、新しい凸スナをチャンネルに設置します。',
          inline: true },
        {
          name: '⚙️ 設定管理',
          value: '既存の凸スナの確認、本文の編集、または削除を行います。',
          inline: false
        }
      );

      await interaction.reply({
        embeds: [embed],
        components: [row],
        flags: MessageFlagsBitField.Flags.Ephemeral
      });

    } catch (error) {
      console.error('凸スナ設置コマンドエラー:', error);
      try {
        const errorMessage = {
          content: '❌ 処理中にエラーが発生しました。',
          embeds: [],
          components: [],
          flags: MessageFlagsBitField.Flags.Ephemeral
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.editReply(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      } catch (replyError) {
        console.error('❌ エラー応答の送信に失敗:', replyError);
      }
    }
  }
};
