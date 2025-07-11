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
   * 凸スナ本文入力モーダルを表示する処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    try {
      // モーダルを作成
      const modal = new ModalBuilder()
        .setCustomId('totsusuna_content_modal')
        .setTitle('📘 凸スナ 本文入力');

      // 本文入力欄を作成
      const bodyInput = new TextInputBuilder()
        .setCustomId('body')
        .setLabel('📄 本文を入力してください（例: 報告はこちら！）')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      // モーダルに入力欄を追加
      modal.addComponents(
        new ActionRowBuilder().addComponents(bodyInput)
      );

      // モーダルをユーザーに表示
      await interaction.showModal(modal);

    } catch (err) {
      console.error('[totsusuna_setti:input_body] モーダル表示エラー:', err);

      // まだ返信・応答していなければエラーメッセージを返信
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ モーダルの表示に失敗しました。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }
    }
  },
};
