const fs = require('fs').promises;
const path = require('path');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  InteractionResponseFlags,
} = require('discord.js');

module.exports = {
  customIdStart: 'totsusuna_setti:edit_settings:',

  /**
   * 凸スナ設置の編集モーダル表示
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace(this.customIdStart, '');
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    try {
      await fs.access(dataPath);
    } catch {
      return await interaction.reply({
        content: '⚠️ データファイルが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    let json;
    try {
      const fileContent = await fs.readFile(dataPath, 'utf-8');
      json = JSON.parse(fileContent);
    } catch (err) {
      console.error('[edit_settings] JSON読み込み失敗:', err);
      return await interaction.reply({
        content: '❌ データファイルの読み込みに失敗しました。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const instances = json.totsusuna?.instances;
    if (!Array.isArray(instances)) {
      return await interaction.reply({
        content: '⚠️ インスタンスデータが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const instance = instances.find(i => i.id === uuid);
    if (!instance) {
      return await interaction.reply({
        content: '⚠️ 指定された設置情報が存在しません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(this.customIdStart + uuid)
      .setTitle('📘 凸スナ本文を編集');

    const bodyInput = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('本文メッセージ')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(instance.body || '')
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(bodyInput));

    await interaction.showModal(modal);
  },
};
