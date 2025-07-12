const fs = require('fs').promises;
const path = require('path');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');

module.exports = {
  customIdStart: 'totsusuna_setti:edit_settings:',

  /**
   * 蜃ｸ繧ｹ繝願ｨｭ鄂ｮ縺ｮ邱ｨ髮・Δ繝ｼ繝繝ｫ陦ｨ遉ｺ
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace(this.customIdStart, '');
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    try {
      await fs.access(dataPath);
    } catch {
      return await interaction.reply({
        content: '笞・・繝・・繧ｿ繝輔ぃ繧､繝ｫ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    let json;
    try {
      const fileContent = await fs.readFile(dataPath, 'utf-8');
      json = JSON.parse(fileContent);
    } catch (err) {
      console.error('[edit_settings] JSON隱ｭ縺ｿ霎ｼ縺ｿ螟ｱ謨・', err);
      return await interaction.reply({
        content: '笶・繝・・繧ｿ繝輔ぃ繧､繝ｫ縺ｮ隱ｭ縺ｿ霎ｼ縺ｿ縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    const instances = json.totsusuna?.instances;
    if (!Array.isArray(instances)) {
      return await interaction.reply({
        content: '笞・・繧､繝ｳ繧ｹ繧ｿ繝ｳ繧ｹ繝・・繧ｿ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    const instance = instances.find(i => i.id === uuid);
    if (!instance) {
      return await interaction.reply({
        content: '笞・・謖・ｮ壹＆繧後◆險ｭ鄂ｮ諠・ｱ縺悟ｭ伜惠縺励∪縺帙ｓ縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(this.customIdStart + uuid)
      .setTitle('祷 蜃ｸ繧ｹ繝頑悽譁・ｒ邱ｨ髮・);

    const bodyInput = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('譛ｬ譁・Γ繝・そ繝ｼ繧ｸ')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(instance.body || '')
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(bodyInput));

    await interaction.showModal(modal);
  },
};
