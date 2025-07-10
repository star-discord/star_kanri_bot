const {
  SlashCommandBuilder,
  ChannelSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ChannelType,
} = require('discord.js');

const isAdmin = require('../utils/star_config/admin');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設置')
    .setDescription('凸スナ報告ボタン付きメッセージを作成（本文＋設置先設定）'),

  async execute(interaction) {
    if (!isAdmin(interaction)) {
      return await interaction.reply({
        content: '❌ あなたにはこのコマンドを使用する権限がありません。',
        ephemeral: true,
      });
    }

    // UI表示
    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId('tousuna_select_main')
      .setPlaceholder('📌 ボタン設置チャンネルを選択')
      .setMinValues(1)
      .setMaxValues(1)
      .addChannelTypes(ChannelType.GuildText);

    const replicateSelect = new ChannelSelectMenuBuilder()
      .setCustomId('tousuna_select_replicate')
      .setPlaceholder('🌀 複製送信チャンネルを選択（任意・複数）')
      .setMinValues(0)
      .setMaxValues(5)
      .addChannelTypes(ChannelType.GuildText);

    const inputButton = new ButtonBuilder()
      .setCustomId('tousuna_input_body')
      .setLabel('📄 本文入力をする')
      .setStyle(ButtonStyle.Secondary);

    const createButton = new ButtonBuilder()
      .setCustomId('tousuna_create_instance')
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
  },
};
