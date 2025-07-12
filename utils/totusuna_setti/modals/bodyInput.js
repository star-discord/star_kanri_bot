const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../../utils/fileHelper');
const tempStore = require('../state/totsusunaTemp');

module.exports = {
  customIdStart: 'totsusuna_modal_body_input:',

  /**
   * 譛ｬ譁・Δ繝ｼ繝繝ｫ縺ｮ騾∽ｿ｡蠕悟・逅・   * @param {import('discord.js').ModalSubmitInteraction} interaction
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
        content: '笞 險ｭ鄂ｮ繝√Ε繝ｳ繝阪Ν縺梧悴險ｭ螳壹〒縺吶ょ・縺ｫ繝√Ε繝ｳ繝阪Ν繧帝∈謚槭＠縺ｦ縺上□縺輔＞縲・,
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
      .setTitle('謄 蜃ｸ繧ｹ繝雁ｱ蜻雁女莉倅ｸｭ')
      .setDescription(inputText)
      .setColor(0x00bfff);

    const button = new ButtonBuilder()
      .setCustomId(`totusuna:report:${uuid}`)
      .setLabel('蜃ｸ繧ｹ繝雁ｱ蜻・)
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    const targetChannel = await interaction.guild.channels.fetch(userData.installChannelId);
    if (!targetChannel?.isTextBased()) {
      return await interaction.reply({
        content: '笞 謖・ｮ壹＆繧後◆險ｭ鄂ｮ繝√Ε繝ｳ繝阪Ν縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・,
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
      content: '笨・譛ｬ譁・ｒ菫晏ｭ倥＠縲∝・繧ｹ繝翫・繧ｿ繝ｳ繧定ｨｭ鄂ｮ縺励∪縺励◆縲・,
      flags: MessageFlags.Ephemeral,
    });
  }
};
