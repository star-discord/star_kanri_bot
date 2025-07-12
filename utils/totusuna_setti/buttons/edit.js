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
  customIdStart: 'totsusuna_setti:edit:',

  /**
   * 蜃ｸ繧ｹ繝頑悽譁・ｷｨ髮・畑繝｢繝ｼ繝繝ｫ繧定｡ｨ遉ｺ縺吶ｋ蜃ｦ逅・   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const customId = interaction.customId;
    // customId縺九ｉUUID驛ｨ蛻・ｒ蜿悶ｊ蜃ｺ縺・    const uuid = customId.replace(this.customIdStart, '');

    const filePath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    // 繝・・繧ｿ繝輔ぃ繧､繝ｫ縺悟ｭ伜惠縺吶ｋ縺狗｢ｺ隱・    try {
      await fs.access(filePath);
    } catch {
      return await interaction.reply({
        content: '笞 繝・・繧ｿ繝輔ぃ繧､繝ｫ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    // JSON繝輔ぃ繧､繝ｫ繧定ｪｭ縺ｿ霎ｼ縺ｿ縲√ヱ繝ｼ繧ｹ縺吶ｋ
    let json;
    try {
      const content = await fs.readFile(filePath, 'utf8');
      json = JSON.parse(content);
    } catch (err) {
      console.error('JSON繝輔ぃ繧､繝ｫ縺ｮ隱ｭ縺ｿ霎ｼ縺ｿ縺ｾ縺溘・隗｣譫舌↓螟ｱ謨励＠縺ｾ縺励◆:', err);
      return await interaction.reply({
        content: '笶・繝・・繧ｿ繝輔ぃ繧､繝ｫ縺ｮ隱ｭ縺ｿ霎ｼ縺ｿ縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    const instances = json.totsusuna?.instances;
    if (!Array.isArray(instances)) {
      return await interaction.reply({
        content: '笞 蜃ｸ繧ｹ繝願ｨｭ鄂ｮ繝・・繧ｿ縺悟ｭ伜惠縺励∪縺帙ｓ縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    // UUID縺ｫ蟇ｾ蠢懊☆繧玖ｨｭ鄂ｮ繝・・繧ｿ繧呈爾縺・    const target = instances.find(i => i.id === uuid);
    if (!target) {
      return await interaction.reply({
        content: '笞 謖・ｮ壹＆繧後◆蜃ｸ繧ｹ繝願ｨｭ鄂ｮ諠・ｱ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    // 繝｢繝ｼ繝繝ｫ繧剃ｽ懈・
    const modal = new ModalBuilder()
      .setCustomId(`totsusuna_edit_modal:${uuid}`)
      .setTitle('祷 蜃ｸ繧ｹ繝頑悽譁・・邱ｨ髮・);

    // 繝・く繧ｹ繝亥・蜉帙さ繝ｳ繝昴・繝阪Φ繝医ｒ菴懈・
    const input = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('譛ｬ譁・Γ繝・そ繝ｼ繧ｸ')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setValue(target.body || '');

    // 繝｢繝ｼ繝繝ｫ縺ｫ繧ｳ繝ｳ繝昴・繝阪Φ繝医ｒ霑ｽ蜉
    modal.addComponents(new ActionRowBuilder().addComponents(input));

    // 繝｢繝ｼ繝繝ｫ繧偵Θ繝ｼ繧ｶ繝ｼ縺ｫ陦ｨ遉ｺ
    await interaction.showModal(modal);
  },
};
