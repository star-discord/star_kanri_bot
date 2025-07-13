// commands/star_config.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ComponentType,
  EmbedBuilder,
  ChannelType
} = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { readJSON, writeJSON, ensureGuildJSON } = require('../utils/fileHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot設定')
    .setDescription('管理者のロールと通知チャンネルを設定します')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guild = interaction.guild;
    const guildId = guild.id;
    const member = interaction.member;

    // star_config コマンドは Discord 標準の管理者権限が必要
    if (!member.permissions.has('Administrator')) {
      return await interaction.reply({
        content: '❌ この設定コマンドには Discord の管理者権限が必要です。\n' +
                'サーバー設定で管理者権限を付与してください。',
        ephemeral: true
      });
    }

    let filePath;
    let data;

    try {
      filePath = await ensureGuildJSON(guildId);
      data = await readJSON(filePath);
    } catch (err) {
      console.error('❌ ファイル読み込みエラー:', err);
      return await interaction.reply({
        content: '❌ 設定ファイルの読み込みに失敗しました。',
        ephemeral: true
      });
    }

    // データ構造の互換性確保
    if (!data.star_config) data.star_config = {};
    
    // 既存データのマイグレーション（古い形式から新しい形式へ）
    if (data.adminRoleIds && !data.star_config.adminRoleIds) {
      data.star_config.adminRoleIds = data.adminRoleIds;
    }
    if (data.notifyChannelId && !data.star_config.notifyChannelId) {
      data.star_config.notifyChannelId = data.notifyChannelId;
    }
    
    const currentAdminRoleIds = data.star_config.adminRoleIds || [];
    const currentNotifyChannelId = data.star_config.notifyChannelId || null;

    const getSettingsEmbed = (roleIds, notifyId) => {
      const roleMentions =
        roleIds.length > 0
          ? roleIds.map(id => {
              const role = guild.roles.cache.get(id);
              return role ? `<@&${id}>` : `~~(削除済ロール: ${id})~~`;
            }).join('\n')
          : '*未設定*';

      const notifyChannel = notifyId ? guild.channels.cache.get(notifyId) : null;
      const notifyDisplay = notifyChannel
        ? `<#${notifyId}>`
        : notifyId ? `~~(削除済チャンネル: ${notifyId})~~` : '*未設定*';

      return new EmbedBuilder()
        .setTitle('🌟 STAR管理Bot設定')
        .setDescription(`**管理者ロール / 通知チャンネル 設定**\n\n📌 現在の管理者ロール:\n${roleMentions}\n\n📣 現在の通知チャンネル:\n${notifyDisplay}`)
        .setColor(0x0099ff);
    };

    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId('admin_role_select')
      .setPlaceholder('管理者として許可するロールを選択')
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

    await interaction.reply({
      embeds: [getSettingsEmbed(currentAdminRoleIds, currentNotifyChannelId)],
      components: [row1, row2],
      flags: 1 << 6
    });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: [ComponentType.RoleSelect, ComponentType.ChannelSelect],
      filter: i => i.user.id === interaction.user.id,
      time: 60_000
    });

    if (!collector) return;

    collector.on('collect', async selectInteraction => {
      try {
        const customId = selectInteraction.customId;

      if (customId === 'admin_role_select') {
        const selectedRoleIds = selectInteraction.values;
        const validRoleIds = selectedRoleIds.filter(id => guild.roles.cache.has(id));
        const previousRoleIds = data.star_config.adminRoleIds || [];
        const added = validRoleIds.filter(id => !previousRoleIds.includes(id));
        const removed = previousRoleIds.filter(id => !validRoleIds.includes(id));

        data.star_config.adminRoleIds = validRoleIds;

        try {
          await writeJSON(filePath, data);
        } catch (err) {
          console.error('❌ ロール保存失敗:', err);
          return await selectInteraction.reply({
            content: '❌ ロール設定の保存に失敗しました。',
            flags: 1 << 6
          });
        }

        const embeds = [getSettingsEmbed(validRoleIds, data.star_config.notifyChannelId)];

        if (added.length > 0) {
          embeds.push(
            new EmbedBuilder()
              .setTitle('✅ 管理者ロールを登録しました')
              .setDescription(`登録されたロール:\n${added.map(id => `<@&${id}>`).join('\n')}`)
              .setColor(0x00cc99)
          );
        }

        if (removed.length > 0) {
          embeds.push(
            new EmbedBuilder()
              .setTitle('⚠️ 管理者ロールが解除されました')
              .setDescription(`解除されたロール:\n${removed.map(id => `<@&${id}>`).join('\n')}`)
              .setColor(0xff6600)
          );
        }

        await selectInteraction.update({
          embeds,
          components: [row1, row2],
          flags: 1 << 6
        });

      } else if (customId === 'notify_channel_select') {
        const selectedChannelId = selectInteraction.values[0];
        const channel = guild.channels.cache.get(selectedChannelId);

        if (!channel || !channel.isTextBased()) {
          return await selectInteraction.update({
            content: '❌ 無効なチャンネルです。もう一度選択してください。',
            embeds: [getSettingsEmbed(data.star_config.adminRoleIds, data.star_config.notifyChannelId)],
            components: [row1, row2],
            flags: 1 << 6
          });
        }

        data.star_config.notifyChannelId = selectedChannelId;

        try {
          await writeJSON(filePath, data);
        } catch (err) {
          console.error('❌ チャンネル保存失敗:', err);
          return await selectInteraction.update({
            content: '❌ 通知チャンネルの保存に失敗しました。',
            embeds: [getSettingsEmbed(data.star_config.adminRoleIds, data.star_config.notifyChannelId)],
            components: [row1, row2],
            flags: 1 << 6
          });
        }

        await selectInteraction.update({
          embeds: [
            getSettingsEmbed(data.star_config.adminRoleIds, selectedChannelId),
            new EmbedBuilder()
              .setTitle('📣 通知チャンネルを設定しました')
              .setDescription(`設定されたチャンネル: <#${selectedChannelId}>`)
              .setColor(0x00cc99)
          ],
          components: [row1, row2],
          flags: 1 << 6
        });
      }
      } catch (error) {
        console.error('❌ セレクト処理エラー:', error);
        if (!selectInteraction.replied && !selectInteraction.deferred) {
          await selectInteraction.reply({
            content: '❌ 処理中にエラーが発生しました。もう一度お試しください。',
            flags: 1 << 6,
            ephemeral: true
          });
        }
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0 && !(interaction.replied || interaction.deferred)) {
        interaction.editReply({
          content: '⏱️ 時間切れのため設定がキャンセルされました。',
          components: []
        });
      }
    });
  }
};
