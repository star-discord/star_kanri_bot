// utils/totusuna_setti/modals/installModal.js
const {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  MessageFlagsBitField,
} = require('discord.js');
const { tempStore } = require('../../tempStore');
const { checkAdmin } = require('../../permissions/checkAdmin');
const { createAdminRejectEmbed } = require('../../embedHelper');

/**
 * Handles the submission of the "Totsuna Install" modal.
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
async function actualHandler(interaction) {
  try {
    // 1. 【重要】タイムアウトを回避するため、他の処理より先に必ず応答を遅延させます。
    await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

    // 2. 応答遅延の後で、時間のかかる可能性のある管理者チェックを実行します。
    const isAdmin = await checkAdmin(interaction);
    if (!isAdmin) {
      return await interaction.editReply({ embeds: [createAdminRejectEmbed()] });
    }

    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const key = `${guildId}:${userId}`;

    // 2. Extract data from the modal fields.
    const inputData = {
      body: interaction.fields.getTextInputValue('body'),
      title: interaction.fields.getTextInputValue('title') || '凸スナ報告受付中', // Provide a default title
    };

    console.log(`📝 [installModal] 処理開始 | guildId: ${guildId}`);

    // 3. Store the extracted data temporarily for the next step (channel selection).
    tempStore.set(key, {
      data: inputData,
      timestamp: Date.now(),
    });
    console.log(`💾 [installModal] 一時データを保存: key=${key}`);

    // 4. Create the channel selection menu.
    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId('totusuna_channel_select:install') // Use a specific customId for this action
      .setPlaceholder('メッセージを設置するチャンネルを選択してください')
      .setMinValues(1)
      .setMaxValues(1);

    const row = new ActionRowBuilder().addComponents(channelSelect);

    // 5. Update the deferred reply to show the channel select menu to the user.
    await interaction.editReply({
      content: '✅ 本文を受け付けました。\n次に、この凸スナ案内を設置するチャンネルを選択してください。',
      components: [row],
    });

  } catch (error) {
    console.error('💥 [installModal] エラー:', error);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: '⚠️ モーダルの処理中にエラーが発生しました。', components: [], embeds: [] })
        .catch(e => console.error('💥 [installModal] エラー応答の編集に失敗:', e));
    }
  }
}

module.exports = {
  customId: 'totusuna_install_modal',
  handle: actualHandler,
};