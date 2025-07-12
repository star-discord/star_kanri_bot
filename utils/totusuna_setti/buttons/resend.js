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
   * 凸スナ�E再送信処琁E���E設置�E�E   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;
    const uuid = interaction.customId.replace(this.customIdStart, '');

    const dataPath = path.join(__dirname, '../../../data', guildId, `${guildId}.json`);
    try {
      await fs.access(dataPath);
    } catch {
      return await interaction.reply({
        content: '⚠�E�EチE�Eタファイルが見つかりません、E,
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
        content: '❁EチE�Eタファイルの読み込みに失敗しました、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    const instances = json.totsusuna?.instances ?? [];
    const instance = instances.find(i => i.id === uuid);

    if (!instance) {
      return await interaction.reply({
        content: '⚠�E�E対象の設置惁E��が見つかりません、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    let channel;
    try {
      channel = await interaction.guild.channels.fetch(instance.installChannelId);
      if (!channel?.isTextBased()) {
        return await interaction.reply({
          content: '⚠�E�E対象チャンネルがテキストチャンネルではありません、E,
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (err) {
      console.warn(`[再送信] チャンネル取得失敁E ${instance.installChannelId}`, err);
      return await interaction.reply({
        content: '⚠�E�E対象チャンネルが存在しなぁE��取得に失敗しました、E,
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const embed = new EmbedBuilder()
        .setTitle('📣 凸スナ報告受付中')
        .setDescription(instance.body || '(本斁E��ぁE')
        .setColor(0x00bfff);

      const button = new ButtonBuilder()
        .setCustomId(`totsusuna:report:${uuid}`) // 允E�E命名規則に合わせる
        .setLabel('凸スナ報呁E)
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      const sentMessage = await channel.send({ embeds: [embed], components: [row] });

      instance.messageId = sentMessage.id;

      await fs.writeFile(dataPath, JSON.stringify(json, null, 2));

      await interaction.reply({
        content: '📤 再送信しました�E�設置チャンネルに投稿されました�E�、E,
        flags: MessageFlags.Ephemeral,
      });

    } catch (err) {
      console.error('[再送信エラー]', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❁EメチE��ージの再送信に失敗しました、E,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
