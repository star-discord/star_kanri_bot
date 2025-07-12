// utils/star_config/selects/star_admin_role_select.js .js
const requireAdmin = require('../../permissions/requireAdmin');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper');
const { EmbedBuilder, ActionRowBuilder, RoleSelectMenuBuilder } = require('discord.js');

async function actualHandler(interaction) {
  const guild = interaction.guild;
  const selectedIds = interaction.values;

  try {
    const filePath = await ensureGuildJSON(guild.id);
    const data = await readJSON(filePath);

    // star_configの初期匁E    if (!data.star_config) {
      data.star_config = {};
    }

    const oldIds = data.star_config.adminRoleIds || [];
    const validIds = selectedIds.filter(id => guild.roles.cache.has(id));

    const added = validIds.filter(id => !oldIds.includes(id));
    const removed = oldIds.filter(id => !validIds.includes(id));

    data.star_config.adminRoleIds = validIds;
    await writeJSON(filePath, data);

    const mentions = validIds.length > 0 
      ? validIds.map(id => {
          const role = guild.roles.cache.get(id);
          return role ? `<@&${id}>` : `~~(削除済ロール: ${id})~~`;
        }).join('\n')
      : '*未設宁E';

    const embeds = [
      new EmbedBuilder()
        .setTitle('🌟 STAR管琁Eot設宁E)
        .setDescription(`📌 現在の管琁E��E��ール:\n${mentions}`)
        .setColor(0x0099ff)
    ];

    if (added.length > 0) {
      embeds.push(new EmbedBuilder()
        .setTitle('✁Eロール追加')
        .setDescription(added.map(id => `<@&${id}>`).join('\n'))
        .setColor(0x00cc99));
    }

    if (removed.length > 0) {
      embeds.push(new EmbedBuilder()
        .setTitle('⚠�E�Eロール解除')
        .setDescription(removed.map(id => `<@&${id}>`).join('\n'))
        .setColor(0xff6600));
    }

    const row = new ActionRowBuilder().addComponents(
      new RoleSelectMenuBuilder()
        .setCustomId('admin_role_select')
        .setPlaceholder('管琁E��E��して許可するロールを選抁E)
        .setMinValues(0)
        .setMaxValues(25)
    );

    await interaction.update({
      embeds,
      components: [row],
      flags: 1 << 6
    });

  } catch (error) {
    console.error('admin_role_select処琁E��ラー:', error);
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❁Eロール設定�E琁E��にエラーが発生しました、E,
        ephemeral: true
      });
    } else {
      await interaction.followUp({
        content: '❁Eロール設定�E琁E��にエラーが発生しました、E,
        ephemeral: true
      });
    }
  }
}

module.exports = {
  customId: 'admin_role_select',
  handle: requireAdmin(actualHandler)
};
