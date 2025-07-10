// utils/totusuna_setti/modals/本文入力をする.js
const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { v4: uuidv4 } = require('uuid');

module.exports = async function handleContentModal(interaction) {
  const guildId = interaction.guildId;
  const userId = interaction.user.id;
  const inputText = interaction.fields.getTextInputValue('body');

  // 保存先パス
  const dataDir = path.join(__dirname, '../../../data', guildId);
  const dataFile = path.join(dataDir, `${guildId}.json`);

  if (!fs.existsSync(dataFile)) {
    return await interaction.reply({ content: '⚠ 設定ファイルが見つかりません。', ephemeral: true });
  }

  const json = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

  if (!json.totsusuna) json.totsusuna = {};

  // UUIDを生成し、本文と設置チャンネルIDなどを記録
  const uuid = uuidv4();
  json.totsusuna[uuid] = {
    uuid,
    userId,
    body: inputText,
    installChannelId: interaction.channelId,
    replicateChannelIds: [], // 複製先チャンネルがある場合に追加
  };

  // ボタン付きメッセージの送信（Embed）
  const embed = new EmbedBuilder()
    .setTitle('📣 凸スナ報告受付中')
    .setDescription(inputText)
    .setColor(0x00bfff);

  const button = new ButtonBuilder()
    .setCustomId(`tousuna_report_button_${uuid}`)
    .setLabel('凸スナ報告')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);

  const channel = interaction.channel;
  const sent = await channel.send({ embeds: [embed], components: [row] });

  // メッセージIDを保存
  json.totsusuna[uuid].messageId = sent.id;

  // 書き込み保存
  fs.writeFileSync(dataFile, JSON.stringify(json, null, 2), 'utf8');

  // 確認返信
  await interaction.reply({ content: '✅ 本文を保存し、凸スナボタンを設置しました。', ephemeral: true });
};
