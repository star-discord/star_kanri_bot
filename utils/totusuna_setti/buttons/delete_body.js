const fs = require('fs');
const path = require('path');
const { MessageFlagsBitField } = require('discord.js');

module.exports = {
  customIdStart: 'totsusuna_setti:delete_body:',

  /**
   * 凸スナ本文削除ボタンの処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace(this.customIdStart, '');
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    // データファイルの存在確認
    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '⚠️ データファイルが見つかりません。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    // JSON 読み込み
    let json;
    try {
      json = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (err) {
      console.error('[delete_body] JSON読み込みエラー:', err);
      return await interaction.reply({
        content: '❌ データの読み込みに失敗しました。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    const instances = json.totsusuna?.instances;
    if (!Array.isArray(instances)) {
      return await interaction.reply({
        content: '⚠️ 凸スナ情報が不正です。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    const targetIndex = instances.findIndex(i => i.id === uuid);
    if (targetIndex === -1) {
      return await interaction.reply({
        content: '⚠️ 指定された設置は存在しません。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    const target = instances[targetIndex];

    // メッセージ削除処理
    try {
      const channel = await interaction.guild.channels.fetch(target.installChannelId);
      if (channel && target.messageId) {
        const message = await channel.messages.fetch(target.messageId).catch(() => null);
        if (message) await message.delete();
      }
    } catch (err) {
      console.warn(`[delete_body] メッセージ削除に失敗: ${err.message}`);
    }

    // JSON から削除して保存
    instances.splice(targetIndex, 1);
    fs.writeFileSync(dataPath, JSON.stringify(json, null, 2), 'utf8');

    await interaction.reply({
      content: '🗑️ 本文を削除しました。',
      flags: MessageFlagsBitField.Ephemeral,
    });
  },
};

