// commands/totusuna_config.js
const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ComponentType,
} = require('discord.js');
const { ensureGuildJSON, readJSON } = require('../utils/fileHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設定')
    .setDescription('設置済みの凸スナ一覧を表示し、内容の確認・編集ができます'),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const filePath = ensureGuildJSON(guildId);
    const data = readJSON(filePath);
    const instances = Object.values(data.tousuna?.instances || {});

    if (instances.length === 0) {
      return interaction.reply({
        content: '📭 現在、設置されている凸スナはありません。',
        flags: 1 << 6,
      });
    }

    // uuid欠落防止チェック＆選択肢作成
    const options = instances
      .filter(i => i.uuid)
      .map(i => ({
        label: i.body?.slice(0, 50) || '（無題）',
        value: i.uuid,
        description: i.installChannelId ? `#${i.installChannelId}` : '設置チャンネル不明',
      }));

    if (options.length === 0) {
      return interaction.reply({
        content: '⚠ 有効な凸スナデータが見つかりません。',
        flags: 1 << 6,
      });
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('totusuna_config_select')
      .setPlaceholder('⚙ 編集したい凸スナを選択してください')
      .addOptions(options.slice(0, 25)); // Discord上限

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: `🛠 設置済み凸スナ一覧（${options.length}件）から選択してください。`,
      components: [row],
      flags: 1 << 6,
    });

    // コレクタで選択を待つ（60秒）
    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000,
      filter: i => i.user.id === interaction.user.id,
    });

    collector.on('collect', async selectInteraction => {
      const selectedUuid = selectInteraction.values[0];
      const instance = instances.find(i => i.uuid === selectedUuid);

      if (!instance) {
        return selectInteraction.update({
          content: '❌ 選択された凸スナが見つかりませんでした。',
          components: [],
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('📌 凸スナ設置情報（選択中）')
        .setColor(0x00bfff)
        .setDescription(instance.body?.slice(0, 150) || '（本文なし）')
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
        .setFooter({ text: `UUID: ${instance.uuid}` });

      await selectInteraction.update({
        content: `✅ 凸スナ「${instance.body?.slice(0, 20) || '（無題）'}」の詳細：`,
        embeds: [embed],
        components: [],
      });
    });

    collector.on('end', collected => {
      if (collected.size === 0 && interaction.channel) {
        interaction.editReply({
          content: '⏱ メニューの操作時間が終了しました。',
          components: [],
        }).catch(() => {});
      }
    });
  },
};
