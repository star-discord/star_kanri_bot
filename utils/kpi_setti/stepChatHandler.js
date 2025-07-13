// ファイル参�E: utils/kpi_setti/stepChatHandler.js

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { validateDate, isHalfWidthNumber } = require('./utils');
const { saveKpiTarget, saveKpiReport, formatProgressLog } = require('./step/kpiDataHandler');

// ユーザーIDをキーにして進行中セッションを管理
const activeReportSessions = new Map();

/**
 * ステップチャットのメッセージ処理
 * @param {import('discord.js').Message} message
 */
async function handleStepChatMessage(message) {
  const userId = message.author.id;
  if (!activeReportSessions.has(userId)) return;

  const session = activeReportSessions.get(userId);
  const content = message.content.trim();

  // 半角数字、スラッシュ、ピリオド・ハイフン等の検証ユーティリティを使用
  // session.type: 'target' または 'report'

  if (session.type === 'target') {
    await handleTargetStep(message, session, content);
  } else if (session.type === 'report') {
    await handleReportStep(message, session, content);
  }
}

/**
 * KPI目標入力ステップの処理
 */
async function handleTargetStep(message, session, content) {
  try {
    switch (session.step) {
      case 0:
        if (!validateDate(content)) {
          await message.reply('❌ 期間開始日は「YYYY/MM/DD」形式で正しく入力してください。例: 2025/07/13');
          return;
        }
        session.data.startDate = content;
        session.step++;
        await message.reply('終了日を「YYYY/MM/DD」の形式で入力してください。');
        break;

      case 1:
        if (!validateDate(content)) {
          await message.reply('❌ 期間終了日は「YYYY/MM/DD」形式で正しく入力してください。');
          return;
        }
        session.data.endDate = content;
        session.step++;
        await message.reply('来客数目標を入力してください（数字のみ）。');
        break;

      case 2:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❌ 来客数目標は半角数字で入力してください。');
          return;
        }
        session.data.visitors = Number(content);
        session.step++;
        await message.reply('指名本数目標を入力してください（数字のみ）。');
        break;

      case 3:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❌ 指名本数目標は半角数字で入力してください。');
          return;
        }
        session.data.shimei_count = Number(content);
        session.step++;
        await message.reply('指名売上目標を入力してください（数字のみ）。');
        break;

      case 4:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❌ 指名売上目標は半角数字で入力してください。');
          return;
        }
        session.data.shimei_sales = Number(content);
        session.step++;
        await message.reply('フリー売上目標を入力してください（数字のみ）。');
        break;

      case 5:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❌ フリー売上目標は半角数字で入力してください。');
          return;
        }
        session.data.free_sales = Number(content);
        session.step++;
        await message.reply('純売上目標を入力してください（数字のみ）。');
        break;

      case 6:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❌ 純売上目標は半角数字で入力してください。');
          return;
        }
        session.data.total_sales = Number(content);

        // 保存処理
        await saveKpiTarget(message.guildId, session.data);

        // 完了メッセージと次の操作ボタン表示
        await message.channel.send('✅ KPI目標が保存されました。');

        await sendKpiStartButtons(message.channel);

        activeReportSessions.delete(message.author.id);
        break;

      default:
        await message.reply('❌ 不明なエラーが発生しました。');
        activeReportSessions.delete(message.author.id);
        break;
    }
  } catch (err) {
    console.error('KPI目標入力処理エラー:', err);
    await message.reply('❌ KPI目標の保存中にエラーが発生しました。');
    activeReportSessions.delete(message.author.id);
  }
}

/**
 * KPI実績申請入力ステップの処理
 */
async function handleReportStep(message, session, content) {
  try {
    switch (session.step) {
      case 0:
        if (!validateDate(content)) {
          await message.reply('❌ 申請日付は「YYYY/MM/DD」形式で正しく入力してください。');
          return;
        }
        session.data.date = content;
        session.step++;
        await message.reply('来客数を入力してください（数字のみ）。');
        break;

      case 1:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❌ 来客数は半角数字で入力してください。');
          return;
        }
        session.data.visitors = Number(content);
        session.step++;
        await message.reply('指名本数を入力してください（数字のみ）。');
        break;

      case 2:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❌ 指名本数は半角数字で入力してください。');
          return;
        }
        session.data.shimei_count = Number(content);
        session.step++;
        await message.reply('指名売上を入力してください（数字のみ）。');
        break;

      case 3:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❌ 指名売上は半角数字で入力してください。');
          return;
        }
        session.data.shimei_sales = Number(content);
        session.step++;
        await message.reply('フリー売上を入力してください（数字のみ）。');
        break;

      case 4:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❌ フリー売上は半角数字で入力してください。');
          return;
        }
        session.data.free_sales = Number(content);
        session.step++;
        await message.reply('純売上を入力してください（数字のみ）。');
        break;

      case 5:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❌ 純売上は半角数字で入力してください。');
          return;
        }
        session.data.total_sales = Number(content);

        // 実績保存とログ生成
        const log = await saveKpiReport(message.guildId, session.data);

        // ログ出力
        await message.channel.send('✅ KPI申請が完了しました。進捗状況は以下の通りです。');
        await message.channel.send('```' + log + '```');

        // KPI報告開始ボタンを再表示
        await sendKpiStartButtons(message.channel);

        activeReportSessions.delete(message.author.id);
        break;

      default:
        await message.reply('❌ 不明なエラーが発生しました。');
        activeReportSessions.delete(message.author.id);
        break;
    }
  } catch (err) {
    console.error('KPI実績申請入力処理エラー:', err);
    await message.reply('❌ KPI申請の保存中にエラーが発生しました。');
    activeReportSessions.delete(message.author.id);
  }
}

/**
 * KPI報告開始用の目標／申請ボタンを送信するユーティリティ
 * @param {import('discord.js').TextChannel | import('discord.js').DMChannel | import('discord.js').NewsChannel} channel
 */
async function sendKpiStartButtons(channel) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('kpi_target_start_button')
      .setLabel('KPI目標')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('kpi_report_start_button')
      .setLabel('KPI申請')
      .setStyle(ButtonStyle.Success)
  );

  await channel.send({
    content: 'KPI報告　目標設定・申請ボタン',
    components: [row],
  });
}

module.exports = {
  activeReportSessions,
  handleStepChatMessage,
};
