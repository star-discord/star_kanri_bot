// utils/totusuna_setti/buttons/delete.js
const fs = require('fs').promises;
const path = require('path');
const { MessageFlagsBitField } = require('discord.js');

module.exports = {
  customIdStart: 'totsusuna_setti:delete:',

  /**
   * 凸スナ設置データの削除処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] deferReply失敗:`, err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ 応答準備中にエラーが発生しました。',
          flags: MessageFlagsBitField.Ephemeral,
        }).catch(() => {});
      }
      return;
    }

    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.editReply({ content: '⚠️ ギルドIDが取得できません。' });
    }

    if (!interaction.guild) {
      return interaction.editReply({ content: '⚠️ ギルド情報が取得できません。' });
    }

    const uuid = interaction.customId.substring(this.customIdStart.length);
    const filePath = path.resolve(__dirname, '..', '..', '..', 'data', guildId, `${guildId}.json`);

    // ファイル存在チェック
    try {
      await fs.access(filePath);
    } catch {
      return interaction.editReply({ content: '⚠️ データファイルが見つかりません。' });
    }

    let json;
    try {
      const fileData = await fs.readFile(filePath, 'utf8');
      json = JSON.parse(fileData);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] JSON読み込みエラー:`, err);
      return interaction.editReply({ content: '❌ データの読み込みに失敗しました。' });
    }

    const list = json.totsusuna?.instances;
    if (!Array.isArray(list)) {
      return interaction.editReply({ content: '⚠️ インスタンスデータが存在しません。' });
    }

    const targetIndex = list.findIndex(i => i.id === uuid);
    if (targetIndex === -1) {
      return interaction.editReply({ content: '⚠️ 指定された設置データが見つかりません。' });
    }

    const instance = list[targetIndex];

    // メッセージ削除処理
    if (instance.messageId && instance.installChannelId) {
      try {
        const channel = await interaction.guild.channels.fetch(instance.installChannelId);
        if (channel) {
          const message = await channel.messages.fetch(instance.messageId).catch(() => null);
          if (message) {
            await message.delete();
          } else {
            console.warn(`[${new Date().toISOString()}] メッセージが見つかりません: チャンネルID=${instance.installChannelId}, メッセージID=${instance.messageId}`);
          }
        } else {
          console.warn(`[${new Date().toISOString()}] チャンネルが見つかりません: ${instance.installChannelId}`);
        }
      } catch (err) {
        console.warn(`[${new Date().toISOString()}] メッセージ削除失敗:`, err);
        // 削除失敗は致命的ではないため無視
      }
    }

    // 配列から削除して保存
    list.splice(targetIndex, 1);
    try {
      await fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8');
    } catch (err) {
      console.error(`[${new Date().toISOString()}] JSON書き込み失敗:`, err);
      return interaction.editReply({ content: '❌ データの保存に失敗しました。' });
    }

    try {
      await interaction.editReply({
        content: '🗑️ 凸スナ設置データを削除しました。',
      });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] 応答送信失敗:`, err);
    }
  },
};
