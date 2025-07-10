// utils/totusuna_setti/buttons/本文削除.js
const fs = require('fs');
const path = require('path');

module.exports = {
  async handle(interaction, uuid) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    // ファイル存在チェック
    if (!fs.existsSync(dataPath)) {
      return interaction.reply({ content: '❌ 設定ファイルが見つかりません。', ephemeral: true });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const instance = data?.totsusuna?.[uuid];

    if (!instance) {
      return interaction.reply({ content: '⚠️ 該当する本文が見つかりません。', ephemeral: true });
    }

    // メッセージ削除処理
    try {
      const channel = await interaction.guild.channels.fetch(instance.installChannelId);
      if (channel && instance.messageId) {
        const message = await channel.messages.fetch(instance.messageId).catch(() => null);
        if (message) await message.delete();
      }
    } catch (e) {
      console.warn(`[削除] メッセージ削除失敗: ${e}`);
    }

    // JSONから削除して保存
    delete data.totsusuna[uuid];
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    await interaction.reply({ content: '🗑️ 本文とボタンを削除しました。', ephemeral: true });
  }
};
