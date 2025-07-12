const {
  SlashCommandBuilder,
  ChannelSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  InteractionResponseFlags,
} = require('discord.js');

const requireAdmin = require('../utils/permissions/requireAdmin.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設置')
    .setDescription('凸スナ報告ボタンのメッセージを作成します（本文・対象チャンネル設定）'),

  execute: requireAdmin(async (interaction) => {
    try {
      const channelSelect = new ChannelSelectMenuBuilder()
        .setCustomId('totusuna_select_main')
        .setPlaceholder('📌 ボタンを投稿するメインチャンネルを選択してください')
        .setMinValues(1)
        .setMaxValues(1)
        .addChannelTypes(ChannelType.GuildText);

      const replicateSelect = new ChannelSelectMenuBuilder()
        .setCustomId('totusuna_select_replicate')
        .setPlaceholder('🌀 複製投稿するチャンネルを選択してください（任意、複数選択可）')
        .setMinValues(0)
        .setMaxValues(5)
        .addChannelTypes(ChannelType.GuildText);

      const inputButton = new ButtonBuilder()
        .setCustomId('totsusuna_setti:input_body')
        .setLabel('📄 本文を入力する')
        .setStyle(ButtonStyle.Secondary);

      const createButton = new ButtonBuilder()
        .setCustomId('totsusuna_setti:install')
        .setLabel('☑ 設置する')
        .setStyle(ButtonStyle.Primary);

      const row1 = new ActionRowBuilder().addComponents(channelSelect);
      const row2 = new ActionRowBuilder().addComponents(replicateSelect);
      const row3 = new ActionRowBuilder().addComponents(inputButton, createButton);

      const embed = new EmbedBuilder()
        .setTitle('凸スナ設置設定')
        .setDescription('🎯 以下の設定を行ってください。')
        .setColor(0x00AE86)
        .setFooter({ text: 'STAR管理bot' })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
        components: [row1, row2, row3],
        flags: InteractionResponseFlags.Ephemeral,
      });
    } catch (error) {
      console.error(`❌ /凸スナ設置 コマンド実行中にエラーが発生しました: user=${interaction.user.tag}`, error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ コマンド実行中にエラーが発生しました。管理者にお問い合わせください。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }
    }
  }),
};
