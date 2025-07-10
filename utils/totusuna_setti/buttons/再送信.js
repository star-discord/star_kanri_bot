// utils/totusuna_setti/buttons/再送信.js
const fs = require('fs');
const path = require('path');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionResponseFlags,
} = require('discord.js');

module.exports = {
  /**
   * 再送信ボタンの処理
   * @param {import('discord.js').ButtonInteraction} interaction
   * @param {string} uuid - 対象の凸スナUUID
   */
  async handle(interaction, uuid) {
    const guildId = interaction.guildId;
    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '⚠️ 設定ファイルが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const instance = json.tousuna?.instances?.find(i => i.id === uuid);

    if (!instance) {
      return await interaction.reply({
        content: '⚠️ 対象の凸スナ設置が見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('📣 凸スナ報告受付中')
      .setDescription(instance.body || '(本文なし)')
      .setColor(0x00bfff);

    const button = new ButtonBuilder()
      .setCustomId(`tousuna_report_button_${uuid}`)
      .setLabel('凸スナ報告')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    try {
      const channel = await interaction.guild.channels.fetch(instance.messageChannelId);
      const sent = await channel.send({ embeds: [embed], components: [row] });

      // messageId を更新
      instance.messageId = sent.id;

      // データ書き戻し
      fs.writeFileSync(dataPath, JSON.stringify(json, null, 2));

      await interaction.reply({
        content: '📤 再送信しました（設置チャンネルのみ）。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    } catch (err) {
      console.error('[再送信エラー]', err);
      await interaction.reply({
        content: '❌ メッセージの再送信に失敗しました。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }
  },
};

