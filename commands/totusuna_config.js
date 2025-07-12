const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType,
  MessageFlags,
  EmbedBuilder,
} = require('discord.js');

const { ensureGuildJSON, readJSON } = require('../utils/fileHelper.js');

const requireAdmin = require('../utils/permissions/requireAdmin.js');

// Embed作�Eヘルパ�E関数
function createAdminEmbed(title, description) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0x00AE86)
    .setFooter({ text: 'STAR管理bot' })
    .setTimestamp();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('凸スナ設定')
    .setDescription('設置済みの凸スナ一覧を表示し、内容の確認・編集ができます（管理者専用）'),

  execute: requireAdmin(async (interaction) => {
    const guildId = interaction.guildId;
    const filePath = await ensureGuildJSON(guildId);
    const data = await readJSON(filePath);
    const instances = data.totusuna_list || [];

    if (instances.length === 0) {
      return interaction.reply({
        embeds: [
          createAdminEmbed('📭 凸スナ設定メニュー', '現在、設置されてぁE��凸スナ�Eありません、E)
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const options = instances
      .filter(i => i.messageId || i.id)
      .map(i => ({
        label: i.body?.slice(0, 50) || '�E�無題！E,
        value: i.messageId || i.id,
        description: i.mainChannelId ? `<#${i.mainChannelId}>` : '設置チャンネル不�E',
      }));

    if (options.length === 0) {
      return interaction.reply({
        embeds: [
          createAdminEmbed('⚠ チE�Eタエラー', '有効な凸スナデータが見つかりません、E)
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('totusuna_config_select')
      .setPlaceholder('⚁E編雁E��たい凸スナを選択してください')
      .addOptions(options.slice(0, 25)); // Discord制陁E
    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      embeds: [
        createAdminEmbed(
          '🔧 凸スナ設定メニュー',
          `設置済み凸スナ一覧�E�E{options.length}件�E�から選択してください。`
        )
      ],
      components: [row],
      flags: MessageFlags.Ephemeral,
    });

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
          embeds: [
            createAdminEmbed('❁Eエラー', '選択された凸スナが見つかりませんでした、E)
          ],
          components: [],
        });
      }

      const detailEmbed = createAdminEmbed(
        '📌 凸スナ設置惁E���E�選択中�E�E,
        instance.body?.slice(0, 150) || '�E�本斁E��し！E
      ).addFields(
        {
          name: '設置チャンネル',
          value: instance.installChannelId ? `<#${instance.installChannelId}>` : '不�E',
          inline: true,
        },
        {
          name: '褁E��チャンネル',
          value: (instance.replicateChannelIds || []).map(id => `<#${id}>`).join('\n') || 'なぁE,
          inline: true,
        }
      ).setFooter({ text: `UUID: ${instance.uuid}` });

      await selectInteraction.update({
        content: `✁E凸スナ、E{instance.body?.slice(0, 20) || '�E�無題！E}」�E詳細�E�`,
        embeds: [detailEmbed],
        components: [],
      });
    });

    collector.on('end', collected => {
      if (collected.size === 0 && interaction.channel) {
        interaction.editReply({
          embeds: [
            createAdminEmbed('⌁EタイムアウチE, 'メニューの操作時間が終亁E��ました、E)
          ],
          components: [],
        }).catch(() => {});
      }
    });
  }),
};
