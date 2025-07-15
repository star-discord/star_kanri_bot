// utils/totusuna_setti/buttons/totusuna_install_button.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlagsBitField } = require('discord.js');
const requireAdmin = require('../../permissions/requireAdmin');

/**
 * 実際のハンドラ関数
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function actualHandler(interaction) {
  try {
    const modal = new ModalBuilder()
      .setCustomId('totusuna_install_modal') // このモーダルのハンドラも必要
      .setTitle('凸スナ 新規設置');

    const titleInput = new TextInputBuilder()
      .setCustomId('title')
      .setLabel('Embedタイトル（任意）')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('例: 凸スナ報告')
      .setRequired(false);

    const bodyInput = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('メッセージ本文')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('例: 今日の凸スナ報告はこちらのボタンからお願いします！')
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(titleInput), new ActionRowBuilder().addComponents(bodyInput));

    // deferReply() は呼ばずに、直接 showModal() を実行します。
    await interaction.showModal(modal);
  } catch (error) {
    console.error('❌ [totusuna_install_button] モーダル表示エラー:', error);
    // エラーを再スローして、中央の buttonsHandler.js で一元的に処理させる
    throw error;
  }
}

module.exports = {
  customId: 'totusuna_install_button',
  handle: actualHandler,
};