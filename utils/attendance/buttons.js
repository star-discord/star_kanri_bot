const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { saveWorkStart, saveWorkEnd, getTodayAttendance, calculateWorkHours, generateTimeSlotStats } = require('../attendanceUtil');
const { requireAdmin } = require('../permissions/requireAdmin');

// ボタンハンドラー関数を定義
function getAttendanceButtonHandler(customId) {
  const handlers = {
    'attendance_work_start_20': {
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
            return interaction.reply({
              content: '❌ **既に出勤中です**\n退勤処理を行ってから再度出勤してください。',
              ephemeral: true
            });
          }
          return interaction.reply({
            content: '❌ **出勤記録に失敗しました**\n管理者にお問い合わせください。',
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ 出勤完了')
          .setDescription(`**${interaction.user.username}** さんが出勤しました`)
          .addFields(
            { name: '🕐 出勤時間', value: '20:00', inline: true },
            { name: '📅 出勤日', value: now.toLocaleDateString('ja-JP'), inline: true },
            { name: '👤 メンバー', value: `<@${interaction.user.id}>`, inline: true }
          )
          .setTimestamp();

        // 退勤ボタンを追加
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('attendance_work_end')
              .setLabel('🏠 退勤する')
              .setStyle(ButtonStyle.Secondary)
          );

        await interaction.reply({
          embeds: [embed],
          components: [row]
        });
      }
    },

    'attendance_work_start_21': {
      handle: async function(interaction) {
        const now = new Date();
        const workStartTime = new Date();
        workStartTime.setHours(21, 0, 0, 0);

        const attendanceData = {
          userId: interaction.user.id,
          username: interaction.user.username,
          workStartTime: workStartTime.toISOString(),
          workStartDisplay: '21時',
          actualStartTime: now.toISOString(),
          workEndTime: null,
          status: 'working'
        };

        const result = await saveWorkStart(interaction.guildId, attendanceData);

        if (!result.success) {
          if (result.reason === 'already_working') {
            return interaction.reply({
              content: '❌ **既に出勤中です**\n退勤処理を行ってから再度出勤してください。',
              ephemeral: true
            });
          }
          return interaction.reply({
            content: '❌ **出勤記録に失敗しました**\n管理者にお問い合わせください。',
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ 出勤完了')
          .setDescription(`**${interaction.user.username}** さんが出勤しました`)
          .addFields(
            { name: '🕘 出勤時間', value: '21:00', inline: true },
            { name: '📅 出勤日', value: now.toLocaleDateString('ja-JP'), inline: true },
            { name: '👤 メンバー', value: `<@${interaction.user.id}>`, inline: true }
          )
          .setTimestamp();

        // 退勤ボタンを追加
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('attendance_work_end')
              .setLabel('🏠 退勤する')
              .setStyle(ButtonStyle.Secondary)
          );

        await interaction.reply({
          embeds: [embed],
          components: [row]
        });
      }
    },

    'attendance_work_start_22': {
      handle: async function(interaction) {
        const now = new Date();
        const workStartTime = new Date();
        workStartTime.setHours(22, 0, 0, 0);

        const attendanceData = {
          userId: interaction.user.id,
          username: interaction.user.username,
          workStartTime: workStartTime.toISOString(),
          workStartDisplay: '22時',
          actualStartTime: now.toISOString(),
          workEndTime: null,
          status: 'working'
        };

        const result = await saveWorkStart(interaction.guildId, attendanceData);

        if (!result.success) {
          if (result.reason === 'already_working') {
            return interaction.reply({
              content: '❌ **既に出勤中です**\n退勤処理を行ってから再度出勤してください。',
              ephemeral: true
            });
          }
          return interaction.reply({
            content: '❌ **出勤記録に失敗しました**\n管理者にお問い合わせください。',
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ 出勤完了')
          .setDescription(`**${interaction.user.username}** さんが出勤しました`)
          .addFields(
            { name: '🕙 出勤時間', value: '22:00', inline: true },
            { name: '📅 出勤日', value: now.toLocaleDateString('ja-JP'), inline: true },
            { name: '👤 メンバー', value: `<@${interaction.user.id}>`, inline: true }
          )
          .setTimestamp();

        // 退勤ボタンを追加
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('attendance_work_end')
              .setLabel('🏠 退勤する')
              .setStyle(ButtonStyle.Secondary)
          );

        await interaction.reply({
          embeds: [embed],
          components: [row]
        });
      }
    },

    'attendance_work_start_now': {
      handle: async function(interaction) {
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const attendanceData = {
          userId: interaction.user.id,
          username: interaction.user.username,
          workStartTime: now.toISOString(),
          workStartDisplay: timeString,
          actualStartTime: now.toISOString(),
          workEndTime: null,
          status: 'working'
        };

        const result = await saveWorkStart(interaction.guildId, attendanceData);

        if (!result.success) {
          if (result.reason === 'already_working') {
            return interaction.reply({
              content: '❌ **既に出勤中です**\n退勤処理を行ってから再度出勤してください。',
              ephemeral: true
            });
          }
          return interaction.reply({
            content: '❌ **出勤記録に失敗しました**\n管理者にお問い合わせください。',
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ 出勤完了')
          .setDescription(`**${interaction.user.username}** さんが出勤しました`)
          .addFields(
            { name: '🕐 出勤時間', value: timeString, inline: true },
            { name: '📅 出勤日', value: now.toLocaleDateString('ja-JP'), inline: true },
            { name: '👤 メンバー', value: `<@${interaction.user.id}>`, inline: true }
          )
          .setTimestamp();

        // 退勤ボタンを追加
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('attendance_work_end')
              .setLabel('🏠 退勤する')
              .setStyle(ButtonStyle.Secondary)
          );

        await interaction.reply({
          embeds: [embed],
          components: [row]
        });
      }
    },

    'attendance_work_end': {
      handle: async function(interaction) {
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const endData = {
          workEndTime: now.toISOString(),
          workEndDisplay: timeString
        };

        const result = await saveWorkEnd(interaction.guildId, interaction.user.id, endData);

        if (!result.success) {
          if (result.reason === 'no_work_start') {
            return interaction.reply({
              content: '❌ **出勤記録が見つかりません**\n先に出勤処理を行ってください。',
              ephemeral: true
            });
          }
          return interaction.reply({
            content: '❌ **退勤記録に失敗しました**\n管理者にお問い合わせください。',
            ephemeral: true
          });
        }

        const record = result.record;
        const workHours = calculateWorkHours(record.workStartTime, record.workEndTime);

        const embed = new EmbedBuilder()
          .setColor('#ff9900')
          .setTitle('🏠 退勤完了')
          .setDescription(`**${interaction.user.username}** さんお疲れ様でした！`)
          .addFields(
            { name: '🕐 出勤時間', value: record.workStartDisplay, inline: true },
            { name: '🏠 退勤時間', value: timeString, inline: true },
            { name: '⏰ 勤務時間', value: `${workHours}時間`, inline: true },
            { name: '📅 勤務日', value: now.toLocaleDateString('ja-JP'), inline: true },
            { name: '👤 メンバー', value: `<@${interaction.user.id}>`, inline: true }
          )
          .setTimestamp();

        await interaction.reply({
          embeds: [embed]
        });
      }
    },

    'attendance_status_check': {
      handle: async function(interaction) {
        const isAdmin = await requireAdmin(interaction, false);
        if (!isAdmin) {
          return interaction.reply({
            content: '❌ **管理者権限が必要です**',
            ephemeral: true
          });
        }

        const attendanceData = await getTodayAttendance(interaction.guildId);
        const stats = generateTimeSlotStats(attendanceData.records);

        let statusList = '';
        if (attendanceData.records.length === 0) {
          statusList = 'まだ出勤者はいません';
        } else {
          attendanceData.records.forEach(record => {
            const status = record.workEndTime ? '退勤済み' : '勤務中';
            const workHours = record.workEndTime ? 
              `(${calculateWorkHours(record.workStartTime, record.workEndTime)}h)` : '';
            statusList += `**${record.username}**: ${record.workStartDisplay}出勤 - ${status} ${workHours}\n`;
          });
        }

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('📊 本日の出勤状況')
          .setDescription(statusList)
          .addFields(
            { name: '🕐 20時出勤', value: `${stats['20時']}人`, inline: true },
            { name: '🕘 21時出勤', value: `${stats['21時']}人`, inline: true },
            { name: '🕙 22時出勤', value: `${stats['22時']}人`, inline: true },
            { name: '⏰ 今から出勤', value: `${stats['今から']}人`, inline: true },
            { name: '✅ 退勤済み', value: `${stats['退勤済み']}人`, inline: true },
            { name: '🔥 勤務中', value: `${stats['未退勤']}人`, inline: true }
          )
          .setFooter({ text: `日付: ${attendanceData.date}` })
          .setTimestamp();

        await interaction.reply({
          embeds: [embed],
          ephemeral: true
        });
      }
    }
  };

  return handlers[customId] || null;
}

module.exports = getAttendanceButtonHandler;
