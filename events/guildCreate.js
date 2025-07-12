// events/guildCreate.js
const { Events } = require('discord.js');
const { ensureGuildJSON } = require('../utils/fileHelper');

module.exports = {
  name: Events.GuildCreate,
  once: false,

  /**
   * 新しいギルド参加時に、data/<guildId>/ ディレクトリと初期設定JSONを作成する
   * @param {import('discord.js').Guild} guild
   */
  async execute(guild) {
    const guildId = guild.id;

    try {
      const jsonPath = ensureGuildJSON(guildId);
      console.log(`✅ ギルド初期化完了: ${guildId} → ${jsonPath}`);
    } catch (error) {
      console.error(`❌ ギルド初期化エラー（GuildID: ${guildId}）`, error);
    }
  }
};
