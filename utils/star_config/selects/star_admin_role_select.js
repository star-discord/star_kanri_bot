// utils/star_config/selects/star_admin_role_select.js .js
const requireAdmin = require('../../permissions/requireAdmin');
const { configManager } = require('../../configManager');
const {
  EmbedBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
} = require('discord.js');

async function actualHandler(interaction) {
  const guild = interaction.guild;
  const guildId = guild.id;
  const selectedIds = interaction.values;

  try {
    // 設定マネージャーを使用して現在の設定を安全に取得
    const currentConfig = await configManager.getSectionConfig(guildId, 'star');
    const prevIds = new Set(currentConfig?.adminRoleIds || []);
    const currentNotifyChannelId = currentConfig.notifyChannelId || null;

    const nextIds = new Set(selectedIds.filter(id => guild.roles.cache.has(id)));

    const added = [...nextIds].filter(id => !prevIds.has(id));
    const removed = [...prevIds].filter(id => !nextIds.has(id));

    // --- [追加] 詳細なデバッグログ ---
    console.log(`[admin_role_select] Guild: ${guildId}`);
    console.log(`  - 現在のロール:`, [...prevIds]);
    console.log(`  - 選択されたロール:`, selectedIds);
    console.log(`  - 追加されるロール:`, added);
    console.log(`  - 削除されるロール:`, removed);

    try {
      // 設定マネージャーを使用して設定を更新
      await configManager.updateSectionConfig(guildId, 'star', { adminRoleIds: [...nextIds] });
    } catch (error) {
      console.error(`❌ [star_config/selects] 設定更新エラー guildId=${guildId}`, error);
      throw error;
    }

    const formatRoleMentions = (ids) =>
      ids.length > 0
        ? ids.map(id => guild.roles.cache.get(id) ? `<@&${id}>` : `~~(削除済ロール: ${id})~~`).join('\n')
        : '*未設定*';

    const formatChannelDisplay = (notifyId) => {
      const notifyChannel = notifyId ? guild.channels.cache.get(notifyId) : null;
      return notifyChannel
        ? `<#${notifyId}>`
        : notifyId ? `~~(削除済チャンネル: ${notifyId})~~` : '*未設定*';
    };

    const mainEmbed = new EmbedBuilder()
      .setTitle('🌟 STAR管理Bot設定')
      .setDescription(`**管理者ロール / 通知チャンネル 設定**\n\n📌 現在の管理者ロール:\n${formatRoleMentions([...nextIds])}\n\n📣 現在の通知チャンネル:\n${formatChannelDisplay(currentNotifyChannelId)}`)
      .setColor(0x0099ff);

    const embeds = [mainEmbed];

    if (added.length > 0) {
      embeds.push(new EmbedBuilder()
        .setTitle('✅ ロール追加')
        .setDescription(formatRoleMentions(added))
        .setColor(0x00cc99));
    }

    if (removed.length > 0) {
      embeds.push(new EmbedBuilder()
        .setTitle('⚠️ ロール解除')
        .setDescription(formatRoleMentions(removed))
        .setColor(0xff6600));
    }

    // UIの再構築
    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId('admin_role_select')
      .setPlaceholder('管理者ロールを再選択できます')
      .setMinValues(0)
      .setMaxValues(25);

    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId('notify_channel_select')
      .setPlaceholder('通知チャンネルを選択')
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      .setMinValues(1)
      .setMaxValues(1);

    const row1 = new ActionRowBuilder().addComponents(roleSelect);
    const row2 = new ActionRowBuilder().addComponents(channelSelect);

    await interaction.update({
      embeds,
      components: [row1, row2],
    });

  } catch (error) {
    console.error('❌ admin_role_select処理エラー:', error);

    const errorMsg = '⚠️ ロール設定処理中にエラーが発生しました。';

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: errorMsg, ephemeral: true });
    } else {
      await interaction.followUp({ content: errorMsg, ephemeral: true });
    }
  }
}

module.exports = {
  customId: 'admin_role_select',
  handle: requireAdmin(actualHandler)
};
