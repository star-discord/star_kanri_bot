const fs = require('fs').promises;
const path = require('path');
const { MessageFlagsBitField } = require('discord.js');

module.exports = {
  customIdStart: 'totsusuna_setti:delete_body:',

  /**
   * 凸スナ本文削除ボタンの処理
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
      return interaction.editReply({
        content: '⚠️ ギルドIDが取得できません。'
      });
    }

    if (!interaction.guild) {
      return interaction.editReply({
        content: '⚠️ ギルド情報が取得できません。'
      });
    }

    // UUIDの抽出を substring に変更（安全な切り出し）
    const uuid = interaction.customId.substring(this.customIdStart.length);

    // dataディレクトリの絶対パス
    const dataPath = path.resolve(__dirname, '..', '..', '..', 'data', guildId, `${guildId}.json`);

    // ファイルの存在確認
    try {
      await fs.access(dataPath);
    } catch {
      return interaction.editReply({
        content: '⚠️ データファイルが存在しません。'
      });
    }

    let json;
    try {
      const fileContent = await fs.readFile(dataPath, 'utf8');
      json = JSON.parse(fileContent);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] JSON読み込みエラー:`, err);
      return interaction.editReply({
        content: `❌ データの読み込みに失敗しました。エラー内容: ${err.message}`
      });
    }

    const instances = json.totsusuna?.instances;
    if (!Array.isArray(instances)) {
      return interaction.editReply({
        content: '⚠️ 凸スナ情報が不正な形式です。'
      });
    }

    const targetIndex = instances.findIndex(i => i.id === uuid);
    if (targetIndex === -1) {
      return interaction.editReply({
        content: '⚠️ 指定された設置が見つかりません。'
      });
    }

    const target = instances[targetIndex];

    try {
      const channel = await interaction.guild.channels.fetch(target.installChannelId);
      if (channel && target.messageId) {
        const message = await channel.messages.fetch(target.messageId).catch(() => null);
        if (message) {
          await message.delete();
        } else {
          console.warn(`[${new Date().toISOString()}] メッセージが見つかりません: チャンネルID=${target.installChannelId}, メッセージID=${target.messageId}`);
        }
      } else {
        console.warn(`[${new Date().toISOString()}] チャンネルまたはメッセージIDが不正: チャンネル=${target.installChannelId}, メッセージID=${target.messageId}`);
      }
    } catch (err) {
      console.warn(`[${new Date().toISOString()}] メッセージ削除失敗:`, err);
    }

    // 配列から削除
    instances.splice(targetIndex, 1);

    try {
      await fs.writeFile(dataPath, JSON.stringify(json, null, 2), 'utf8');
    } catch (err) {
      console.error(`[${new Date().toISOString()}] JSON書き込み失敗:`, err);
      return interaction.editReply({
        content: '❌ データの保存に失敗しました。'
      });
    }

    try {
      await interaction.editReply({
        content: '🗑️ 凸スナ本文を削除しました。'
      });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] reply送信失敗:`, err);
    }
  },
};
