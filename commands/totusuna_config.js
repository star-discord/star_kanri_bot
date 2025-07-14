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

// Embed作成ヘルパー関数
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

    try {
      const filePath = await ensureGuildJSON(guildId);
      const data = await readJSON(filePath);
      const instances = data.totusuna?.instances || [];

      if (instances.length === 0) {
        return interaction.reply({
          embeds: [
            createAdminEmbed('📭 凸スナ設定メニュー', '現在、設定されている凸スナはありません。')
          ],
          flags: 1 << 6
        });
      }

      const options = instances
        .filter(i => i.messageId || i.id)
        .map(i => ({
          label: i.body?.slice(0, 50) || '（無題）',
          value: i.messageId || i.id,
          description: i.mainChannelId ? `<#${i.mainChannelId}>` : '設置チャンネル不明',
        }));

      if (options.length === 0) {
        return interaction.reply({
          embeds: [
            createAdminEmbed('⚠️ データエラー', '有効な凸スナデータが見つかりません。')
          ],
          flags: 1 << 6
        });
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('totusuna_config_select')
        .setPlaceholder('編集する凸スナを選択してください')
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const response = await interaction.reply({
        embeds: [
          createAdminEmbed(
            '📋 凸スナ設定管理',
            `設定済み凸スナ一覧（${options.length}件）から選択してください。`
          )
        ],
        components: [row],
        flags: 1 << 6
      });

      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 300_000,
      });

      collector.on('collect', async (selectInteraction) => {
        if (selectInteraction.user.id !== interaction.user.id) {
          return selectInteraction.reply({
            content: '❌ このメニューは実行者のみ操作できます。',
            flags: MessageFlags.Ephemeral,
          });
        }

        const selectedValue = selectInteraction.values[0];
        const instance = instances.find(i => (i.messageId || i.id) === selectedValue);

        if (!instance) {
          return selectInteraction.reply({
            embeds: [
              createAdminEmbed('❌ エラー', '選択された凸スナが見つかりませんでした。')
            ],
            flags: MessageFlags.Ephemeral,
          });
        }

        const detailEmbed = createAdminEmbed(
          '📌 凸スナ設置データ（選択中）',
          instance.body?.slice(0, 150) || '（本文なし）'
        )
          .addFields(
            {
              name: '📍 設置チャンネル',
              value: instance.installChannelId ? `<#${instance.installChannelId}>` : 'なし',
              inline: true,
            },
            {
              name: '📧 複製チャンネル',
              value: (instance.replicateChannelIds || []).map(id => `<#${id}>`).join('\n') || 'なし',
              inline: true,
            }
          );

        await selectInteraction.update({
          embeds: [detailEmbed],
          components: [],
        });
      });

      collector.on('end', async () => {
        try {
          await interaction.editReply({
            embeds: [
              createAdminEmbed('⏰ タイムアウト', 'メニューの操作時間が終了しました。')
            ],
            components: [],
          });
        } catch (error) {
          // エラーは無視（メッセージが削除されている可能性）
        }
      });

    } catch (error) {
      console.error('凸スナ設定コマンドエラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ 凸スナ設定の読み込み中にエラーが発生しました。',
          flags: MessageFlags.Ephemeral,
        });
      } else if (interaction.deferred && !interaction.replied) {
        await interaction.editReply({
          content: '❌ 凸スナ設定の読み込み中にエラーが発生しました。',
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.followUp({
          content: '❌ 凸スナ設定の読み込み中にエラーが発生しました。',
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }),
};
