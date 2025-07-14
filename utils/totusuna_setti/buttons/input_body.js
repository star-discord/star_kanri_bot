const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');

module.exports = {
  customId: 'totsusuna_setti:input_body', // 英語名に統一

  /**
   * 凸スナ本斁E�E力モーダルを表示する処琁E
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    try {
      // モーダルを作�E
      const modal = new ModalBuilder()
        .setCustomId('totsusuna_modal_body_input:input')
        .setTitle('📘 凸スナ本斁E�E作�E');

      // 本斁E�E力欁E��作�E
      const bodyInput = new TextInputBuilder()
        .setCustomId('body')
        .setLabel('📄 本斁E��入力してください�E�例：報告�Eこちら！E��E)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      // モーダルに入力欁E��追加
      modal.addComponents(
        new ActionRowBuilder().addComponents(bodyInput)
      );

      // モーダルをユーザーに表示
      await interaction.showModal(modal);

    } catch (err) {
      console.error('[totsusuna_setti:input_body] モーダル表示エラー:', err);

      // まだ返信・応答してぁE��ければエラーメチE��ージを返信
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❁Eモーダルの表示に失敗しました、E,
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    }
  },
};
