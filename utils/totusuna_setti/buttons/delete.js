// utils/totusuna_setti/buttons/delete.js
const fs = require('fs');
const path = require('path');
const { MessageFlagsBitField } = require('discord.js');

module.exports = {
  customIdStart: 'totsusuna_setti:delete:',

  /**
   * 凸スナ設置データの削除処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace(this.customIdStart, '');
    const filePath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(filePath)) {
      return await interaction.reply({
        content: '⚠️ データファイルが見つかりません。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const list = json.totsusuna?.instances;

    if (!Array.isArray(list)) {
      return await interaction.reply({
        content: '⚠️ インスタンスデータが存在しません。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    const targetIndex = list.findIndex(i => i.id === uuid);
    if (targetIndex === -1) {
      return await interaction.reply({
        content: '⚠️ 指定された設置データが見つかりません。',
        flags: MessageFlagsBitField.Ephemeral,
      });
    }

    const instance = list[targetIndex];

    // メッセージ削除処理
    if (instance.messageId && instance.installChannelId) {
      try {
        const channel = await interaction.guild.channels.fetch(instance.installChannelId);
        const message = await channel.messages.fetch(instance.messageId);
        if (message) await message.delete();
      } catch (err) {
        console.warn(`[totsusuna_setti:delete] メッセージ削除失敗: ${err.message}`);
        // エラーは無視して続行
      }
    }

    // 配列から削除して保存
    list.splice(targetIndex, 1);
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8');

    await interaction.reply({
      content: '🗑️ 凸スナ設置データを削除しました。',
      flags: MessageFlagsBitField.Ephemeral,
    });
  },
};
