const fs = require('fs');
const path = require('path');

module.exports = {
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace('edit_body_modal_', '');
    const newBody = interaction.fields.getTextInputValue('body');

    const filePath = path.join(__dirname, `../../../data/${guildId}/${guildId}.json`);
    if (!fs.existsSync(filePath)) {
      return await interaction.reply({ content: '⚠ 設定ファイルが存在しません。', ephemeral: true });
    }

    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const instance = json.totsusuna?.[uuid];

    if (!instance) {
      return await interaction.reply({ content: '⚠ 対象の凸スナ設置情報が見つかりません。', ephemeral: true });
    }

    instance.body = newBody;

    // 保存
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));

    await interaction.reply({ content: '✅ 本文を更新しました！', ephemeral: true });
  }
};
