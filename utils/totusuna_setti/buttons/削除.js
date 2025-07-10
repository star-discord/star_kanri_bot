const fs = require('fs');
const path = require('path');

module.exports = {
  customIdStart: 'tousuna_delete_',

  async handle(interaction) {
    const guildId = interaction.guildId;
    const customId = interaction.customId;
    const uuid = customId.replace('tousuna_delete_', '');

    const filePath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(filePath)) {
      return await interaction.reply({ content: '⚠ データファイルが見つかりません。', flags: InteractionResponseFlags.Ephemeral });
    }

    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const data = json.totsusuna;

    if (!data || !data[uuid]) {
      return await interaction.reply({ content: '⚠ 対象の設定が見つかりません。', flags: InteractionResponseFlags.Ephemeral });
    }

    // メッセージ削除（存在すれば）
    try {
      const channel = await interaction.guild.channels.fetch(data[uuid].installChannelId);
      const message = await channel.messages.fetch(data[uuid].messageId);
      if (message) await message.delete();
    } catch (e) {
      console.warn(`⚠ メッセージ削除失敗: ${e.message}`);
    }

    // データ削除
    delete data[uuid];
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));

    await interaction.reply({ content: '🗑 設定とメッセージを削除しました。', flags: InteractionResponseFlags.Ephemeral });
  },
};
