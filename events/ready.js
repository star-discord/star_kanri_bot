// events/ready.js
const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,

  /**
   * Bot 起動完了時のイベント
   * @param {import('discord.js').Client} client
   */
  execute(client) {
    console.log(`✅ Bot 起動完了、ログイン: ${client.user.tag}`);
    console.log(`📡 現在接続中のサーバー数: ${client.guilds.cache.size}`);
  },
};
