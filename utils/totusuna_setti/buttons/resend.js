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
  customIdStart: 'totsusuna_setti:resend:', // 英語化

  /**
   * 凸スナの再送信処理（再設置）
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace(this.customIdStart, '');

    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    if (!fs.existsSync(dataPath)) {
      return await interaction.reply({
        content: '⚠️ データファイルが見つかりません。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    let json;
    try {
      json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    } catch (err) {
      console.error('[再送信] JSON 読み込みエラー:', err);
      return await interaction.reply({
        content: '❌ データファイルの読み込みに失敗しました。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const instances = json.totsusuna?.instances ?? [];
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
      channel = await interaction.guild.channels.fetch(instance.installChannelId);
    } catch (err) {
      console.warn(`[再送信] チャンネル取得失敗: ${instance.installChannelId}`, err.message);
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

    // Embed と ボタン再生成
    try {
      const embed = new EmbedBuilder()
        .setTitle('📣 凸スナ報告受付中')
        .setDescription(instance.body || '(本文なし)')
        .setColor(0x00bfff);

      const button = new ButtonBuilder()
        .setCustomId(`totsusuna_report_button_${uuid}`) // customId に合わせて命名
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
