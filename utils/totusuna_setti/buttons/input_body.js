const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlagsBitField,
} = require('discord.js');

module.exports = {
  customId: 'totsusuna_setti:input_body',

  /**
   * 凸スナ本文入力モーダルを表示する処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    try {
      // モーダルのカスタムIDはボタンのcustomIdに連動させて一貫性を持たせる
      const modalCustomId = `${this.customId}_modal`;

      const modal = new ModalBuilder()
        .setCustomId(modalCustomId)
        .setTitle('📘 凸スナ本文を作成');

      const bodyInput = new TextInputBuilder()
        .setCustomId('body')
        .setLabel('📄 本文を入力してください（例：報告はこちら！）')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(bodyInput));

      await interaction.showModal(modal);
    } catch (err) {
      console.error(new Date().toISOString(), `[${this.customId}] モーダル表示エラー:`, err);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ モーダルの表示に失敗しました。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    }
  },
};

