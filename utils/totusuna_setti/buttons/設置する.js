const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionResponseFlags } = require('discord.js');
const { v4: uuidv4 } = require('uuid');

// 一時保存された本文・選択内容（ユーザーID単位）
const tempState = require('../../state/totsusunaTemp');

module.exports = {
  customId: 'tousuna_create_instance',

  async handle(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    const state = tempState.get(userId);

    if (!state || !state.body || !state.installChannelId) {
      return await interaction.reply({
        content: '⚠ 本文やチャンネル設定が不足しています。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const uuid = uuidv4();
    const embed = new EmbedBuilder()
      .setTitle('📣 凸スナ報告受付中')
      .setDescription(state.body)
      .setColor(0x00bfff);

    const button = new ButtonBuilder()
      .setCustomId(`tousuna_report_button_${uuid}`)
      .setLabel('凸スナ報告')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    const installChannel = await interaction.guild.channels.fetch(state.installChannelId);
    const sentMessage = await installChannel.send({ embeds: [embed], components: [row] });

    // 保存ファイル読み込み
    const dataDir = path.join(__dirname, '../../../data', guildId);
    const dataFile = path.join(dataDir, `${guildId}.json`);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    let json = {};
    if (fs.existsSync(dataFile)) {
      json = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    }

    if (!json.tousuna) json.tousuna = {};
    if (!Array.isArray(json.tousuna.instances)) json.tousuna.instances = [];

    // 新しい設置情報を追加
    json.tousuna.instances.push({
      id: uuid,
      body: state.body,
      installChannelId: state.installChannelId,
      replicateChannelIds: state.replicateChannelIds || [],
      messageChannelId: state.installChannelId,
      messageId: sentMessage.id,
    });

    fs.writeFileSync(dataFile, JSON.stringify(json, null, 2));

    // 状態クリア
    tempState.delete(userId);

    await interaction.reply({
      content: '✅ 凸スナ設置が完了しました！',
      flags: InteractionResponseFlags.Ephemeral,
    });
  },
};
