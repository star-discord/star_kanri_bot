const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  customId: 'tousuna_quick:本文入力',

  /**
   * クイック設置の本文モーダル送信後の処理
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const body = interaction.fields.getTextInputValue('body');
    const uuid = uuidv4();

    const dataDir = path.join(__dirname, '../../../data', guildId);
    const dataFile = path.join(dataDir, `${guildId}.json`);

    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    let json = {};
    if (fs.existsSync(dataFile)) {
      json = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    }

    if (!json.tousuna) json.tousuna = {};
    if (!json.tousuna.instances) json.tousuna.instances = [];

    const newInstance = {
      id: uuid,
      body,
      messageChannelId: interaction.channelId,
      replicateChannelIds: [],
    };

    json.tousuna.instances.push(newInstance);
    fs.writeFileSync(dataFile, JSON.stringify(json, null, 2));

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

    newInstance.messageId = sentMessage.id;
    fs.writeFileSync(dataFile, JSON.stringify(json, null, 2));

    await interaction.reply({
      content: '✅ 本文を保存し、凸スナボタンを設置しました。',
      ephemeral: true,
    });
  },
};

