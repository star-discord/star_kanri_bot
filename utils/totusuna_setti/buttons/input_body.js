const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  InteractionResponseFlags,
} = require('discord.js');

module.exports = {
  customId: 'totsusuna_setti:input_body', // 英語名に統一

  /**
   * 凸スナ本文入力モーダル表示
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    try {
      // モーダル作成
      const modal = new ModalBuilder()
        .setCustomId('totsusuna_content_modal')
        .setTitle('📘 凸スナ 本文入力');

      // 本文入力欄の作成
      const bodyInput = new TextInputBuilder()
        .setCustomId('body')
        .setLabel('📄 本文を入力してください（例: 報告はこちら！）')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(bodyInput)
      );

      // モーダル表示
      await interaction.showModal(modal);

    } catch (err) {
      console.error('[totsusuna_setti:input_body] モーダル表示エラー:', err);

      // エラー時に返信（未返信・未デフォード時）
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ モーダルの表示に失敗しました。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }
    }
  },
};
