const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlagsBitField,
} = require('discord.js');

const CUSTOM_ID_START = 'totusuna_report_button_';

module.exports = {
  customIdStart: CUSTOM_ID_START,

  /**
   * 凸スナ報告ボタン押下時の処理：モーダルを表示
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    try {
      const { customId } = interaction;

      // customIdが期待した形式かチェック
      if (!customId.startsWith(CUSTOM_ID_START)) {
        console.warn(`[totusuna_report_button] 不正なcustomId: ${customId}`);
        return await interaction.reply({
          content: '❌ 不正なボタン操作です。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }

      // UUID部分を切り出す
      const uuid = customId.substring(CUSTOM_ID_START.length);
      if (!uuid) {
        console.warn('[totusuna_report_button] UUIDが抽出できません');
        return await interaction.reply({
          content: '❌ 凸スナ識別子が不正です。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }

      // モーダル作成
      const modal = new ModalBuilder()
        .setCustomId(`totusuna_modal_${uuid}`)
        .setTitle('📝 凸スナ報告フォーム');

      // 各入力欄の作成。最大文字数も設定（必要に応じて調整）
      const groupInput = new TextInputBuilder()
        .setCustomId('group')
        .setLabel('組数（何組）')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(10)
        .setRequired(true);

      const nameInput = new TextInputBuilder()
        .setCustomId('name')
        .setLabel('人数（何名）')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(10)
        .setRequired(true);

      const table1 = new TextInputBuilder()
        .setCustomId('table1')
        .setLabel('卓1（任意）')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20)
        .setRequired(false);

      const table2 = new TextInputBuilder()
        .setCustomId('table2')
        .setLabel('卓2（任意）')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20)
        .setRequired(false);

      const detail = new TextInputBuilder()
        .setCustomId('detail')
        .setLabel('補足・詳細（任意）')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(4000) // Discordのテキスト入力最大値
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder().addComponents(groupInput),
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(table1),
        new ActionRowBuilder().addComponents(table2),
        new ActionRowBuilder().addComponents(detail),
      );

      // モーダルを表示
      await interaction.showModal(modal);
    } catch (error) {
      console.error('[totusuna_report_button] モーダル表示エラー:', error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ モーダルの表示に失敗しました。再度お試しください。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    }
  },
};
