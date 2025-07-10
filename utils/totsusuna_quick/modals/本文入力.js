const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  customId: 'quick_input_modal',

  async handle(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const body = interaction.fields.getTextInputValue('body');
    const uuid = uuidv4();

    // JSONパス
    const dataDir = path.join(__dirname, '../../../data', guildId);
    const dataFile = path.join(dataDir, `${guildId}.json`);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    // 既存読み込み or 初期化
    let json = {};
    if (fs.existsSync(dataFile)) {
      json = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    }

    if (!json.tousuna) json.tousuna = {};
    if (!json.tousuna.instances) json.tousuna.instances = [];

    // 保存情報
    const newInstance = {
      id: uuid,
      body,
      messageChannelId: interaction.channelId,
      replicateChannelIds: [],
    };

    json.tousuna.instances.push(newInstance);
    fs.writeFileSync(dataFile, JSON.stringify(json, null, 2));

    // Embed & ボタン送信
    const embed = new EmbedBuilder()
      .setTitle('📣 凸スナ報告受付中')
      .setDescription(body)
      .setColor(0x00bfff);

    const button = new ButtonBuilder()
      .setCustomId(`tousuna_report_button_${uuid}`)
      .setLabel('凸スナ報告')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    const sentMessage = await interaction.channel.send({
      embeds: [embed],
      components: [row],
    });

    // メッセージID保存
    newInstance.messageId = sentMessage.id;
    fs.writeFileSync(dataFile, JSON.stringify(json, null, 2));

    await interaction.reply({
      content: '✅ 本文を保存し、凸スナボタンを設置しました。',
      flags: InteractionResponseFlags.Ephemeral,
    });
  },
};
