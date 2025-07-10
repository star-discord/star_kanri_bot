const fs = require('fs');
const path = require('path');
const { InteractionResponseFlags } = require('discord.js');

module.exports = {
  customIdStart: 'tousuna_delete_',

  /**
   * 凸スナ設置削除ボタンの処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace('tousuna_delete_', '');
    const filePath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    if (!fs.existsSync(filePath)) {
      return await interaction.reply({
        content: '⚠️ データファイルが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const list = json.tousuna?.instances;

    if (!Array.isArray(list)) {
      return await interaction.reply({
        content: '⚠️ インスタンスデータが存在しません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const targetIndex = list.findIndex(i => i.id === uuid);
    if (targetIndex === -1) {
      return await interaction.reply({
        content: '⚠️ 対象の設置が見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const instance = list[targetIndex];

    // メッセージ削除（installChannelId / messageId）
    if (instance.messageId && instance.installChannelId) {
      try {
        const channel = await interaction.guild.channels.fetch(instance.installChannelId);
        const message = await channel.messages.fetch(instance.messageId);
        if (message) await message.delete();
      } catch (err) {
        console.warn(`[tousuna_delete] メッセージ削除失敗: ${err.message}`);
      }
    }

    // 削除して保存
    list.splice(targetIndex, 1);
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));

    await interaction.reply({
      content: '🗑 凸スナ設置を削除しました。',
      flags: InteractionResponseFlags.Ephemeral,
    });
  },
};
