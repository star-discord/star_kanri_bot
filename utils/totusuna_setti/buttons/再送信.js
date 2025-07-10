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
  customIdStart: 'totsusuna_setti:再送信:',

  /**
   * 凸スナの再送信処理（再設置）
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const customId = interaction.customId;

    const uuid = customId.replace(this.customIdStart, '');

    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '⚠️ データファイルが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const instances = json.tousuna?.instances ?? [];
    const instance = instances.find(i => i.id === uuid);

    if (!instance) {
      return await interaction.reply({
        content: '⚠️ 対象の設置情報が見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    // チャンネル取得
    let channel;
    try {
      channel = await interaction.guild.channels.fetch(instance.messageChannelId);
    } catch (err) {
      console.warn(`[再送信] チャンネル取得失敗: ${instance.messageChannelId}`, err.message);
      return await interaction.reply({
        content: '⚠️ 対象チャンネルが存在しないか取得に失敗しました。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    if (!channel?.isTextBased()) {
      return await interaction.reply({
        content: '⚠️ 対象チャンネルがテキストチャンネルではありません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    // 再送信
    try {
      const embed = new EmbedBuilder()
        .setTitle('📣 凸スナ報告受付中')
        .setDescription(instance.body || '(本文なし)')
        .setColor(0x00bfff);

      const button = new ButtonBuilder()
        .setCustomId(`tousuna_report_button_${uuid}`)
        .setLabel('凸スナ報告')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      const sent = await channel.send({ embeds: [embed], components: [row] });

      // messageId を更新
      instance.messageId = sent.id;
      fs.writeFileSync(dataPath, JSON.stringify(json, null, 2));

      await interaction.reply({
        content: '📤 再送信しました（設置チャンネルに投稿されました）。',
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


