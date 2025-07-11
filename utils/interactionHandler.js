const {
  SlashCommandBuilder,
  ChannelSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');

const isAdmin = require('../utils/star_config/admin');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設置')
    .setDescription('本文と対象チャンネルを設定して、凸スナ報告ボタン付きのメッセージを作成します。'),

  async execute(interaction) {
    // 管理者権限をチェック
    if (!isAdmin(interaction)) {
      return await interaction.reply({
        content: '❌ このコマンドを使用する権限がありません。',
        ephemeral: true
      });
    }

    // 📌 本文を投稿するチャンネル選択メニュー（1つだけ）
    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId('totusuna_select_main')
      .setPlaceholder('📌 ボタンを投稿するチャンネルを選択')
      .setMinValues(1)
      .setMaxValues(1)
      .addChannelTypes(ChannelType.GuildText);

    // 🌀 複製投稿するチャンネル選択メニュー（任意・複数可）
    const replicateSelect = new ChannelSelectMenuBuilder()
      .setCustomId('totusuna_select_replicate')
      .setPlaceholder('🌀 複製先チャンネルを選択（任意・複数）')
      .setMinValues(0)
      .setMaxValues(5)
      .addChannelTypes(ChannelType.GuildText);

    // 📄 本文入力用ボタン（モーダル起動）
    const inputButton = new ButtonBuilder()
      .setCustomId('totsusuna_setti:本文入力をする') // ボタンハンドラーのルーティングと一致させる
      .setLabel('📄 本文を入力する')
      .setStyle(ButtonStyle.Secondary);

    // ☑ 設定を確定して投稿するボタン
    const createButton = new ButtonBuilder()
      .setCustomId('totsusuna_setti:設置する')
      .setLabel('☑ 設置する')
      .setStyle(ButtonStyle.Primary);

    // 各コンポーネントを ActionRow にまとめる
    const row1 = new ActionRowBuilder().addComponents(channelSelect);
    const row2 = new ActionRowBuilder().addComponents(replicateSelect);
    const row3 = new ActionRowBuilder().addComponents(inputButton, createButton);

    // UI を返信（エフェメラル）
    await interaction.reply({
      content: '🎯 以下の設定を行ってください。',
      components: [row1, row2, row3],
      ephemeral: true
    });
  },
};

};
