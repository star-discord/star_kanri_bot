const requireAdmin = require('../../permissions/requireAdmin');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper');

module.exports = {
  customId: 'totusuna_select_main',

  execute: requireAdmin(async (interaction) => {
    try {
      const guild = interaction.guild;
      const selectedChannelId = interaction.values[0];

      const filePath = await ensureGuildJSON(guild.id);
      const data = await readJSON(filePath);

      // totusuna_settiセクションの初期化
      if (!data.totusuna_setti) {
        data.totusuna_setti = {};
      }

      // メインチャンネルを設定
      data.totusuna_setti.mainChannelId = selectedChannelId;
      await writeJSON(filePath, data);

      await interaction.reply({
        content: `✅ メインチャンネルを <#${selectedChannelId}> に設定しました。`,
        ephemeral: true
      });

    } catch (error) {
      console.error('totusuna_select_main処理エラー:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ チャンネル設定中にエラーが発生しました。',
          ephemeral: true
        });
      } else {
        await interaction.followUp({
          content: '❌ チャンネル設定中にエラーが発生しました。',
          ephemeral: true
        });
      }
    }
  })
};
