const fs = require('fs');
const path = require('path');

module.exports = {
  customIdStart: 'totsusuna_setti:本文削除:',

  /**
   * 凸スナ本文削除ボタンの処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace(this.customIdStart, '');
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '⚠️ データファイルが見つかりません。',
        ephemeral: true,
      });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const instances = json.totusuna?.instances;

    if (!instances || typeof instances !== 'object') {
      return await interaction.reply({
        content: '⚠️ 凸スナ情報が不正です。',
        ephemeral: true,
      });
    }

    const target = instances[uuid];
    if (!target) {
      return await interaction.reply({
        content: '⚠️ 指定された設置は存在しません。',
        ephemeral: true,
      });
    }

    try {
      const channel = await interaction.guild.channels.fetch(target.messageChannelId);
      if (channel && target.messageId) {
        const message = await channel.messages.fetch(target.messageId).catch(() => null);
        if (message) await message.delete();
      }
    } catch (err) {
      console.warn(`⚠️ メッセージ削除に失敗: ${err.message}`);
    }

    delete instances[uuid];
    fs.writeFileSync(dataPath, JSON.stringify(json, null, 2));

    await interaction.reply({
      content: '🗑 本文を削除しました。',
      ephemeral: true,
    });
  },
};
