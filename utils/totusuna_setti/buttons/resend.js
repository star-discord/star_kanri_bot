const fs = require('fs').promises;
const path = require('path');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');

module.exports = {
  customIdStart: 'totsusuna_setti:resend:',

  /**
   * 凸スナ再送信処理（再設置）
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace(this.customIdStart, '');

    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    try {
      await fs.access(dataPath);
    } catch {
      return await interaction.reply({
        content: '⚠️ データファイルが見つかりません。',
        flags: MessageFlags.Ephemeral,
      });
    }

    let json;
    try {
      const fileContent = await fs.readFile(dataPath, 'utf-8');
      json = JSON.parse(fileContent);
    } catch (err) {
      console.error('[再送信] JSON 読み込みエラー:', err);
      return await interaction.reply({
        content: '❌ データファイルの読み込みに失敗しました。',
        flags: MessageFlags.Ephemeral,
      });
    }

    const instances = json.totsusuna?.instances ?? [];
    const instance = instances.find(i => i.id === uuid);

    if (!instance) {
      return await interaction.reply({
        content: '⚠️ 対象の設置データが見つかりません。',
        flags: MessageFlags.Ephemeral,
      });
    }

    let channel;
    try {
      channel = await interaction.guild.channels.fetch(instance.installChannelId);
      if (!channel?.isTextBased()) {
        return await interaction.reply({
          content: '⚠️ 対象チャンネルがテキストチャンネルではありません。',
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (err) {
      console.warn(`[再送信] チャンネル取得失敗: ${instance.installChannelId}`, err);
      return await interaction.reply({
        content: '⚠️ 対象チャンネルが存在しないか取得に失敗しました。',
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const embed = new EmbedBuilder()
        .setTitle('📣 凸スナ報告受付中')
        .setDescription(instance.body || '(本文なし)')
        .setColor(0x00bfff);

      const button = new ButtonBuilder()
        .setCustomId(`totsusuna:report:${uuid}`) // 統一命名規則に合わせる
        .setLabel('凸スナ報告')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      const sentMessage = await channel.send({ embeds: [embed], components: [row] });

      instance.messageId = sentMessage.id;

      await fs.writeFile(dataPath, JSON.stringify(json, null, 2));

      await interaction.reply({
        content: '📤 再送信しました。設置チャンネルに投稿されました。',
        flags: MessageFlags.Ephemeral,
      });

    } catch (err) {
      console.error('[再送信エラー]', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ メッセージの再送信に失敗しました。',
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
