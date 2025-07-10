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
    try {
      const guildId = guild.id;
      const guildDir = path.join(__dirname, `../data/${guildId}`);
      const jsonPath = path.join(guildDir, `${guildId}.json`);

      // ディレクトリ作成
      if (!fs.existsSync(guildDir)) {
        fs.mkdirSync(guildDir, { recursive: true });
        console.log(`📁 データフォルダ作成: data/${guildId}`);
      } else {
        console.log(`📁 フォルダ既存: data/${guildId}`);
      }

      // 初期JSON作成（存在しない場合のみ）
      if (!fs.existsSync(jsonPath)) {
        const initialData = {
          star_config: {},
          totusuna_config: {},
          tousuna: {
            instances: {}
          }
        };
        fs.writeFileSync(jsonPath, JSON.stringify(initialData, null, 2), 'utf8');
        console.log(`📄 初期設定ファイル作成: ${jsonPath}`);
      } else {
        console.log(`📄 設定ファイル既存: ${jsonPath}`);
      }
    } catch (err) {
      console.error(`❌ ギルド初期化中にエラー発生（GuildID: ${guild.id}）`, err);
    }
  }
};
