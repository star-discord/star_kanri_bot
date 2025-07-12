const requireAdmin = require('../../permissions/requireAdmin');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper');

module.exports = {
  customId: 'totusuna_select_replicate',

  handle: requireAdmin(async (interaction) => {
    try {
      const guild = interaction.guild;
      const selectedChannelIds = interaction.values;

      const filePath = await ensureGuildJSON(guild.id);
      const data = await readJSON(filePath);

      // totusuna_setti繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺ｮ蛻晄悄蛹・
      if (!data.totusuna_setti) {
        data.totusuna_setti = {};
      }

      // 隍・｣ｽ繝√Ε繝ｳ繝阪Ν繧定ｨｭ螳・
      data.totusuna_setti.replicateChannelIds = selectedChannelIds;
      await writeJSON(filePath, data);

      if (selectedChannelIds.length > 0) {
        const channelMentions = selectedChannelIds.map(id => `<#${id}>`).join(', ');
        await interaction.reply({
          content: `笨・隍・｣ｽ繝√Ε繝ｳ繝阪Ν繧・${channelMentions} 縺ｫ險ｭ螳壹＠縺ｾ縺励◆縲Ａ,
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: `笨・隍・｣ｽ繝√Ε繝ｳ繝阪Ν繧呈悴險ｭ螳壹↓縺励∪縺励◆縲Ａ,
          ephemeral: true
        });
      }

    } catch (error) {
      console.error('totusuna_select_replicate蜃ｦ逅・お繝ｩ繝ｼ:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '笶・隍・｣ｽ繝√Ε繝ｳ繝阪Ν險ｭ螳壻ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・,
          ephemeral: true
        });
      } else {
        await interaction.followUp({
          content: '笶・隍・｣ｽ繝√Ε繝ｳ繝阪Ν險ｭ螳壻ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・,
          ephemeral: true
        });
      }
    }
  })
};
