const fs = require('fs');
const path = require('path');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const tempState = require('../state/totsusunaTemp');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper');

module.exports = {
  customId: 'totsuna_setti:install',

  /**
   * 凸スナ設置の処琁E
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    try {
      // 一時保存データを取征E
      const state = tempState.get(guildId, userId);

      if (!state || !state.body || !state.installChannelId) {
        return await interaction.reply({
          content: '⚠�E�E本斁E��た�Eチャンネル設定が不足してぁE��す、E,
          flags: MessageFlagsBitField.Ephemeral, // MessageFlags.Ephemeral
        });
      }

      // 新規UUID生�E
      const uuid = uuidv4();

      // Embedを構篁E
      const embed = new EmbedBuilder()
        .setTitle('📣 凸スナ報告受付中')
        .setDescription(state.body)
        .setColor(0x00bfff);

      // ボタンを構築！EUID付与！E
      const button = new ButtonBuilder()
        .setCustomId(`totsuna:report:${uuid}`)
        .setLabel('凸スナ報呁E)
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      // 設置チャンネルを取得し送信
      const installChannel = await interaction.guild.channels.fetch(state.installChannelId);
      if (!installChannel?.isTextBased?.()) throw new Error('対象チャンネルが無効でぁE);

      const sentMessage = await installChannel.send({
        embeds: [embed],
        components: [row],
      });

      // JSONファイルの準備と読み込み
      const jsonPath = await ensureGuildJSON(guildId);
      const json = await readJSON(jsonPath);

      // 初期化�E琁E
      if (!json.totsuna) json.totsuna = {};
      if (!Array.isArray(json.totsuna.instances)) json.totsuna.instances = [];

      // 新しい設置惁E��を追加
      json.totsuna.instances.push({
        id: uuid,
        userId,
        body: state.body,
        installChannelId: state.installChannelId,
        replicateChannelIds: state.replicateChannelIds || [],
        messageId: sentMessage.id,
      });

      // JSON保孁E
      await writeJSON(jsonPath, json);

      // 一時データ削除
      tempState.delete(guildId, userId);

      // 成功レスポンス
      await interaction.reply({
        content: '✁E凸スナ設置が完亁E��ました、E,
        flags: MessageFlagsBitField.Ephemeral, // MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error('[設置ボタン処琁E��ラー]', error);

      const errorReply = {
        content: '❁E設置処琁E��に予期せぬエラーが発生しました、E,
        flags: MessageFlagsBitField.Ephemeral,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorReply);
      } else {
        await interaction.reply(errorReply);
      }
    }
  },
};
