// events/ready.js
const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,

  /**
   * Bot 起動完亁E��のイベンチE   * @param {import('discord.js').Client} client
   */
  execute(client) {
    console.log(`✁EBot 起動完亁E��ログイン: ${client.user.tag}`);
    console.log(`📡 現在接続中のサーバ�E数: ${client.guilds.cache.size}`);
  },
};
