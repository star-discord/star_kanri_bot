// utils/totusuna_setti/modals/editSetting.js
const fs = require('fs').promises;
const path = require('path');
const { MessageFlagsBitField } = require('discord.js');

module.exports = {
  customId: 'edit_setting_modal',

  /**
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   * @param {string} uuid - 編集対象のUUID
   */
  async handle(interaction, uuid) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    try {
      await fs.access(dataPath);
    } catch {
      return await interaction.reply({
        content: '⚠️ 設定ファイルが見つかりません。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    let json;
    try {
      const raw = await fs.readFile(dataPath, 'utf-8');
      json = JSON.parse(raw);
    } catch (err) {
      console.error('[editSetting] JSON読み込み失敗:', err);
      return await interaction.reply({
        content: '❌ 設定ファイルの読み込みに失敗しました。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    const instances = json.totusuna?.instances;
    if (!Array.isArray(instances)) {
      return await interaction.reply({
        content: '⚠️ 凸スナ設置データが見つかりません。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    const instance = instances.find(i => i.id === uuid);
    if (!instance) {
      return await interaction.reply({
        content: '⚠️ 該当の凸スナ情報が見つかりません。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    const newBody = interaction.fields.getTextInputValue('body')?.trim();
    if (!newBody) {
      return await interaction.reply({
        content: '❌ 本文が空です。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    instance.body = newBody;

    try {
      await fs.writeFile(dataPath, JSON.stringify(json, null, 2), 'utf8');
    } catch (err) {
      console.error('[editSetting] JSON保存失敗:', err);
      return await interaction.reply({
        content: '❌ データの保存に失敗しました。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    await interaction.reply({
      content: '✅ 本文を更新しました。\n※設置チャンネルのメッセージを再送信したい場合は `/凸スナ設定` から「再送信ボタン」を使用してください。',
      flags: MessageFlagsBitField.Ephemeral,
    });
  }
};
