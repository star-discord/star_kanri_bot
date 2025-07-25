// 出勤ボタン（例）
const { saveWorkStart } = require('../../attendanceUtil');
const { MessageFlags } = require('discord.js');

module.exports = {
  customId: 'attendance_work_start_20',
  handle: async function(interaction) {
    const now = new Date();
    const workStartTime = new Date();
    workStartTime.setHours(20, 0, 0, 0);

    const attendanceData = {
      userId: interaction.user.id,
      username: interaction.user.username,
      workStartTime: workStartTime.toISOString(),
      workStartDisplay: '20時',
      actualStartTime: now.toISOString(),
      workEndTime: null,
      status: 'working'
    };

    const result = await saveWorkStart(interaction.guildId, attendanceData);

    if (!result.success) {
      if (result.reason === 'already_working') {
        if (!interaction.replied && !interaction.deferred) {
          return interaction.reply({
            content: '❌ **既に出勤中です**\n退勤処理を行ってから再度出勤してください。',
            flags: MessageFlagsBitField.Ephemeral
          });
        }
        return;
      }
      if (!interaction.replied && !interaction.deferred) {
        return interaction.reply({ content: '出勤処理に失敗しました。', flags: MessageFlagsBitField.Ephemeral });
      }
      return;
    }
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '20時出勤を記録しました。', flags: MessageFlagsBitField.Ephemeral });
    }
  }
};
