// utils/�E�適刁E��チE��レクトリ�E�Emodals/edit_body_modal.js
const fs = require('fs');
const path = require('path');

module.exports = {
  customIdStart: 'edit_body_modal_',

  /**
   * 本斁E��雁E��ーダル送信後�E琁E   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace('edit_body_modal_', '');
    const newBody = interaction.fields.getTextInputValue('body');

    const filePath = path.join(__dirname, `../../../data/${guildId}/${guildId}.json`);
    if (!fs.existsSync(filePath)) {
      return await interaction.reply({
        content: '⚠ 設定ファイルが存在しません、E,
        flags: 1 << 6 // ephemeral
      });
    }

    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const instance = json.totsusuna?.[uuid];

    if (!instance) {
      return await interaction.reply({
        content: '⚠ 対象の凸スナ設置惁E��が見つかりません、E,
        flags: 1 << 6 // ephemeral
      });
    }

    instance.body = newBody;
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));

    await interaction.reply({
      content: '✁E本斁E��更新しました�E�E,
      flags: 1 << 6 // ephemeral
    });
  }
};

