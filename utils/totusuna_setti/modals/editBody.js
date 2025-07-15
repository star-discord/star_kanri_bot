// utils/totusuna_setti/modals/editBody.js

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlagsBitField,
} = require('discord.js');
const { configManager } = require('../../configManager');

module.exports = {
  customIdStart: 'totusuna_edit_modal:',

  /**
   * 本文編集モーダル送信後処理
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

    const modalId = interaction.customId;
    const uuid = modalId.replace(module.exports.customIdStart, '');
    const guildId = interaction.guildId;
    const inputText = interaction.fields.getTextInputValue('body').trim();

    try {
      // Add validation for the input text
      if (!inputText) {
        return await interaction.editReply({ content: '⚠️ 本文を空にすることはできません。' });
      }

      const success = await configManager.updateTotusunaInstance(guildId, uuid, { body: inputText });

      if (!success) {
        return await interaction.editReply({ content: '⚠️ 指定された設置データが存在しません。' });
      }

      // Update the original message
      const instance = await configManager.getTotusunaInstance(guildId, uuid);
      if (instance?.messageId && instance.installChannelId) {
        try {
          const channel = await interaction.guild.channels.fetch(instance.installChannelId);
          const message = await channel.messages.fetch(instance.messageId);

          const embed = new EmbedBuilder()
            .setTitle('📣 凸スナ報告受付中')
            .setDescription(inputText)
            .setColor(0x00bfff);

          const button = new ButtonBuilder()
            .setCustomId(`totusuna_report_button_${uuid}`)
            .setLabel('凸スナ報告')
            .setStyle(ButtonStyle.Primary);

          const row = new ActionRowBuilder().addComponents(button);

          await message.edit({ embeds: [embed], components: [row] });
        } catch (msgError) {
          console.warn(`[editBody] メッセージの更新に失敗しました (instance: ${uuid}):`, msgError.message);
          return await interaction.editReply({ content: '✅ 本文の保存には成功しましたが、設置メッセージの更新には失敗しました。' });
        }
      }

      await interaction.editReply({ content: '✅ 本文を更新し、表示も変更しました。' });

    } catch (error) {
      console.error(`[editBody] 処理エラー (uuid: ${uuid}):`, error);
      if (interaction.deferred) {
        await interaction.editReply({ content: '❌ 本文の更新中に予期せぬエラーが発生しました。' });
      }
    }
  },
};
