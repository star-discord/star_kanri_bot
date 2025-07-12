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

    // star_config縺ｮ蛻晄悄蛹・    if (!data.star_config) {
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
          return role ? `<@&${id}>` : `~~(蜑企勁貂医Ο繝ｼ繝ｫ: ${id})~~`;
        }).join('\n')
      : '*譛ｪ險ｭ螳・';

    const embeds = [
      new EmbedBuilder()
        .setTitle('検 STAR邂｡逅・ot險ｭ螳・)
        .setDescription(`東 迴ｾ蝨ｨ縺ｮ邂｡逅・・Ο繝ｼ繝ｫ:\n${mentions}`)
        .setColor(0x0099ff)
    ];

    if (added.length > 0) {
      embeds.push(new EmbedBuilder()
        .setTitle('笨・繝ｭ繝ｼ繝ｫ霑ｽ蜉')
        .setDescription(added.map(id => `<@&${id}>`).join('\n'))
        .setColor(0x00cc99));
    }

    if (removed.length > 0) {
      embeds.push(new EmbedBuilder()
        .setTitle('笞・・繝ｭ繝ｼ繝ｫ隗｣髯､')
        .setDescription(removed.map(id => `<@&${id}>`).join('\n'))
        .setColor(0xff6600));
    }

    const row = new ActionRowBuilder().addComponents(
      new RoleSelectMenuBuilder()
        .setCustomId('admin_role_select')
        .setPlaceholder('邂｡逅・・→縺励※險ｱ蜿ｯ縺吶ｋ繝ｭ繝ｼ繝ｫ繧帝∈謚・)
        .setMinValues(0)
        .setMaxValues(25)
    );

    await interaction.update({
      embeds,
      components: [row],
      flags: 1 << 6
    });

  } catch (error) {
    console.error('admin_role_select蜃ｦ逅・お繝ｩ繝ｼ:', error);
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '笶・繝ｭ繝ｼ繝ｫ險ｭ螳壼・逅・ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・,
        ephemeral: true
      });
    } else {
      await interaction.followUp({
        content: '笶・繝ｭ繝ｼ繝ｫ險ｭ螳壼・逅・ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・,
        ephemeral: true
      });
    }
  }
}

module.exports = {
  customId: 'admin_role_select',
  handle: requireAdmin(actualHandler)
};
