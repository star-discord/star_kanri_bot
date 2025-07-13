// 退勤ボタン（例）
const { saveWorkEnd } = require('../../attendanceUtil');

module.exports = {
  customId: 'attendance_work_end',
  handle: async function(interaction) {
    const now = new Date();
    const result = await saveWorkEnd(interaction.guildId, interaction.user.id, now);
    if (!result.success) {
      if (result.reason === 'not_working') {
        return interaction.reply({
          content: '❌ **出勤記録がありません**\n出勤してから退勤してください。',
          ephemeral: true
        });
      }
      return interaction.reply({ content: '退勤処理に失敗しました。', ephemeral: true });
    }
    await interaction.reply({ content: '退勤を記録しました。', ephemeral: true });
  }
};
