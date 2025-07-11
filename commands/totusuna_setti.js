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
    .setDescription('Create a message with a Totsusuna report button (set body and target channels).'),

  async execute(interaction) {
    if (!isAdmin(interaction)) {
      return await interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true
      });
    }

    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId('totusuna_select_main')
      .setPlaceholder('📌 Select the main channel to post the button')
      .setMinValues(1)
      .setMaxValues(1)
      .addChannelTypes(ChannelType.GuildText);

    const replicateSelect = new ChannelSelectMenuBuilder()
      .setCustomId('totusuna_select_replicate')
      .setPlaceholder('🌀 Select channels to replicate post (optional, multiple)')
      .setMinValues(0)
      .setMaxValues(5)
      .addChannelTypes(ChannelType.GuildText);

    const inputButton = new ButtonBuilder()
      .setCustomId('totsusuna_setti:本文入力をする') // ルーティングと合わせる
      .setLabel('📄 Input message body')
      .setStyle(ButtonStyle.Secondary);

    const createButton = new ButtonBuilder()
      .setCustomId('totsusuna_setti:設置する')
      .setLabel('☑ Submit')
      .setStyle(ButtonStyle.Primary);

    const row1 = new ActionRowBuilder().addComponents(channelSelect);
    const row2 = new ActionRowBuilder().addComponents(replicateSelect);
    const row3 = new ActionRowBuilder().addComponents(inputButton, createButton);

    await interaction.reply({
      content: '🎯 Please configure the following settings.',
      components: [row1, row2, row3],
      ephemeral: true
    });
  },
};
