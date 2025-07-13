// utils/totusuna_config ディレクトリのmodals/edit_body_modal.js
const fs = require('fs');
const path = require('path');

module.exports = {
  customIdStart: 'edit_body_modal_',

  /**
   * 本文編集モーダル送信後の処理   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace('edit_body_modal_', '');
    const newBody = interaction.fields.getTextInputValue('body');

    const filePath = path.join(__dirname, `../../../data/${guildId}/${guildId}.json`);
    if (!fs.existsSync(filePath)) {
      return await interaction.reply({
        content: '設定ファイルが存在しません。',
        flags: 1 << 6 // ephemeral
      });
    }

    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const instance = json.totsusuna?.[uuid];

    if (!instance) {
      return await interaction.reply({
        content: '対象の凸スナ設置情報が見つかりません。',
        flags: 1 << 6 // ephemeral
      });
    }

    instance.body = newBody;
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));

    await interaction.reply({
      content: '本文を更新しました。',
      flags: 1 << 6 // ephemeral
    });
  }
};

