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

      // totusuna_settiセクションの初期匁E
      if (!data.totusuna_setti) {
        data.totusuna_setti = {};
      }

      // 褁E��チャンネルを設宁E
      data.totusuna_setti.replicateChannelIds = selectedChannelIds;
      await writeJSON(filePath, data);

      if (selectedChannelIds.length > 0) {
        const channelMentions = selectedChannelIds.map(id => `<#${id}>`).join(', ');
        await interaction.reply({
          content: `✁E褁E��チャンネルめE${channelMentions} に設定しました。`,
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: `✁E褁E��チャンネルを未設定にしました。`,
          ephemeral: true
        });
      }

    } catch (error) {
      console.error('totusuna_select_replicate処琁E��ラー:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❁E褁E��チャンネル設定中にエラーが発生しました、E,
          ephemeral: true
        });
      } else {
        await interaction.followUp({
          content: '❁E褁E��チャンネル設定中にエラーが発生しました、E,
          ephemeral: true
        });
      }
    }
  })
};
