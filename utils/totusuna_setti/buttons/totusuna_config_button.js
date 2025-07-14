const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { ensureGuildJSON, readJSON } = require('../../fileHelper');
const { createAdminEmbed } = require('../../embedHelper');

module.exports = {
  customId: 'totusuna_config_button',

  /**
   * 凸スナ設定管理ボタンの処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;

    try {
      const filePath = await ensureGuildJSON(guildId);
      const data = await readJSON(filePath);
      const instances = data.totusuna?.instances || [];

      if (instances.length === 0) {
        return await interaction.reply({
          embeds: [
            createAdminEmbed('📭 設定管理', '現在、設置されている凸スナはありません。\n\n「📝 凸スナ設置」ボタンから新しい凸スナを作成してください。')
          ],
          flags: MessageFlags.Ephemeral
        });
      }

      const options = instances
        .filter(i => i.messageId || i.id)
        .slice(0, 25) // Discord制限
        .map(i => ({
          label: (i.title || i.body?.slice(0, 50) || '（無題）').substring(0, 100),
          value: i.messageId || i.id,
          description: i.mainChannelId ? `設置先: #${interaction.guild.channels.cache.get(i.mainChannelId)?.name || '不明'}` : '設置チャンネル不明',
        }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('totusuna_config_select')
        .setPlaceholder('編集・削除する凸スナを選択してください')
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const embed = createAdminEmbed(
        '⚙️ 凸スナ設定管理',
        `設置済み凸スナ: **${instances.length}個**\n\n下のメニューから編集・削除したい凸スナを選択してください。`
      );

      await interaction.reply({
        embeds: [embed],
        components: [row],
        flags: MessageFlags.Ephemeral
      });

    } catch (error) {
      console.error('凸スナ設定管理ボタンエラー:', error);
      await interaction.reply({
        content: '❌ 設定管理処理中にエラーが発生しました。',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
