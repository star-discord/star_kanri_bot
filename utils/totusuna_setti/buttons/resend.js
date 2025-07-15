// utils/totusuna_setti/buttons/resend.js

const fs = require('fs').promises;
const path = require('path');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlagsBitField,
} = require('discord.js');

module.exports = {
  customIdStart: 'totusuna_setti:resend:',

  /**
   * 凸スナ再送信処理：設置メッセージを再投稿
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;

    // customIdを安全にパース
    if (!interaction.customId.startsWith(this.customIdStart)) {
      console.warn(`[再送信] 不正なcustomIdを検出: ${interaction.customId}`);
      return; // 不正なIDの場合は処理を中断
    }
    const uuid = interaction.customId.slice(this.customIdStart.length);

    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    // データファイルの読み込みとインスタンスの検索
    let json;
    let instance;
    try {
      const fileContent = await fs.readFile(dataPath, 'utf8');
      json = JSON.parse(fileContent);
      const instances = json.totusuna?.instances ?? [];
      instance = instances.find(i => i.id === uuid);
    } catch (err) {
      console.error(`[再送信] データファイルの読み込みまたはパースに失敗: ${dataPath}`, err);
      return await interaction.reply({
        content: '❌ データの読み込みに失敗しました。管理者にご連絡ください。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    // インスタンスまたは必須プロパティの存在チェック
    if (!instance || !instance.installChannelId) {
      console.warn(`[再送信] 対象の設置データが見つからないか、データが不完全です。 UUID: ${uuid}`);
      return await interaction.reply({
        content: '⚠️ 対象の設置データが見つからないか、データが不完全です。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    // チャンネル取得・検証
    const channel = await interaction.guild.channels.fetch(instance.installChannelId).catch(err => {
      console.error(`[再送信] チャンネル取得失敗: ${instance.installChannelId}`, err);
      return null;
    });

    if (!channel) {
      return await interaction.reply({
        content: '⚠️ 対象チャンネルが存在しないか、Botがアクセスできません。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }
    if (!channel.isTextBased()) {
      if (!channel || !channel.isTextBased()) {
        return await interaction.reply({
          content: '⚠️ 対象チャンネルがテキストチャンネルではありません。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    }

    try {
      // 古いメッセージ削除（あれば）
      if (instance.messageId) {
        try {
          const oldMessage = await channel.messages.fetch(instance.messageId);
          if (oldMessage) await oldMessage.delete();
        } catch (err) {
          // メッセージが既に削除されている場合など。エラーではないため警告ログに留める
          console.warn(`[再送信] 古い設置メッセージの削除に失敗しました。MessageID: ${instance.messageId}`, err);
        }
      }

      // Embed作成
      const embed = new EmbedBuilder()
        .setTitle('📣 凸スナ報告受付中')
        .setDescription(instance.body || '(本文なし)')
        .setColor(0x00bfff);

      // ボタン作成
      const button = new ButtonBuilder()
        .setCustomId(`totusuna_report_button_${uuid}`)
        .setLabel('凸スナ報告')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      // メッセージ送信
      const sentMessage = await channel.send({ embeds: [embed], components: [row] });

      // 新しいmessageIdを保存
      instance.messageId = sentMessage.id;

      // JSON書き込み
      await fs.writeFile(dataPath, JSON.stringify(json, null, 2), 'utf8');

      await interaction.reply({
        content: '📤 再送信しました。設置チャンネルに投稿されました。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    } catch (err) {
      console.error('[再送信] メッセージ再送信エラー:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ メッセージの再送信に失敗しました。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    }
  },
};
