// commands/totusuna_config.js
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { ensureGuildJSON, readJSON } = require('../utils/fileHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設定')
    .setDescription('設置済みの凸スナ一覧を表示し、内容の確認・編集ができます'),

  async execute(interaction) {
    try {
      const guildId = interaction.guildId;

      // JSONファイルの確保と読み込み
      const filePath = ensureGuildJSON(guildId);
      const data = readJSON(filePath);

      const instances = Object.values(data.tousuna?.instances || {});

      if (instances.length === 0) {
        return interaction.reply({
          content: '📭 現在、設置されている凸スナはありません。',
          ephemeral: true,
        });
      }

      // 件数の初期応答
      await interaction.reply({
        content: `🛠 設置済み凸スナ一覧：${instances.length}件`,
        ephemeral: true,
      });

      // 各インスタンスをEmbed＋ボタンで表示
      for (const instance of instances) {
        const embed = new EmbedBuilder()
          .setTitle('📌 凸スナ設置情報')
          .setColor(0x00bfff)
          .setDescription(instance.body?.length > 150
            ? instance.body.slice(0, 150) + '...'
            : (instance.body || '（本文が未入力です）')
          )
          .addFields(
            {
              name: '設置チャンネル',
              value: instance.installChannelId ? `<#${instance.installChannelId}>` : '不明',
              inline: true,
            },
            {
              name: '複製チャンネル',
              value: (instance.replicateChannelIds || []).map(id => `<#${id}>`).join('\n') || 'なし',
              inline: true,
            }
          )
          .setFooter({ text: `UUID: ${instance.uuid || '不明'}` });

        const editButton = new ButtonBuilder()
          .setCustomId(`totusuna_edit:${instance.uuid}`)
          .setLabel('⚙ 設定を編集')
          .setStyle(ButtonStyle.Secondary);

        const deleteButton = new ButtonBuilder()
          .setCustomId(`totusuna_delete:${instance.uuid}`)
          .setLabel('🗑 本文削除')
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(editButton, deleteButton);

        await interaction.followUp({
          embeds: [embed],
          components: [row],
          ephemeral: true,
        });
      }

    } catch (err) {
      console.error('❌ /凸スナ設定 実行中にエラー:', err);
      if (!interaction.replied) {
        await interaction.reply({
          content: '❌ 凸スナ設定の取得中にエラーが発生しました。',
          ephemeral: true,
        });
      }
    }
  },
};

