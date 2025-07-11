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
   * 凸スナ本文入力用モーダルを表示する処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    try {
      // モーダルの作成
      const modal = new ModalBuilder()
        .setCustomId('totsusuna_content_modal')
        .setTitle('📘 凸スナ 本文入力');

      // 本文入力用テキスト入力コンポーネントの作成
      const bodyInput = new TextInputBuilder()
        .setCustomId('body')
        .setLabel('📄 本文を入力してください（例: 報告はこちら！）')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      // モーダルにテキスト入力を追加
      modal.addComponents(
        new ActionRowBuilder().addComponents(bodyInput)
      );

      // ユーザーにモーダルを表示
      await interaction.showModal(modal);

    } catch (err) {
      console.error('[totsusuna_setti:input_body] モーダル表示エラー:', err);

      // エラー発生時、返信が未済みならエフェメラルでエラーメッセージを送信
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ モーダルの表示に失敗しました。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }
    }
  },
};
