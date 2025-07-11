// commands/star_config.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
  ComponentType,
  EmbedBuilder
} = require('discord.js');
const { readJSON, writeJSON, ensureGuildJSON } = require('../utils/fileHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star管理bot設定')
    .setDescription('管理者用のロール設定を行います'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const filePath = await ensureGuildJSON(guildId);
    const data = await readJSON(filePath);

    if (!data.star_config) data.star_config = {};
    const currentAdminRoleIds = data.star_config.adminRoleIds || [];

    const getSettingsEmbed = (roleIds) => {
      const currentMentions =
        roleIds.length > 0
          ? roleIds.map(id => `<@&${id}>`).join('\n')
          : '*未設定*';

      return new EmbedBuilder()
        .setTitle('🌟 STAR管理bot設定')
        .setDescription('**管理者ロールの登録/解除**\n\n📌 現在の管理者ロール:\n' + currentMentions)
        .setColor(0x0099ff);
    };

    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId('admin_role_select')
      .setPlaceholder('管理者として許可するロールを選択')
      .setMinValues(1)
      .setMaxValues(5);

    const row = new ActionRowBuilder().addComponents(roleSelect);

    // 初期送信
    const sentMessage = await interaction.reply({
      embeds: [getSettingsEmbed(currentAdminRoleIds)],
      components: [row],
      flags: 1 << 6
    });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.RoleSelect,
      time: 5 * 60_000 // 5分有効
    });

    if (!collector) return;

    collector.on('collect', async selectInteraction => {
      if (selectInteraction.user.id !== interaction.user.id) {
        return await selectInteraction.reply({
          content: '❌ この操作はコマンドを実行したユーザーのみが行えます。',
          flags: 1 << 6
        });
      }

      const selectedRoleIds = selectInteraction.values;
      const added = selectedRoleIds.filter(id => !currentAdminRoleIds.includes(id));
      const removed = currentAdminRoleIds.filter(id => !selectedRoleIds.includes(id));

      data.star_config.adminRoleIds = selectedRoleIds;

      try {
        await writeJSON(filePath, data);
      } catch (err) {
        console.error('❌ JSON保存失敗:', err);
        return await selectInteraction.reply({
          content: '❌ ロールの保存に失敗しました。',
          flags: 1 << 6
        });
      }

      const updates = [];

      if (added.length > 0) {
        updates.push(
          new EmbedBuilder()
            .setTitle('✅ 管理者ロールを登録しました')
            .setDescription(`登録されたロール：\n${added.map(id => `<@&${id}>`).join('\n')}`)
            .setColor(0x00cc99)
        );
      }

      if (removed.length > 0) {
        updates.push(
          new EmbedBuilder()
            .setTitle('⚠️ 管理者ロールが解除されました')
            .setDescription(`解除されたロール：\n${removed.map(id => `<@&${id}>`).join('\n')}`)
            .setColor(0xff6600)
        );
      }

      // メインEmbed更新
      await selectInteraction.update({
        embeds: [getSettingsEmbed(selectedRoleIds), ...updates],
        components: [new ActionRowBuilder().addComponents(roleSelect)],
        flags: 1 << 6
      });
    });

    collector.on('end', async () => {
      try {
        await sentMessage.edit({
          components: [],
          embeds: [getSettingsEmbed(data.star_config.adminRoleIds || [])]
        });
      } catch (e) {
        console.warn('⚠️ 終了時のメッセージ編集に失敗:', e.message);
      }
    });
  }
};
