// utils/totusuna_setti/modals/本文入力をする.js

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../../utils/fileHelper');
const tempStore = require('../tempStore'); // 一時メモリストア

module.exports = async function handleContentModal(interaction) {
  const guildId = interaction.guildId;
  const userId = interaction.user.id;
  const inputText = interaction.fields.getTextInputValue('body');

  // JSON読み込み
  const jsonPath = ensureGuildJSON(guildId);
  const json = readJSON(jsonPath);

  if (!json.tousuna) json.tousuna = {};
  if (!json.tousuna.instances) json.tousuna.instances = {};

  const userData = tempStore.get(guildId, userId);
  if (!userData?.installChannelId) {
    return await interaction.reply({
      content: '⚠ 設置チャンネルが未設定です。先にチャンネルを選択してください。',
      ephemeral: true
    });
  }

  const uuid = uuidv4();

  // インスタンス保存
  json.tousuna.instances[uuid] = {
    uuid,
    userId,
    body: inputText,
    installChannelId: userData.installChannelId,
    replicateChannelIds: userData.replicateChannelIds || []
  };

  // Embed + ボタン作成
  const embed = new EmbedBuilder()
    .setTitle('📣 凸スナ報告受付中')
    .setDescription(inputText)
    .setColor(0x00bfff);

  const button = new ButtonBuilder()
    .setCustomId(`tousuna_report_button_${uuid}`)
    .setLabel('凸スナ報告')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);

  const targetChannel = interaction.guild.channels.cache.get(userData.installChannelId);
  if (!targetChannel) {
    return await interaction.reply({
      content: '⚠ 指定された設置チャンネルが見つかりません。',
      ephemeral: true
    });
  }

  const sentMessage = await targetChannel.send({
    embeds: [embed],
    components: [row]
  });

  // メッセージID保存
  json.tousuna.instances[uuid].messageId = sentMessage.id;

  // JSON保存
  writeJSON(jsonPath, json);

  await interaction.reply({
    content: '✅ 本文を保存し、凸スナボタンを設置しました。',
    ephemeral: true
  });
};
