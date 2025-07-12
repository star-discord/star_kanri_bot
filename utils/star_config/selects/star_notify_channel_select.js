const requireAdmin = require('../../permissions/requireAdmin');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper');

module.exports = {
  customId: 'notify_channel_select',
  handle: requireAdmin(async (interaction) => {
    try {
      const guild = interaction.guild;
      const selected = interaction.values[0];

      const filePath = await ensureGuildJSON(guild.id);
      const data = await readJSON(filePath);

      // star_configの初期匁E      if (!data.star_config) {
        data.star_config = {};
      }
      
      data.star_config.notifyChannelId = selected;
      await writeJSON(filePath, data);

      await interaction.reply({
        content: `✁E通知チャンネルめE<#${selected}> に設定しました。`,
        ephemeral: true
      });

    } catch (error) {
      console.error('notify_channel_select処琁E��ラー:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❁E通知チャンネル設定中にエラーが発生しました、E,
          ephemeral: true
        });
      } else {
        await interaction.followUp({
          content: '❁E通知チャンネル設定中にエラーが発生しました、E,
          ephemeral: true
        });
      }
    }
  })
};
