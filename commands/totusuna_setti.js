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
    .setDescription('凸スナ報告ボタンのメッセージを作成します（本文・対象チャンネル設定）'),

  async execute(interaction) {
    try {
      if (!isAdmin(interaction)) {
        return await interaction.reply({
          content: '❌ このコマンドを使用する権限がありません。',
          ephemeral: true,
        });
      }

      const channelSelect = new ChannelSelectMenuBuilder()
        .setCustomId('totsusuna_setti:select_main')
        .setPlaceholder('📌 ボタンを投稿するメインチャンネルを選択してください')
        .setMinValues(1)
        .setMaxValues(1)
        .addChannelTypes(ChannelType.GuildText);

      const replicateSelect = new ChannelSelectMenuBuilder()
        .setCustomId('totsusuna_setti:select_replicate')
        .setPlaceholder('🌀 複製投稿するチャンネルを選択してください（任意、複数選択可）')
        .setMinValues(0)
        .setMaxValues(5)
        .addChannelTypes(ChannelType.GuildText);

      const inputButton = new ButtonBuilder()
        .setCustomId('totsusuna_setti:本文入力をする')
        .setLabel('📄 本文を入力する')
        .setStyle(ButtonStyle.Secondary);

      const createButton = new ButtonBuilder()
        .setCustomId('totsusuna_setti:設置する')
        .setLabel('☑ 設置する')
        .setStyle(ButtonStyle.Primary);

      const row1 = new ActionRowBuilder().addComponents(channelSelect);
      const row2 = new ActionRowBuilder().addComponents(replicateSelect);
      const row3 = new ActionRowBuilder().addComponents(inputButton, createButton);

      await interaction.reply({
        content: '🎯 以下の設定を行ってください。',
        components: [row1, row2, row3],
        ephemeral: true,
      });
    } catch (error) {
      console.error('❌ /凸スナ設置 コマンド実行中にエラーが発生しました:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ コマンド実行中にエラーが発生しました。管理者にお問い合わせください。',
          ephemeral: true,
        });
      }
    }
  },
};
