// utils/totusuna_setti/modals/editSetting.js
const fs = require('fs');
const path = require('path');
const { MessageFlags } = require('discord.js'); // 竊・霑ｽ蜉

module.exports = {
  customId: 'edit_setting_modal',
  async handle(interaction, uuid) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '笞 險ｭ螳壹ヵ繧｡繧､繝ｫ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const instance = json?.totusuna?.[uuid]; // 竊・菫ｮ豁｣

    if (!instance) {
      return await interaction.reply({
        content: '笞 隧ｲ蠖薙・蜃ｸ繧ｹ繝頑ュ蝣ｱ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・,
        flags: MessageFlags.Ephemeral,
      });
    }

    const newBody = interaction.fields.getTextInputValue('body')?.trim();
    if (!newBody || newBody.length === 0) {
      return await interaction.reply({
        content: '笶・譛ｬ譁・′遨ｺ縺ｧ縺吶・,
        flags: MessageFlags.Ephemeral,
      });
    }

    instance.body = newBody;

    // 菫晏ｭ・    fs.writeFileSync(dataPath, JSON.stringify(json, null, 2));

    await interaction.reply({
      content: '笨・譛ｬ譁・ｒ譖ｴ譁ｰ縺励∪縺励◆縲・n窶ｻ險ｭ鄂ｮ繝√Ε繝ｳ繝阪Ν縺ｮ繝｡繝・そ繝ｼ繧ｸ繧貞・騾∽ｿ｡縺励◆縺・ｴ蜷医・ `/蜃ｸ繧ｹ繝願ｨｭ螳啻 縺九ｉ縲悟・騾∽ｿ｡繝懊ち繝ｳ縲阪ｒ菴ｿ逕ｨ縺励※縺上□縺輔＞縲・,
      flags: MessageFlags.Ephemeral,
    });
  }
};
