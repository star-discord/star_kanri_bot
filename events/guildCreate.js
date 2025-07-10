// events/guildCreate.js
const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: Events.GuildCreate,
  once: false,
  /**
   * @param {import('discord.js').Guild} guild
   */
  async execute(guild) {
    const guildDir = path.join(__dirname, `../data/${guild.id}`);
    if (!fs.existsSync(guildDir)) {
      fs.mkdirSync(guildDir, { recursive: true });
      console.log(`📁 データフォルダ作成: data/${guild.id}`);
    } else {
      console.log(`📁 既に存在: data/${guild.id}`);
    }

    const jsonPath = path.join(guildDir, `${guild.id}.json`);
    if (!fs.existsSync(jsonPath)) {
      fs.writeFileSync(jsonPath, JSON.stringify({}, null, 2), 'utf8');
      console.log(`📄 初期設定ファイル作成: ${jsonPath}`);
    }
  },
};
