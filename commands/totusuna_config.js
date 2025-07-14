const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
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
    // It's good practice to defer the reply for commands that might take time.
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;

    try {
      const filePath = await ensureGuildJSON(guildId);
      const data = await readJSON(filePath);
      const instances = data.totusuna?.instances ?? [];

      if (instances.length === 0) {
        return interaction.editReply({
          embeds: [
            createAdminEmbed('📭 凸スナ設定', '現在、設定されている凸スナはありません。')
          ],
        });
      }

      const options = instances
        .filter(i => i.id) // Filter for instances that have a UUID
        .slice(0, 25) // Discord's limit for select menu options
        .map(i => {
          const label = i.body?.slice(0, 50) || '（無題）';
          const channel = i.installChannelId ? interaction.guild.channels.cache.get(i.installChannelId) : null;
          const description = channel ? `設置ch: #${channel.name}` : '設置チャンネル不明';
          return {
            label: label.length > 100 ? label.slice(0, 97) + '...' : label,
            value: i.id, // Use the unique ID as the value
            description: description,
          };
        });

      if (options.length === 0) {
        return interaction.editReply({
          embeds: [
            createAdminEmbed('⚠️ データエラー', '有効な凸スナデータが見つかりません。')
          ],
        });
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('totusuna_config_select')
        .setPlaceholder('設定を変更する凸スナを選択してください')
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const response = await interaction.editReply({
        embeds: [
          createAdminEmbed(
            '📋 凸スナ設定管理',
            `設定済みの凸スナ（${options.length}件）が一覧に表示されています。\nメニューから対象を選択すると、詳細の確認や編集・削除ができます。`
          )
        ],
        components: [row],
      });

      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.StringSelectMenu,
        time: 300_000,
      });

      collector.on('collect', async (selectInteraction) => {
        if (selectInteraction.user.id !== interaction.user.id) {
          return selectInteraction.reply({
            content: '❌ このメニューは実行者のみ操作できます。',
            ephemeral: true,
          });
        }

        const selectedId = selectInteraction.values[0];
        const instance = instances.find(i => i.id === selectedId);

        if (!instance) {
          return selectInteraction.reply({
            content: '❌ 選択された凸スナが見つかりませんでした。',
            ephemeral: true,
          });
        }

        const detailEmbed = createAdminEmbed(
          '📌 凸スナ設定詳細',
          instance.body?.slice(0, 4000) || '（本文なし）'
        )
          .addFields(
            { name: '📍 設置チャンネル', value: instance.installChannelId ? `<#${instance.installChannelId}>` : 'なし', inline: true },
            { name: '📣 複製チャンネル', value: (instance.replicateChannelIds?.length > 0) ? instance.replicateChannelIds.map(id => `<#${id}>`).join('\n') : 'なし', inline: true },
            { name: '🆔 ユニークID', value: `\`${instance.id}\``, inline: false }
          );

        const editButton = new ButtonBuilder()
          .setCustomId(`totusuna_setti:edit:${instance.id}`)
          .setLabel('本文を編集')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('✏️');

        const deleteButton = new ButtonBuilder()
          .setCustomId(`totusuna_setti:delete:${instance.id}`)
          .setLabel('この設置を削除')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🗑️');

        const actionRow = new ActionRowBuilder().addComponents(editButton, deleteButton);

        await selectInteraction.update({
          embeds: [detailEmbed],
          components: [actionRow],
        });
      });

      collector.on('end', async (collected) => {
        if (collected.size > 0) return; // An item was selected, no need for timeout message
        try {
          await interaction.editReply({
            embeds: [
              createAdminEmbed('⏰ タイムアウト', '操作時間が終了しました。\n再度コマンドを実行してください。')
            ],
            components: [],
          });
        } catch (error) {
          // エラーは無視（メッセージが削除されている可能性）
        }
      });

    } catch (error) {
      console.error('凸スナ設定コマンドエラー:', error);
      const errorMessage = {
        content: '❌ 凸スナ設定の読み込み中にエラーが発生しました。',
        ephemeral: true,
      };
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      } catch (replyError) {
        console.error('❌ エラー応答の送信に失敗:', replyError);
      }
    }
  }),
};
