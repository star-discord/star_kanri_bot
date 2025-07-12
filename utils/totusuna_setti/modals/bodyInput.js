const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../../utils/fileHelper');
const tempStore = require('../state/totsusunaTemp');

module.exports = {
  customIdStart: 'totsusuna_modal_body_input:',

  /**
   * 本斁E��ーダルの送信後�E琁E   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const inputText = interaction.fields.getTextInputValue('body');

    const jsonPath = ensureGuildJSON(guildId);
    const json = readJSON(jsonPath);

    if (!json.totusuna) json.totusuna = {};
    if (!Array.isArray(json.totusuna.instances)) json.totusuna.instances = [];

    const userData = tempStore.get(guildId, userId);
    if (!userData?.installChannelId) {
      return await interaction.reply({
        content: '⚠ 設置チャンネルが未設定です。�Eにチャンネルを選択してください、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    const uuid = uuidv4();

    const newInstance = {
      id: uuid,
      userId,
      body: inputText,
      installChannelId: userData.installChannelId,
      replicateChannelIds: userData.replicateChannelIds || [],
    };

    const embed = new EmbedBuilder()
      .setTitle('📣 凸スナ報告受付中')
      .setDescription(inputText)
      .setColor(0x00bfff);

    const button = new ButtonBuilder()
      .setCustomId(`totusuna:report:${uuid}`)
      .setLabel('凸スナ報呁E)
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    const targetChannel = await interaction.guild.channels.fetch(userData.installChannelId);
    if (!targetChannel?.isTextBased()) {
      return await interaction.reply({
        content: '⚠ 持E��された設置チャンネルが見つかりません、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    const sentMessage = await targetChannel.send({
      embeds: [embed],
      components: [row]
    });

    newInstance.messageId = sentMessage.id;
    json.totusuna.instances.push(newInstance);

    writeJSON(jsonPath, json);

    await interaction.reply({
      content: '✁E本斁E��保存し、�Eスナ�Eタンを設置しました、E,
      flags: MessageFlags.Ephemeral,
    });
  }
};
