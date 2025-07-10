// commands/totusuna_setti.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設置')
    .setDescription('凸スナ報告ボタンを設置します')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('設置チャンネル')
        .setDescription('ボタンを設置するチャンネル')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText))
    .addChannelOption(option =>
      option.setName('本文送信チャンネル')
        .setDescription('本文を送信するチャンネル')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText))
    .addStringOption(option =>
      option.setName('本文')
        .setDescription('ボタン設置時に表示するメッセージ本文')
        .setRequired(true)),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const setupChannel = interaction.options.getChannel('設置チャンネル');
    const messageChannel = interaction.options.getChannel('本文送信チャンネル');
    const messageContent = interaction.options.getString('本文');

    const instanceId = uuidv4();

    const instance = {
      id: instanceId,
      setupChannelId: setupChannel.id,
      messageChannelId: messageChannel.id,
      cloneChannelIds: [], // 今後複製チャンネル追加予定
      messageContent,
      createdAt: new Date().toISOString()
    };

    // 保存先のパス
    const dirPath = path.join(__dirname, `../../data/${guildId}`);
    const filePath = path.join(dirPath, `${guildId}.json`);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    let data = {};
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    data.tousuna ??= {};
    data.tousuna.instances ??= [];
    data.tousuna.instances.push(instance);

    // Embedメッセージ + ボタンを送信
    const embed = new EmbedBuilder()
      .setTitle('📣 凸スナ報告受付中！')
      .setDescription(messageContent)
      .setColor(0x00BFFF);

    const button = new ButtonBuilder()
      .setCustomId(`tousuna_report_button_${instanceId}`)
      .setLabel('凸スナ報告')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    const sent = await setupChannel.send({ embeds: [embed], components: [row] });
    instance.messageId = sent.id; // 送信メッセージIDを保存

    // 再保存
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

    await interaction.reply({
      content: `✅ 凸スナ設置を保存しました！\n設置チャンネル: ${setupChannel}\n本文送信チャンネル: ${messageChannel}`,
      ephemeral: true,
    });
  },
};
