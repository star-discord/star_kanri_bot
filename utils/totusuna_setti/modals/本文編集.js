// utils/totusuna_setti/modals/本文編集.js
const fs = require('fs');
const path = require('path');

module.exports = {
  async handle(interaction) {
    const modalId = interaction.customId;
    const match = modalId.match(/^tousuna_edit_modal_(.+)$/);
    if (!match) return;

    const uuid = match[1];
    const guildId = interaction.guildId;
    const newBody = interaction.fields.getTextInputValue('body');

    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(dataPath)) {
      return interaction.reply({ content: '❌ データファイルが見つかりません。', ephemeral: true });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const instance = json?.totsusuna?.[uuid];

    if (!instance) {
      return interaction.reply({ content: '❌ 指定されたUUIDの凸スナ設定が存在しません。', ephemeral: true });
    }

    // 本文更新
    instance.body = newBody;
    fs.writeFileSync(dataPath, JSON.stringify(json, null, 2));

    await interaction.reply({ content: '✅ 本文を更新しました。', ephemeral: true });
  }
};
