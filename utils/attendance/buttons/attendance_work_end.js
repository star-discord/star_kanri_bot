// 退勤ボタン（例）
const { saveWorkEnd } = require('../../attendanceUtil');
const { MessageFlags } = require('discord.js');

module.exports = {
  customId: 'attendance_work_end',
  handle: async function(interaction) {
    const now = new Date();
    const result = await saveWorkEnd(interaction.guildId, interaction.user.id, now);
    if (!result.success) {
      if (result.reason === 'not_working') {
        if (!interaction.replied && !interaction.deferred) {
          return interaction.reply({
            content: '❌ **出勤記録がありません**\n出勤してから退勤してください。',
            flags: MessageFlags.Ephemeral
          });
        }
        return;
      }
      if (!interaction.replied && !interaction.deferred) {
        return interaction.reply({ content: '退勤処理に失敗しました。', flags: MessageFlags.Ephemeral });
      }
      return;
    }
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '退勤を記録しました。', flags: MessageFlags.Ephemeral });
    }
  }
};
