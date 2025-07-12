const {
  SlashCommandBuilder,
  ChannelSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  MessageFlags,
  PermissionFlagsBits
} = require('discord.js');
const requireAdmin = require('../utils/permissions/requireAdmin');
const { logAndReplyError } = require('./errorHelper');
const { createAdminEmbed } = require('./embedHelper');

// customId を定数で定義（再利用しやすく、typo防止）
const CUSTOM_IDS = {
  MAIN_CHANNEL: 'totusuna_select_main',
  REPLICATE_CHANNEL: 'totusuna_select_replicate',
  INPUT_BODY: 'totsusuna_setti:input_body',
  CONFIRM: 'totsusuna_setti:install',
};


module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設置')
    .setDescription('管理者専用：本文・投稿/複製チャンネルを選択し、凸スナ報告ボタン付きUIを設置します。')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  execute: requireAdmin(async (interaction) => {
    try {
      // 📌 投稿先チャンネル選択（1つ）

      const mainChannelSelect = new ChannelSelectMenuBuilder()
        .setCustomId(CUSTOM_IDS.MAIN_CHANNEL)
        .setPlaceholder('📌 ボタンを投稿するチャンネルを選択')
        .setMinValues(1)
        .setMaxValues(1)
        .addChannelTypes(ChannelType.GuildText);

      const replicateChannelSelect = new ChannelSelectMenuBuilder()
        .setCustomId(CUSTOM_IDS.REPLICATE_CHANNEL)
        .setPlaceholder('🌀 複製先チャンネルを選択（最大5件）')
        .setMinValues(0)
        .setMaxValues(5)
        .addChannelTypes(ChannelType.GuildText);


      // アクセシビリティ向上: ラベルに絵文字＋テキストを併用
      // 状況に応じて .setDisabled(true) で多重送信・誤操作防止も可能
      const inputButton = new ButtonBuilder()
        .setCustomId(CUSTOM_IDS.INPUT_BODY)
        .setLabel('📄 本文入力 / Edit Body')
        .setStyle(ButtonStyle.Secondary)
        // .setDisabled(false) // 例: 条件に応じて無効化
        ;

      const confirmButton = new ButtonBuilder()
        .setCustomId(CUSTOM_IDS.CONFIRM)
        .setLabel('☑ 設置する / Confirm')
        .setStyle(ButtonStyle.Primary)
        // .setDisabled(false) // 例: 条件に応じて無効化
        ;

      // 各 UI をアクション行にまとめる
      const row1 = new ActionRowBuilder().addComponents(mainChannelSelect);
      const row2 = new ActionRowBuilder().addComponents(replicateChannelSelect);
      const row3 = new ActionRowBuilder().addComponents(inputButton, confirmButton);

      // エフェメラル返信で UI を送信
      await interaction.reply({
        embeds: [createAdminEmbed('凸スナ設置', '🎯 以下の項目を設定してください。')],
        components: [row1, row2, row3],
        flags: MessageFlags.Ephemeral,
      });
      console.info(`[interactionHandler] 凸スナ設置UI生成 success: user=${interaction.user.tag}`);
    } catch (err) {
      await logAndReplyError(
        interaction,
        `❌ interactionHandler.js UI生成エラー\n${err?.stack || err}`,
        '❌ UI生成中にエラーが発生しました。管理者にご連絡ください。',
        { flags: MessageFlags.Ephemeral }
      );
    }
  })
};
