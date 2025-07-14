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

      // 選択された凸スナ設定を取得
      const totusuna = data.totusuna_list?.find(item => item.messageId === selectedValue);
      
      if (!totusuna) {
        await interaction.reply({
          content: '選択された凸スナデータが見つかりません。',
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      // 設定編集画面を表示
      await interaction.reply({
        content: `**${totusuna.body || '本文未設定'}** の設定を編集できます。\n` +
                 `**メインチャンネル:** <#${totusuna.mainChannelId}>\n` +
                 `**複製チャンネル:** ${totusuna.replicateChannelIds?.length ? totusuna.replicateChannelIds.map(id => `<#${id}>`).join(', ') : '未設定'}`,
        flags: MessageFlags.Ephemeral
      });

    } catch (error) {
      console.error('totusuna_config_select処理エラー:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '設定表示中にエラーが発生しました。',
          flags: MessageFlags.Ephemeral
        });
      } else {
        await interaction.followUp({
          content: '設定表示中にエラーが発生しました。',
          flags: MessageFlags.Ephemeral
        });
      }
    }
  })
};
