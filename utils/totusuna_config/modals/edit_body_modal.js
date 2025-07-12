// utils/・憺←蛻・↑繝・ぅ繝ｬ繧ｯ繝医Μ・・modals/edit_body_modal.js
const fs = require('fs');
const path = require('path');

module.exports = {
  customIdStart: 'edit_body_modal_',

  /**
   * 譛ｬ譁・ｷｨ髮・Δ繝ｼ繝繝ｫ騾∽ｿ｡蠕悟・逅・   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace('edit_body_modal_', '');
    const newBody = interaction.fields.getTextInputValue('body');

    const filePath = path.join(__dirname, `../../../data/${guildId}/${guildId}.json`);
    if (!fs.existsSync(filePath)) {
      return await interaction.reply({
        content: '笞 險ｭ螳壹ヵ繧｡繧､繝ｫ縺悟ｭ伜惠縺励∪縺帙ｓ縲・,
        flags: 1 << 6 // ephemeral
      });
    }

    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const instance = json.totsusuna?.[uuid];

    if (!instance) {
      return await interaction.reply({
        content: '笞 蟇ｾ雎｡縺ｮ蜃ｸ繧ｹ繝願ｨｭ鄂ｮ諠・ｱ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲・,
        flags: 1 << 6 // ephemeral
      });
    }

    instance.body = newBody;
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));

    await interaction.reply({
      content: '笨・譛ｬ譁・ｒ譖ｴ譁ｰ縺励∪縺励◆・・,
      flags: 1 << 6 // ephemeral
    });
  }
};

