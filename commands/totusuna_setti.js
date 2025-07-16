// commands/totusuna_setti.js

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlagsBitField,
} = require('discord.js');
const { safeReply, safeDefer } = require('../utils/safeReply');
const { checkAdmin } = require('../utils/permissions/checkAdmin');
const { logAndReplyError } = require('../utils/errorHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設置')
    .setDescription('凸スナ報告メッセージを新規設置・管理する（管理者専用）'),

  async execute(interaction) {
    try {
      // 遅延応答を確保（Unknown interaction対策）
      await safeDefer(interaction, { flags: MessageFlagsBitField.Flags.Ephemeral });

      // 管理者チェック
      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        return await safeReply(interaction, {
          content: '❌ このコマンドは管理者のみ使用可能です。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      }

      // Embed作成
      const embed = new EmbedBuilder()
        .setTitle('📌 凸スナ設置・管理メニュー')
        .setDescription([
          '🆕 新しい凸スナ報告メッセージを設置するには、「新規設置」ボタンを押してください。',
          '🛠️ 既存の投稿を管理する場合は、「管理」ボタンをご利用ください。',
          '❓ 操作方法の確認や、📄 CSV出力もこちらから可能です。'
        ].join('\n'))
        .setColor(0x2ecc71);

      // ボタン構成（2列）
      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('totusuna_install_button')
          .setLabel('新規設置')
          .setEmoji('🆕')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('totusuna_manage_button')
          .setLabel('管理')
          .setEmoji('🛠️')
          .setStyle(ButtonStyle.Secondary)
      );

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('totusuna_help_button')
          .setLabel('ヘルプ')
          .setEmoji('❓')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('totusuna_csv_button')
          .setLabel('CSV出力')
          .setEmoji('📄')
          .setStyle(ButtonStyle.Success)
      );

      // 応答送信
      await safeReply(interaction, {
        embeds: [embed],
        components: [row1, row2],
      });

    } catch (error) {
      await logAndReplyError(interaction, error, '❌ 処理中にエラーが発生しました。');
    }
  }
};
