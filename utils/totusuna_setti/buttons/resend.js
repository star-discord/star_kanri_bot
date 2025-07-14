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
    const uuid = interaction.customId.replace(this.customIdStart, '');

    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    // データファイル存在チェック
    try {
      await fs.access(dataPath);
    } catch {
      return await interaction.reply({
        content: '⚠️ データファイルが見つかりません。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    // JSON読み込み
    let json;
    try {
      const fileContent = await fs.readFile(dataPath, 'utf8');
      json = JSON.parse(fileContent);
    } catch (err) {
      console.error('[再送信] JSON読み込みエラー:', err);
      return await interaction.reply({
        content: '❌ データファイルの読み込みに失敗しました。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    const instances = json.totusuna?.instances ?? [];
    const instance = instances.find(i => i.id === uuid);

    if (!instance) {
      return await interaction.reply({
        content: '⚠️ 対象の設置データが見つかりません。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    // チャンネル取得・検証
    let channel;
    try {
      channel = await interaction.guild.channels.fetch(instance.installChannelId);
      if (!channel || !channel.isTextBased()) {
        return await interaction.reply({
          content: '⚠️ 対象チャンネルがテキストチャンネルではありません。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    } catch (err) {
      console.warn(`[再送信] チャンネル取得失敗: ${instance.installChannelId}`, err);
      return await interaction.reply({
        content: '⚠️ 対象チャンネルが存在しないか、取得に失敗しました。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    try {
      // 古いメッセージ削除（あれば）
      if (instance.messageId) {
        try {
          const oldMessage = await channel.messages.fetch(instance.messageId);
          if (oldMessage) await oldMessage.delete();
        } catch {
          // メッセージ削除失敗は警告ログのみ
          console.warn('[再送信] 古い設置メッセージの削除に失敗');
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
