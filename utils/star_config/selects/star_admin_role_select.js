// utils/star_config/selects/star_admin_role_select.js
const requireAdmin = require('../../permissions/requireAdmin');
const { configManager } = require('../../configManager');
const {
  EmbedBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  MessageFlagsBitField,
} = require('discord.js');

/**
 * 実際の処理を行う関数
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 * @returns {Promise<void>}
 */

async function actualHandler(interaction) {
  const { guild } = interaction;
  const guildId = guild.id;
  const selectedIds = interaction.values;

  try {
    const currentConfig = await configManager.getSectionConfig(guildId, 'star');
    const prevIds = new Set(currentConfig?.adminRoleIds || []);
    const notifyChannelId = currentConfig?.notifyChannelId ?? null;

    // ロールIDフィルタと差分検出
    const nextIds = new Set(selectedIds.filter(id => guild.roles.cache.has(id)));
    const added = [...nextIds].filter(id => !prevIds.has(id));
    const removed = [...prevIds].filter(id => !nextIds.has(id));

    console.log(`[admin_role_select] guildId=${guildId}`);
    console.log(`  currentRoles:`, [...prevIds]);
    console.log(`  selected:`, selectedIds);
    console.log(`  added:`, added);
    console.log(`  removed:`, removed);

    // 設定を更新
    await configManager.updateSectionConfig(guildId, 'star', { adminRoleIds: [...nextIds] });
    console.log(`[configManager] ✅ adminRoleIds updated for ${guildId}`);

    // 表示整形関数
    const formatRoleMentions = (ids) =>
      ids.length > 0
        ? ids.map(id => guild.roles.cache.get(id) ? `<@&${id}>` : `~~(削除済ロール: ${id})~~`).join('\n')
        : '*未設定*';

    const formatChannel = (id) => {
      const channel = id ? guild.channels.cache.get(id) : null;
      return channel ? `<#${id}>` : (id ? `~~(削除済チャンネル: ${id})~~` : '*未設定*');
    };

    const roleDisplay = formatRoleMentions([...nextIds]);
    const notifyDisplay = formatChannel(notifyChannelId);

    // エンベッド構築
    const embeds = [
      new EmbedBuilder()
        .setTitle('🌟 STAR管理Bot設定')
        .setDescription(`**管理者ロール / 通知チャンネル 設定**\n\n📌 管理者ロール:\n${roleDisplay}\n\n📣 通知チャンネル:\n${notifyDisplay}`)
        .setColor(0x0099ff)
    ];

    if (added.length > 0) {
      embeds.push(new EmbedBuilder()
        .setTitle('✅ 追加されたロール')
        .setDescription(formatRoleMentions(added))
        .setColor(0x00cc99));
    }

    if (removed.length > 0) {
      embeds.push(new EmbedBuilder()
        .setTitle('⚠️ 削除されたロール')
        .setDescription(formatRoleMentions(removed))
        .setColor(0xff6600));
    }

    // UI再構築
    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId('admin_role_select')
      .setPlaceholder('管理者ロールを再選択できます')
      .setMinValues(0)
      .setMaxValues(25);

    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId('notify_channel_select')
      .setPlaceholder('通知チャンネルを選択')
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      .setMinValues(0)  // ← 未設定許容
      .setMaxValues(1);

    await interaction.update({
      embeds,
      components: [
        new ActionRowBuilder().addComponents(roleSelect),
        new ActionRowBuilder().addComponents(channelSelect),
      ]
    });

  } catch (error) {
    console.error('❌ [admin_role_select] 処理中エラー:', error);
    const msg = '⚠️ ロール設定の更新中にエラーが発生しました。';

    const replyData = { content: msg, flags: MessageFlagsBitField.Flags.Ephemeral };

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply(replyData);
    } else {
      await interaction.followUp(replyData);
    }
  }
}

module.exports = {
  customId: 'admin_role_select',
  handle: requireAdmin(actualHandler),
};
