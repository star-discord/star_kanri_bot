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

      // totusuna_settiセクションの初期化
      if (!data.totusuna_setti) {
        data.totusuna_setti = {};
      }

      // 複製チャンネルを設定
      data.totusuna_setti.replicateChannelIds = selectedChannelIds;
      await writeJSON(filePath, data);

      if (selectedChannelIds.length > 0) {
        const channelMentions = selectedChannelIds.map(id => `<#${id}>`).join(', ');
        await interaction.reply({
          content: `✅ 複製チャンネルを ${channelMentions} に設定しました。`,
          flags: MessageFlags.Ephemeral
        });
      } else {
        await interaction.reply({
          content: `✅ 複製チャンネルを未設定にしました。`,
          flags: MessageFlags.Ephemeral
        });
      }

    } catch (error) {
      console.error('totusuna_select_replicate処理エラー:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ 複製チャンネル設定中にエラーが発生しました。',
          flags: MessageFlags.Ephemeral
        });
      } else {
        await interaction.followUp({
          content: '❌ 複製チャンネル設定中にエラーが発生しました。',
          flags: MessageFlags.Ephemeral
        });
      }
    }
  })
};
