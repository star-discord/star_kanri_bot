// utils/embedHelper.js
const { EmbedBuilder } = require('discord.js');

// 譌｢蟄・ 邂｡逅・・ｰら畑UI縺ｮEmbed
function createAdminEmbed(title, description, color = 0x0099ff) {
  return new EmbedBuilder()
    .setTitle(`${title} 白 邂｡逅・・ｰら畑`)
    .setDescription(description)
    .setColor(color);
}

// 笨・譁ｰ隕剰ｿｽ蜉: 讓ｩ髯舌お繝ｩ繝ｼ逕ｨEmbed
function createAdminRejectEmbed() {
  return new EmbedBuilder()
    .setTitle('笶・邂｡逅・・ｨｩ髯舌′蠢・ｦ√〒縺・)
    .setDescription('縺薙・繧ｳ繝槭Φ繝峨・ **邂｡逅・・Ο繝ｼ繝ｫ縺ｫ逋ｻ骭ｲ縺輔ｌ縺溘Θ繝ｼ繧ｶ繝ｼ縺ｮ縺ｿ** 菴ｿ逕ｨ縺ｧ縺阪∪縺吶・)
    .setColor(0xff0000);
}

module.exports = {
  createAdminEmbed,
  createAdminRejectEmbed
};
