// events/guildCreate.js
const { Events } = require('discord.js');
const { ensureGuildJSON } = require('../utils/fileHelper');

module.exports = {
  name: Events.GuildCreate,
  once: false,

  /**
   * 譁ｰ縺励＞繧ｮ繝ｫ繝牙盾蜉譎ゅ↓縲‥ata/<guildId>/ 繝・ぅ繝ｬ繧ｯ繝医Μ縺ｨ蛻晄悄險ｭ螳哽SON繧剃ｽ懈・縺吶ｋ
   * @param {import('discord.js').Guild} guild
   */
  async execute(guild) {
    const guildId = guild.id;

    try {
      const jsonPath = ensureGuildJSON(guildId);
      console.log(`笨・繧ｮ繝ｫ繝牙・譛溷喧螳御ｺ・ ${guildId} 竊・${jsonPath}`);
    } catch (error) {
      console.error(`笶・繧ｮ繝ｫ繝牙・譛溷喧繧ｨ繝ｩ繝ｼ・・uildID: ${guildId}・荏, error);
    }
  }
};
