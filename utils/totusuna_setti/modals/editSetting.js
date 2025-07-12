// utils/totusuna_setti/modals/editSetting.js
const fs = require('fs');
const path = require('path');
const { MessageFlags } = require('discord.js'); // ↁE追加

module.exports = {
  customId: 'edit_setting_modal',
  async handle(interaction, uuid) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '⚠ 設定ファイルが見つかりません、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const instance = json?.totusuna?.[uuid]; // ↁE修正

    if (!instance) {
      return await interaction.reply({
        content: '⚠ 該当�E凸スナ情報が見つかりません、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    const newBody = interaction.fields.getTextInputValue('body')?.trim();
    if (!newBody || newBody.length === 0) {
      return await interaction.reply({
        content: '❁E本斁E��空です、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    instance.body = newBody;

    // 保孁E    fs.writeFileSync(dataPath, JSON.stringify(json, null, 2));

    await interaction.reply({
      content: '✁E本斁E��更新しました、En※設置チャンネルのメチE��ージを�E送信したぁE��合�E `/凸スナ設定` から「�E送信ボタン」を使用してください、E,
      flags: MessageFlags.Ephemeral,
    });
  }
};
