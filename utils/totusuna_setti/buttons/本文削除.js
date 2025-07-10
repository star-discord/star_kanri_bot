// utils/totusuna_setti/buttons/本文削除.js
const fs = require('fs');
const path = require('path');

module.exports = {
  async handle(interaction, uuid) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({ content: '⚠ データファイルが見つかりません。', ephemeral: true });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const instance = json.totsusuna?.[uuid];

    if (!instance) {
      return await interaction.reply({ content: '⚠ 設定情報が見つかりません。', ephemeral: true });
    }

    try {
      const channel = await interaction.guild.channels.fetch(instance.installChannelId);
      if (channel && instance.messageId) {
        const msg = await channel.messages.fetch(instance.messageId).catch(() => null);
        if (msg) await msg.delete();
      }
    } catch (err) {
      console.warn('⚠ メッセージ削除に失敗:', err.message);
    }

    delete json.totsusuna[uuid];
    fs.writeFileSync(dataPath, JSON.stringify(json, null, 2));

    await interaction.reply({ content: '🗑 凸スナ本文を削除しました。', ephemeral: true });
  },
};
