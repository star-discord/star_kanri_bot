const fs = require('fs');
const path = require('path');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlagsBitField,
} = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const tempState = require('../state/totusunaTemp');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper');

module.exports = {
  customId: 'totusuna_setti:install',

  /**
   * 凸スナ設置の処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    try {
      // 一時保存データの取得
      const state = tempState.get(guildId, userId);
      if (!state || !state.body || !state.installChannelId) {
        return await interaction.reply({
          content: '⚠️ 本文または設置チャンネルが設定されていません。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }

      // UUID生成
      const uuid = uuidv4();

      // Embed作成
      const embed = new EmbedBuilder()
        .setTitle('📣 凸スナ報告受付中')
        .setDescription(state.body)
        .setColor(0x00bfff);

      // ボタン作成
      const button = new ButtonBuilder()
        .setCustomId(`totsuna:report:${uuid}`)
        .setLabel('凸スナ報告')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      // チャンネル取得・検証
      const installChannel = await interaction.guild.channels.fetch(state.installChannelId);
      if (!installChannel || !installChannel.isTextBased?.()) {
        throw new Error('設置先チャンネルがテキストチャンネルではありません。');
      }

      // メッセージ送信
      const sentMessage = await installChannel.send({
        embeds: [embed],
        components: [row],
      });

      // JSONファイルのパス確保と読み込み
      const jsonPath = await ensureGuildJSON(guildId);
      const json = await readJSON(jsonPath);

      // データ構造の初期化
      if (!json.totsuna) json.totsuna = {};
      if (!Array.isArray(json.totsuna.instances)) json.totsuna.instances = [];

      // 設置情報追加
      json.totsuna.instances.push({
        id: uuid,
        userId,
        body: state.body,
        installChannelId: state.installChannelId,
        replicateChannelIds: Array.isArray(state.replicateChannelIds) ? state.replicateChannelIds : [],
        messageId: sentMessage.id,
      });

      // JSON保存
      await writeJSON(jsonPath, json);

      // 一時データ削除
      tempState.delete(guildId, userId);

      // 完了通知
      await interaction.reply({
        content: '✅ 凸スナ設置が完了しました。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    } catch (error) {
      console.error(`[totsuna_setti:install] エラー:`, error);

      const errorReply = {
        content: '❌ 凸スナ設置処理中にエラーが発生しました。管理者に連絡してください。',
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
