// commands/totusuna_setti.js

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlagsBitField } = require('discord.js');
const { checkAdmin } = require('../utils/permissions/checkAdmin');
const { createAdminEmbed, createAdminRejectEmbed } = require('../utils/embedHelper');
const { safeReply, safeDefer } = require('../utils/safeReply');
const { logAndReplyError } = require('../utils/errorHelper'); // logAndReplyErrorも必要

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設置')
    .setDescription('凸スナの設置・管理メニューを表示します'),

  async execute(interaction) {
    try {
      // 先に遅延応答を確保
      await safeDefer(interaction, { flags: MessageFlagsBitField.Flags.Ephemeral });

      // 管理者権限チェック
      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        return await safeReply(interaction, {
          embeds: [createAdminRejectEmbed()],
        });
      }

      // ボタン定義
      const installButton = new ButtonBuilder()
        .setCustomId('totusuna_install_button')
        .setLabel('📝 新規設置')
        .setStyle(ButtonStyle.Primary);

      const configButton = new ButtonBuilder()
        .setCustomId('totusuna_config_button')
        .setLabel('⚙️ 設定管理')
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(installButton, configButton);

      // Embed生成
      const embed = createAdminEmbed(
        '📝 凸スナ設置・管理メニュー',
        '以下のボタンから凸スナの設置・管理を行うことができます。'
      ).addFields(
        { name: '📝 新規設置', value: 'モーダルから本文やタイトルを細かく設定して、新しい凸スナをチャンネルに設置します。', inline: true },
        { name: '⚙️ 設定管理', value: '既存の凸スナの確認、本文の編集、または削除を行います。', inline: false }
      );

      // 最終応答
      await safeReply(interaction, {
        embeds: [embed],
        components: [row],
      });

    } catch (error) {
      await logAndReplyError(interaction, error, '❌ コマンドの実行中にエラーが発生しました。');
    }
  }
};
