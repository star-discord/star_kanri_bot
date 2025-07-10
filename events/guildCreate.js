// events/guildCreate.js
const { Events } = require('discord.js');
const { ensureGuildJSON } = require('../utils/fileHelper');

module.exports = {
  name: Events.GuildCreate,
  once: false,

  /**
   * ギルド参加時にデータディレクトリと初期JSONを作成する
   * @param {import('discord.js').Guild} guild
   */
  async execute(guild) {
    try {
      const guildId = guild.id;

      // JSON初期化（中でディレクトリも作成される）
      const jsonPath = ensureGuildJSON(guildId);
      console.log(`✅ ギルド初期化完了: ${jsonPath}`);
    } catch (err) {
      console.error(`❌ ギルド初期化中にエラー発生（GuildID: ${guild.id}）`, err);
    }
  }
};

