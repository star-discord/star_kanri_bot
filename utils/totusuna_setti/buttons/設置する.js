const fs = require('fs');
const path = require('path');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const tempState = require('../../state/totsusunaTemp');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../../fileHelper');

module.exports = async (interaction) => {
  const guildId = interaction.guildId;
  const userId = interaction.user.id;
  const state = tempState.get(guildId, userId);

  if (!state || !state.body || !state.installChannelId) {
    return await interaction.reply({
      content: '⚠ 本文やチャンネル設定が不足しています。',
      ephemeral: true
    });
  }

  const uuid = uuidv4();

  const embed = new EmbedBuilder()
    .setTitle('📣 凸スナ報告受付中')
    .setDescription(state.body)
    .setColor(0x00bfff);

  const button = new ButtonBuilder()
    .setCustomId(`totusuna:report:${uuid}`)
    .setLabel('凸スナ報告')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);

  const installChannel = await interaction.guild.channels.fetch(state.installChannelId);
  const sentMessage = await installChannel.send({
    embeds: [embed],
    components: [row],
  });

  // JSON保存
  const jsonPath = ensureGuildJSON(guildId);
  const json = readJSON(jsonPath);

  if (!json.totusuna) json.totusuna = {};
  if (!json.totusuna.instances) json.totusuna.instances = {};

  json.totusuna.instances[uuid] = {
    uuid,
    userId,
    body: state.body,
    installChannelId: state.installChannelId,
    replicateChannelIds: state.replicateChannelIds || [],
    messageId: sentMessage.id
  };

  writeJSON(jsonPath, json);

  tempState.delete(guildId, userId);

  await interaction.reply({
    content: '✅ 凸スナ設置が完了しました！',
    ephemeral: true
  });
};
