// utils/totusuna_setti/modals/editSetting.js
const fs = require('fs');
const path = require('path');
const { InteractionResponseFlags } = require('discord.js'); // ← 追加

module.exports = {
  customId: 'edit_setting_modal',
  async handle(interaction, uuid) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '⚠ 設定ファイルが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const instance = json?.totusuna?.[uuid]; // ← 修正

    if (!instance) {
      return await interaction.reply({
        content: '⚠ 該当の凸スナ情報が見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const newBody = interaction.fields.getTextInputValue('body')?.trim();
    if (!newBody || newBody.length === 0) {
      return await interaction.reply({
        content: '❌ 本文が空です。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    instance.body = newBody;

    // 保存
    fs.writeFileSync(dataPath, JSON.stringify(json, null, 2));

    await interaction.reply({
      content: '✅ 本文を更新しました。\n※設置チャンネルのメッセージを再送信したい場合は `/凸スナ設定` から「再送信ボタン」を使用してください。',
      flags: InteractionResponseFlags.Ephemeral,
    });
  }
};
