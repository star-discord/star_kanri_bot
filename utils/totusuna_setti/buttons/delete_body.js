const fs = require('fs');
const path = require('path');
const { MessageFlags } = require('discord.js'); // 追加

module.exports = {
  customIdStart: 'totsusuna_setti:delete_body:', // 英語化

  /**
   * 凸スナ本斁E��除ボタンの処琁E   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace(this.customIdStart, '');
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);

    // チE�Eタファイル存在確誁E    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '⚠�E�EチE�Eタファイルが見つかりません、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    // JSON 読み込み
    let json;
    try {
      json = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (err) {
      console.error('[delete_body] JSON読み込みエラー:', err);
      return await interaction.reply({
        content: '❁EチE�Eタの読み込みに失敗しました、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    const instances = json.totsusuna?.instances;
    if (!Array.isArray(instances)) {
      return await interaction.reply({
        content: '⚠�E�E凸スナ情報が不正です、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    const targetIndex = instances.findIndex(i => i.id === uuid);
    if (targetIndex === -1) {
      return await interaction.reply({
        content: '⚠�E�E持E��された設置は存在しません、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    const target = instances[targetIndex];

    // メチE��ージ削除処琁E    try {
      const channel = await interaction.guild.channels.fetch(target.installChannelId);
      if (channel && target.messageId) {
        const message = await channel.messages.fetch(target.messageId).catch(() => null);
        if (message) await message.delete();
      }
    } catch (err) {
      console.warn(`[delete_body] メチE��ージ削除に失敁E ${err.message}`);
    }

    // JSON から削除して保孁E    instances.splice(targetIndex, 1);
    fs.writeFileSync(dataPath, JSON.stringify(json, null, 2));

    await interaction.reply({
      content: '🗑 本斁E��削除しました、E,
      flags: MessageFlags.Ephemeral,
    });
  },
};
