const {
  SlashCommandBuilder,
  ChannelSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  MessageFlags,      // ←ここを追加
} = require('discord.js');
const { InteractionResponseFlags } = require('discord.js');
const isAdmin = require('../utils/star_config/admin');

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
    .setDescription('本文と投稿チャンネルを設定して、凸スナ報告ボタン付きメッセージを作成します。'),

  async execute(interaction) {
    // 管理者チェック
    if (!isAdmin(interaction)) {
      return await interaction.reply({
        content: '❌ このコマンドを使用する権限がありません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    // 📌 投稿先チャンネル選択（1つ）
    const mainChannelSelect = new ChannelSelectMenuBuilder()
      .setCustomId(CUSTOM_IDS.MAIN_CHANNEL)
      .setPlaceholder('📌 ボタンを投稿するチャンネルを選択')
      .setMinValues(1)
      .setMaxValues(1)
      .addChannelTypes(ChannelType.GuildText);

    // 🌀 複製チャンネル選択（任意・複数）
    const replicateChannelSelect = new ChannelSelectMenuBuilder()
      .setCustomId(CUSTOM_IDS.REPLICATE_CHANNEL)
      .setPlaceholder('🌀 複製先チャンネルを選択（最大5件）')
      .setMinValues(0)
      .setMaxValues(5)
      .addChannelTypes(ChannelType.GuildText);

    // 📄 本文入力ボタン（モーダル起動）
    const inputButton = new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.INPUT_BODY)
      .setLabel('📄 本文を入力する')
      .setStyle(ButtonStyle.Secondary);

    // ☑ 設置ボタン（投稿処理を実行）
    const confirmButton = new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.CONFIRM)
      .setLabel('☑ 設置する')
      .setStyle(ButtonStyle.Primary);

    // 各 UI をアクション行にまとめる
    const row1 = new ActionRowBuilder().addComponents(mainChannelSelect);
    const row2 = new ActionRowBuilder().addComponents(replicateChannelSelect);
    const row3 = new ActionRowBuilder().addComponents(inputButton, confirmButton);

    // エフェメラル返信で UI を送信
    await interaction.reply({
      content: '🎯 以下の項目を設定してください。',
      components: [row1, row2, row3],
      flags: MessageFlags.Ephemeral,
    });
  },
};
