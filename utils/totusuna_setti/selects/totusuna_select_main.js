const requireAdmin = require('../../permissions/requireAdmin');
const { ensureGuildJSON, readJSON, writeJSON } = require('../../fileHelper');

module.exports = {
  customId: 'totusuna_select_main',

  handle: requireAdmin(async (interaction) => {
    try {
      const guild = interaction.guild;
      const selectedChannelId = interaction.values[0];

      const filePath = await ensureGuildJSON(guild.id);
      const data = await readJSON(filePath);

      // totusuna_settiセクションの初期匁E
      if (!data.totusuna_setti) {
        data.totusuna_setti = {};
      }

      // メインチャンネルを設宁E
      data.totusuna_setti.mainChannelId = selectedChannelId;
      await writeJSON(filePath, data);

      await interaction.reply({
        content: `✁EメインチャンネルめE<#${selectedChannelId}> に設定しました。`,
        ephemeral: true
      });

    } catch (error) {
      console.error('totusuna_select_main処琁E��ラー:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❁Eチャンネル設定中にエラーが発生しました、E,
          ephemeral: true
        });
      } else {
        await interaction.followUp({
          content: '❁Eチャンネル設定中にエラーが発生しました、E,
          ephemeral: true
        });
      }
    }
  })
};
