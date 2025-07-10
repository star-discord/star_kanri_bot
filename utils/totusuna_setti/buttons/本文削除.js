// utils/totusuna_setti/buttons/本文削除.js
const fs = require('fs');
const path = require('path');

module.exports = {
  async handle(interaction, uuid) {
    const guildId = interaction.guildId;
    const dataDir = path.join(__dirname, '../../../data', guildId);
    const dataFile = path.join(dataDir, `${guildId}.json`);

    if (!fs.existsSync(dataFile)) {
      return interaction.reply({ content: '❌ 設定ファイルが見つかりません。', ephemeral: true });
    }

    const json = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const instance = json.totsusuna?.[uuid];

    if (!instance) {
      return interaction.reply({ content: '⚠️ 指定の凸スナが見つかりません。', ephemeral: true });
    }

    try {
      const channel = await interaction.guild.channels.fetch(instance.installChannelId);
      if (channel && instance.messageId) {
        const message = await channel.messages.fetch(instance.messageId).catch(() => null);
        if (message) await message.delete();
      }
    } catch (err) {
      console.warn(`[削除処理] メッセージ削除に失敗: ${err.message}`);
    }

    delete json.totsusuna[uuid];
    fs.writeFileSync(dataFile, JSON.stringify(json, null, 2));

    await interaction.reply({ content: '🗑️ 本文を削除しました。', ephemeral: true });
  }
};
