const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../../utils/fileHelper');
const tempStore = require('../state/totusunaTemp');

module.exports = {
  customIdStart: 'totusuna_modal_body_input:',

  /**
   * 凸スナ本文モーダルの送信後処理
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const inputText = interaction.fields.getTextInputValue('body');

    // ユーザーデータ取得
    const userData = tempStore.get(guildId, userId);
    if (!userData?.installChannelId) {
      return await interaction.reply({
        content: '⚠️ 設置チャンネルが未設定です。先にチャンネルを選択してください。',
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const jsonPath = await ensureGuildJSON(guildId);
      const json = await readJSON(jsonPath);

      if (!json.totusuna) json.totusuna = {};
      if (!Array.isArray(json.totusuna.instances)) json.totusuna.instances = [];

      const uuid = uuidv4();

      const newInstance = {
        id: uuid,
        userId,
        body: inputText,
        installChannelId: userData.installChannelId,
        replicateChannelIds: userData.replicateChannelIds || [],
      };

      // Embedとボタン作成
      const embed = new EmbedBuilder()
        .setTitle('📣 凸スナ報告受付中')
        .setDescription(inputText)
        .setColor(0x00bfff);

      const button = new ButtonBuilder()
        .setCustomId(`totusuna_report_button_${uuid}`) // 統一したプレフィックス
        .setLabel('凸スナ報告')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      // チャンネル取得・送信
      const targetChannel = await interaction.guild.channels.fetch(userData.installChannelId);
      if (!targetChannel?.isTextBased()) {
        return await interaction.reply({
          content: '⚠️ 指定された設置チャンネルがテキストチャンネルではありません。',
          flags: MessageFlags.Ephemeral,
        });
      }

      const sentMessage = await targetChannel.send({
        embeds: [embed],
        components: [row],
      });

      newInstance.messageId = sentMessage.id;
      json.totusuna.instances.push(newInstance);

      await writeJSON(jsonPath, json);

      await interaction.reply({
        content: '✅ 本文を保存し、凸スナボタンを設置しました。',
        flags: MessageFlags.Ephemeral,
      });

    } catch (error) {
      console.error('[totusuna_modal_body_input] 処理中にエラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ 凸スナ設置処理中にエラーが発生しました。',
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
