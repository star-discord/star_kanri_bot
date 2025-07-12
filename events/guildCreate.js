// events/guildCreate.js
const { Events } = require('discord.js');
const { ensureGuildJSON } = require('../utils/fileHelper');

module.exports = {
  name: Events.GuildCreate,
  once: false,

  /**
   * 新しいギルド参加時に、data/<guildId>/ チE��レクトリと初期設定JSONを作�Eする
   * @param {import('discord.js').Guild} guild
   */
  async execute(guild) {
    const guildId = guild.id;

    try {
      const jsonPath = ensureGuildJSON(guildId);
      console.log(`✁Eギルド�E期化完亁E ${guildId} ↁE${jsonPath}`);
    } catch (error) {
      console.error(`❁Eギルド�E期化エラー�E�EuildID: ${guildId}�E�`, error);
    }
  }
};
