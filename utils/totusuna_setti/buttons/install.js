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
   * 凸スナ設置の処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    try {
      // 一時保存データを取得
      const state = tempState.get(guildId, userId);

      if (!state || !state.body || !state.installChannelId) {
        return await interaction.reply({
          content: '⚠️ 本文またはチャンネル設定が不足しています。',
          flags: 1 << 6, // MessageFlags.Ephemeral
        });
      }

      // 新規UUID生成
      const uuid = uuidv4();

      // Embedを構築
      const embed = new EmbedBuilder()
        .setTitle('📣 凸スナ報告受付中')
        .setDescription(state.body)
        .setColor(0x00bfff);

      // ボタンを構築（UUID付与）
      const button = new ButtonBuilder()
        .setCustomId(`totsuna:report:${uuid}`)
        .setLabel('凸スナ報告')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      // 設置チャンネルを取得し送信
      const installChannel = await interaction.guild.channels.fetch(state.installChannelId);
      if (!installChannel?.isTextBased?.()) throw new Error('対象チャンネルが無効です');

      const sentMessage = await installChannel.send({
        embeds: [embed],
        components: [row],
      });

      // JSONファイルの準備と読み込み
      const jsonPath = await ensureGuildJSON(guildId);
      const json = await readJSON(jsonPath);

      // 初期化処理
      if (!json.totsuna) json.totsuna = {};
      if (!Array.isArray(json.totsuna.instances)) json.totsuna.instances = [];

      // 新しい設置情報を追加
      json.totsuna.instances.push({
        id: uuid,
        userId,
        body: state.body,
        installChannelId: state.installChannelId,
        replicateChannelIds: state.replicateChannelIds || [],
        messageId: sentMessage.id,
      });

      // JSON保存      await writeJSON(jsonPath, json);

      // 一時データ削除
      tempState.delete(guildId, userId);

      // 成功レスポンス
      await interaction.reply({
        content: '✅ 凸スナ設置が完了しました。',
        flags: 1 << 6, // MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error('[設置ボタン処理エラー]', error);

      const errorReply = {
        content: '❌ 設置処理中に予期せぬエラーが発生しました。',
        flags: 1 << 6,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorReply);
      } else {
        await interaction.reply(errorReply);
      }
    }
  },
};
