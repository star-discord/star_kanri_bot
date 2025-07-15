// utils/totusuna_setti/buttons/edit.js

const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlagsBitField,
} = require('discord.js');
const { checkAdmin } = require('../../permissions/checkAdmin');
const { configManager } = require('../../configManager');
const { createAdminRejectEmbed } = require('../../embedHelper');

module.exports = {
  customIdStart: 'totusuna_setti:edit:',

  /**
   * 凸スナ本文編集モーダル表示
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    let uuid; // Declare uuid here to make it accessible in the catch block
    try {
      // Since showing a modal is a reply, we don't defer.
      // Instead, we check permissions first.
      const isAdmin = await checkAdmin(interaction);
      if (!isAdmin) {
        return await interaction.reply({
          embeds: [createAdminRejectEmbed()],
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      }

      uuid = interaction.customId.substring(module.exports.customIdStart.length);

      // Use the safe configManager to get instance data
      const instance = await configManager.getTotusunaInstance(interaction.guildId, uuid);

      if (!instance) {
        return await interaction.reply({
          content: '⚠️ 指定された設定情報が見つかりません。',
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      }

      const modal = new ModalBuilder()
        .setCustomId(`totusuna_edit_modal:${uuid}`)
        .setTitle('📘 凸スナ本文の編集');

      const input = new TextInputBuilder()
        .setCustomId('body')
        .setLabel('本文メッセージ（変更後）')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setValue(instance.body || '');

      modal.addComponents(new ActionRowBuilder().addComponents(input));

      await interaction.showModal(modal);
    } catch (err) {
      console.error(`[edit.js] モーダル表示失敗 (uuid: ${uuid}):`, err);
      // If showing the modal fails, we can attempt a text-based reply.
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ モーダルの表示に失敗しました。', flags: MessageFlagsBitField.Flags.Ephemeral });
      }
    }
  },
};
