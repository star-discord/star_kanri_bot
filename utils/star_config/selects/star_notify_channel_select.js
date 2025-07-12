const requireAdmin = require('../../permissions/requireAdmin');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper');

module.exports = {
  customId: 'notify_channel_select',
  execute: requireAdmin(async (interaction) => {
    const guild = interaction.guild;
    const selected = interaction.values[0];

    const filePath = await ensureGuildJSON(guild.id);
    const data = await readJSON(filePath);

    data.star_config = data.star_config || {};
    data.star_config.notifyChannelId = selected;

    await writeJSON(filePath, data);

    await interaction.reply({
      content: `✅ 通知チャンネルを <#${selected}> に設定しました。`,
      ephemeral: true
    });
  })
};
