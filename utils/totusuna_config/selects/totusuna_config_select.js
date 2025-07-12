const requireAdmin = require('../../permissions/requireAdmin');
const { ensureGuildJSON, readJSON } = require('../../fileHelper');

module.exports = {
  customId: 'totusuna_config_select',

  handle: requireAdmin(async (interaction) => {
    try {
      const guild = interaction.guild;
      const selectedValue = interaction.values[0];

      const filePath = await ensureGuildJSON(guild.id);
      const data = await readJSON(filePath);

      // 選択された凸スナ設定を取征E
      const totusuna = data.totusuna_list?.find(item => item.messageId === selectedValue);
      
      if (!totusuna) {
        await interaction.reply({
          content: '❁E選択された凸スナデータが見つかりません、E,
          ephemeral: true
        });
        return;
      }

      // 設定編雁E��面を表示
      await interaction.reply({
        content: `🔧 **${totusuna.body || '本斁E��設宁E}** の設定を編雁E��きます、En\n` +
                 `**メインチャンネル:** <#${totusuna.mainChannelId}>\n` +
                 `**褁E��チャンネル:** ${totusuna.replicateChannelIds?.length ? totusuna.replicateChannelIds.map(id => `<#${id}>`).join(', ') : '未設宁E}`,
        ephemeral: true
      });

    } catch (error) {
      console.error('totusuna_config_select処琁E��ラー:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❁E設定表示中にエラーが発生しました、E,
          ephemeral: true
        });
      } else {
        await interaction.followUp({
          content: '❁E設定表示中にエラーが発生しました、E,
          ephemeral: true
        });
      }
    }
  })
};
