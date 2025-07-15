// utils/totusuna_setti/buttons/totusuna_config_button.js

const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  MessageFlagsBitField
} = require('discord.js');
const { ensureGuildJSON, readJSON } = require('../../fileHelper');
const { createAdminEmbed } = require('../../embedHelper');

module.exports = {
  customId: 'totusuna_config_button', // "totusuna" → "totusuna" に修正（名前揺れ防止）

  /**
   * 凸スナ設定管理ボタンの処理
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async handle(interaction) {
    const guildId = interaction.guildId;

    try {
      const filePath = await ensureGuildJSON(guildId);
      const data = await readJSON(filePath);
      const instances = data.totusuna?.instances ?? [];

      if (instances.length === 0) {
        return await interaction.reply({
          embeds: [
            createAdminEmbed(
              '📭 凸スナが未設置',
              '現在、設置されている凸スナはありません。\n「📁 凸スナ設置」ボタンから新しい凸スナを作成してください。'
            )
          ],
          flags: MessageFlagsBitField.Ephemeral,
        });
      }

      const options = instances
        .filter(i => i.id) // messageIdは動的なのでidで統一したほうが安全
        .slice(0, 25) // Discordのメニュー選択肢は最大25個まで
        .map(i => {
          const labelRaw = i.title ?? i.body?.slice(0, 50) ?? '（無題）';
          const label = labelRaw.length > 100 ? labelRaw.slice(0, 97) + '...' : labelRaw;

          // チャンネル名はキャッシュにない場合もあるのでnullチェック
          const channelName = i.installChannelId
            ? interaction.guild.channels.cache.get(i.installChannelId)?.name ?? '不明'
            : '設置チャンネル不明';

          return {
            label,
            value: i.id,
            description: `設置チャンネル: #${channelName}`,
          };
        });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('totusuna_config_select')
        .setPlaceholder('編集・削除する凸スナを選択してください')
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const embed = createAdminEmbed(
        '⚙️ 凸スナ設定管理',
        `現在、設置されている凸スナは **${instances.length}件** です。\n\n下のメニューから編集または削除したい凸スナを選択してください。`
      );

      await interaction.reply({
        embeds: [embed],
        components: [row],
        flags: MessageFlagsBitField.Ephemeral,
      });

    } catch (error) {
      console.error('凸スナ設定管理ボタンエラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ 凸スナ設定管理中にエラーが発生しました。',
          flags: MessageFlagsBitField.Ephemeral,
        });
      }
    }
  },
};
