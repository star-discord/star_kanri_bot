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

      // star_configの初期化
      if (!data.star_config) {
        data.star_config = {};
      }
      
      data.star_config.notifyChannelId = selected;
      await writeJSON(filePath, data);

      await interaction.reply({
        content: `通知チャンネルを <#${selected}> に設定しました。`,
        flags: MessageFlags.Ephemeral
      });

    } catch (error) {
      console.error('notify_channel_select処理エラー:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '通知チャンネル設定中にエラーが発生しました。',
          flags: MessageFlags.Ephemeral
        });
      } else {
        await interaction.followUp({
          content: '通知チャンネル設定中にエラーが発生しました。',
          flags: MessageFlags.Ephemeral
        });
      }
    }
  })
};
