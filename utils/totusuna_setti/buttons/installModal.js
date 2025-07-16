// 

const {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  MessageFlagsBitField,
} = require('discord.js');
const { tempStore } = require('../../tempStore');
const requireAdmin = require('../../permissions/requireAdmin');

/**
 * 凸スナ設置用モーダルの処理
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
async function actualHandler(interaction) {
  try {
    // 1. タイムアウトを回避するため、即座に応答を遅延させます
    await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const key = `${guildId}:${userId}`;

    // 2. モーダルから入力データを取得します
    const inputData = {
      body: interaction.fields.getTextInputValue('body'),
      title: interaction.fields.getTextInputValue('title') || '📣 凸スナ報告受付中', // デフォルトタイトル
    };

    if (!inputData.body) {
      return await interaction.editReply({ content: '❌ 本文は必須入力です。' });
    }

    // 3. 次のステップ（チャンネル選択）のために、データを一時保存します
    tempStore.set(key, {
      data: inputData,
      timestamp: Date.now(),
    });

    // 4. チャンネル選択メニューを作成します
    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId('totusuna_channel_select:install') // このIDは installChannelSelect.js で処理されます
      .setPlaceholder('メッセージを設置するチャンネルを選択してください')
      .setMinValues(1)
      .setMaxValues(1);

    const row = new ActionRowBuilder().addComponents(channelSelect);

    // 5. ユーザーにチャンネル選択メニューを提示します
    await interaction.editReply({
      content: '✅ 本文を受け付けました。\n次に、この凸スナ案内を設置するチャンネルを選択してください。',
      components: [row],
    });
  } catch (err) {
    console.error('[installModal.js] 凸スナ設置処理エラー:', err);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: '❌ 処理中にエラーが発生しました。', components: [], embeds: [] });
    }
  }
}

module.exports = {
  customId: 'totusuna_install_modal',
  handle: requireAdmin(actualHandler), // 管理者権限を要求
};

