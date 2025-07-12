const fs = require('fs');
const path = require('path');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  customId: 'totusuna_config:險ｭ螳壹ｒ邱ｨ髮・,

  /**
   * 蜃ｸ繧ｹ繝頑悽譁・・邱ｨ髮・Δ繝ｼ繝繝ｫ陦ｨ遉ｺ
   * @param {import('discord.js').ButtonInteraction} interaction
   * @param {string} uuid
   */
  async handle(interaction, uuid) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '笞・・繝・・繧ｿ繝輔ぃ繧､繝ｫ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・,
        flags: 1 << 6 // ephemeral縺ｫ蟇ｾ蠢・      });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const instance = json.tousuna?.instances?.find(i => i.id === uuid);

    if (!instance) {
      return await interaction.reply({
        content: '笞・・謖・ｮ壹＆繧後◆險ｭ鄂ｮ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・,
        flags: 1 << 6
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`tousuna_config_edit_modal_${uuid}`)
      .setTitle('塘 譛ｬ譁・・菫ｮ豁｣');

    const bodyInput = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('譛ｬ譁・・螳ｹ')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(instance.body || '')
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(bodyInput));

    await interaction.showModal(modal);
  }
};
