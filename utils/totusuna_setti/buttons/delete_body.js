const fs = require('fs');
const path = require('path');
const { MessageFlags } = require('discord.js'); // 霑ｽ蜉

module.exports = {
  customIdStart: 'totsusuna_setti:delete_body:', // 闍ｱ隱槫喧

  /**
   * 蜃ｸ繧ｹ繝頑悽譁・炎髯､繝懊ち繝ｳ縺ｮ蜃ｦ逅・   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace(this.customIdStart, '');
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    // 繝・・繧ｿ繝輔ぃ繧､繝ｫ蟄伜惠遒ｺ隱・    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '笞・・繝・・繧ｿ繝輔ぃ繧､繝ｫ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    // JSON 隱ｭ縺ｿ霎ｼ縺ｿ
    let json;
    try {
      json = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (err) {
      console.error('[delete_body] JSON隱ｭ縺ｿ霎ｼ縺ｿ繧ｨ繝ｩ繝ｼ:', err);
      return await interaction.reply({
        content: '笶・繝・・繧ｿ縺ｮ隱ｭ縺ｿ霎ｼ縺ｿ縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    const instances = json.totsusuna?.instances;
    if (!Array.isArray(instances)) {
      return await interaction.reply({
        content: '笞・・蜃ｸ繧ｹ繝頑ュ蝣ｱ縺御ｸ肴ｭ｣縺ｧ縺吶・,
        flags: MessageFlags.Ephemeral,
      });
    }

    const targetIndex = instances.findIndex(i => i.id === uuid);
    if (targetIndex === -1) {
      return await interaction.reply({
        content: '笞・・謖・ｮ壹＆繧後◆險ｭ鄂ｮ縺ｯ蟄伜惠縺励∪縺帙ｓ縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    const target = instances[targetIndex];

    // 繝｡繝・そ繝ｼ繧ｸ蜑企勁蜃ｦ逅・    try {
      const channel = await interaction.guild.channels.fetch(target.installChannelId);
      if (channel && target.messageId) {
        const message = await channel.messages.fetch(target.messageId).catch(() => null);
        if (message) await message.delete();
      }
    } catch (err) {
      console.warn(`[delete_body] 繝｡繝・そ繝ｼ繧ｸ蜑企勁縺ｫ螟ｱ謨・ ${err.message}`);
    }

    // JSON 縺九ｉ蜑企勁縺励※菫晏ｭ・    instances.splice(targetIndex, 1);
    fs.writeFileSync(dataPath, JSON.stringify(json, null, 2));

    await interaction.reply({
      content: '卵 譛ｬ譁・ｒ蜑企勁縺励∪縺励◆縲・,
      flags: MessageFlags.Ephemeral,
    });
  },
};
