// utils/totusuna_setti/modals/inputModal.js
const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async handle(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const inputText = interaction.fields.getTextInputValue('body');

    // データ読み込み
    const dataDir = path.join(__dirname, '../../../data', guildId);
    const dataFile = path.join(dataDir, `${guildId}.json`);
    if (!fs.existsSync(dataFile)) {
      return await interaction.reply({ content: '⚠ 設定ファイルが見つかりません。', ephemeral: true });
    }

    const json = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

    if (!json.totsusuna) json.totsusuna = {};
    const uuid = uuidv4();

    // 保存：uuidキーで本文と設置先情報
    json.totsusuna[uuid] = {
      uuid,
      body: inputText,
      installChannelId: interaction.channelId,
      replicateChannelIds: [], // 設定未対応なら空
    };

    // 書き込み
    fs.writeFileSync(dataFile, JSON.stringify(json, null, 2));

    // Embedとボタンで送信
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

    // UUIDにメッセージIDを追記
    json.totsusuna[uuid].messageId = sent.id;
    fs.writeFileSync(dataFile, JSON.stringify(json, null, 2));

    await interaction.reply({ content: '✅ 本文を保存し、凸スナボタンを設置しました。', ephemeral: true });
  },
};
