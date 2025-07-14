const fs = require('fs').promises;
const path = require('path');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlagsBitField,
} = require('discord.js');

/**
 * Ephemeralで安全にreplyを送るヘルパー
 * @param {import('discord.js').Interaction} interaction
 * @param {string} content
 */
async function safeReply(interaction, content) {
  if (!interaction.replied && !interaction.deferred) {
    await interaction.reply({
      content,
      flags: MessageFlagsBitField.Ephemeral,
    });
  }
}

module.exports = {
  customIdStart: 'totsusuna_setti:edit:',

  /**
   * 凸スナ本文編集モーダル表示
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
      await safeReply(interaction, '⚠️ ギルドコンテキストでのみ使用可能です。');
      return;
    }

    const uuid = interaction.customId.substring(this.customIdStart.length);
    const filePath = path.resolve(__dirname, '../../../data', guildId, `${guildId}.json`);

    try {
      await fs.access(filePath);
    } catch {
      await safeReply(interaction, '⚠️ データファイルが見つかりません。');
      return;
    }

    let json;
    try {
      const content = await fs.readFile(filePath, 'utf8');
      json = JSON.parse(content);
    } catch (err) {
      console.error(new Date().toISOString(), '[edit] JSON読み込み失敗:', err);
      await safeReply(interaction, '❌ データファイルの読み込みに失敗しました。');
      return;
    }

    const instances = json.totsusuna?.instances;
    if (!Array.isArray(instances)) {
      await safeReply(interaction, '⚠️ 凸スナ設置データが存在しません。');
      return;
    }

    const target = instances.find(i => i.id === uuid);
    if (!target) {
      await safeReply(interaction, '⚠️ 指定された凸スナ設置情報が見つかりません。');
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId(`totsusuna_edit_modal:${uuid}`)
      .setTitle('📘 凸スナ本文の編集');

    const input = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('本文メッセージ（変更後）')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setValue(target.body || '');

    modal.addComponents(new ActionRowBuilder().addComponents(input));

    try {
      await interaction.showModal(modal);
    } catch (err) {
      console.error(new Date().toISOString(), '[edit] モーダル表示失敗:', err);
      await safeReply(interaction, '❌ モーダルの表示に失敗しました。');
    }
  },
};
