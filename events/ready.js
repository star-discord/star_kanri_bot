// events/ready.js
const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,

  /**
   * Bot 襍ｷ蜍募ｮ御ｺ・凾縺ｮ繧､繝吶Φ繝・   * @param {import('discord.js').Client} client
   */
  execute(client) {
    console.log(`笨・Bot 襍ｷ蜍募ｮ御ｺ・ｼ√Ο繧ｰ繧､繝ｳ: ${client.user.tag}`);
    console.log(`藤 迴ｾ蝨ｨ謗･邯壻ｸｭ縺ｮ繧ｵ繝ｼ繝舌・謨ｰ: ${client.guilds.cache.size}`);
  },
};
