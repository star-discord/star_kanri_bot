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

  // 半角数字�EスラチE��ュ・ハイフン等�E検証ユーチE��リチE��を使用
  // session.type: 'target' また�E 'report'

  if (session.type === 'target') {
    await handleTargetStep(message, session, content);
  } else if (session.type === 'report') {
    await handleReportStep(message, session, content);
  }
}

/**
 * KPI目標�E力スチE��プ�E琁E */
async function handleTargetStep(message, session, content) {
  try {
    switch (session.step) {
      case 0:
        if (!validateDate(content)) {
          await message.reply('❁E期間開始日は「YYYY/MM/DD」形式で正しく入力してください。侁E 2025/07/13');
          return;
        }
        session.data.startDate = content;
        session.step++;
        await message.reply('終亁E��を「YYYY/MM/DD」�E形式で入力してください、E);
        break;

      case 1:
        if (!validateDate(content)) {
          await message.reply('❁E期間終亁E��は「YYYY/MM/DD」形式で正しく入力してください、E);
          return;
        }
        session.data.endDate = content;
        session.step++;
        await message.reply('来客数目標を入力してください�E�数字�Eみ�E�、E);
        break;

      case 2:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❁E来客数目標�E半角数字で入力してください、E);
          return;
        }
        session.data.visitors = Number(content);
        session.step++;
        await message.reply('持E��本数目標を入力してください�E�数字�Eみ�E�、E);
        break;

      case 3:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❁E持E��本数目標�E半角数字で入力してください、E);
          return;
        }
        session.data.shimei_count = Number(content);
        session.step++;
        await message.reply('持E��売上目標を入力してください�E�数字�Eみ�E�、E);
        break;

      case 4:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❁E持E��売上目標�E半角数字で入力してください、E);
          return;
        }
        session.data.shimei_sales = Number(content);
        session.step++;
        await message.reply('フリー売上目標を入力してください�E�数字�Eみ�E�、E);
        break;

      case 5:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❁Eフリー売上目標�E半角数字で入力してください、E);
          return;
        }
        session.data.free_sales = Number(content);
        session.step++;
        await message.reply('純売上目標を入力してください�E�数字�Eみ�E�、E);
        break;

      case 6:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❁E純売上目標�E半角数字で入力してください、E);
          return;
        }
        session.data.total_sales = Number(content);

        // 保存�E琁E        await saveKpiTarget(message.guildId, session.data);

        // 完亁E��チE��ージ�E�次の操作�Eタン表示
        await message.channel.send('✁EKPI目標が保存されました、E);

        await sendKpiStartButtons(message.channel);

        activeReportSessions.delete(message.author.id);
        break;

      default:
        await message.reply('❁E不�Eなエラーが発生しました、E);
        activeReportSessions.delete(message.author.id);
        break;
    }
  } catch (err) {
    console.error('KPI目標�E力�E琁E��ラー:', err);
    await message.reply('❁EKPI目標�E保存中にエラーが発生しました、E);
    activeReportSessions.delete(message.author.id);
  }
}

/**
 * KPI実績申請�E力スチE��プ�E琁E */
async function handleReportStep(message, session, content) {
  try {
    switch (session.step) {
      case 0:
        if (!validateDate(content)) {
          await message.reply('❁E申請日付�E「YYYY/MM/DD」形式で正しく入力してください、E);
          return;
        }
        session.data.date = content;
        session.step++;
        await message.reply('来客数を�E力してください�E�数字�Eみ�E�、E);
        break;

      case 1:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❁E来客数は半角数字で入力してください、E);
          return;
        }
        session.data.visitors = Number(content);
        session.step++;
        await message.reply('持E��本数を�E力してください�E�数字�Eみ�E�、E);
        break;

      case 2:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❁E持E��本数は半角数字で入力してください、E);
          return;
        }
        session.data.shimei_count = Number(content);
        session.step++;
        await message.reply('持E��売上を入力してください�E�数字�Eみ�E�、E);
        break;

      case 3:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❁E持E��売上�E半角数字で入力してください、E);
          return;
        }
        session.data.shimei_sales = Number(content);
        session.step++;
        await message.reply('フリー売上を入力してください�E�数字�Eみ�E�、E);
        break;

      case 4:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❁Eフリー売上�E半角数字で入力してください、E);
          return;
        }
        session.data.free_sales = Number(content);
        session.step++;
        await message.reply('純売上を入力してください�E�数字�Eみ�E�、E);
        break;

      case 5:
        if (!isHalfWidthNumber(content)) {
          await message.reply('❁E純売上�E半角数字で入力してください、E);
          return;
        }
        session.data.total_sales = Number(content);

        // 実績保存！E��グ生�E
        const log = await saveKpiReport(message.guildId, session.data);

        // ログ出劁E        await message.channel.send('✁EKPI申請が完亁E��ました。進捗状況�E以下�E通りです、E);
        await message.channel.send('```' + log + '```');

        // KPI報告開始�Eタンを�E表示
        await sendKpiStartButtons(message.channel);

        activeReportSessions.delete(message.author.id);
        break;

      default:
        await message.reply('❁E不�Eなエラーが発生しました、E);
        activeReportSessions.delete(message.author.id);
        break;
    }
  } catch (err) {
    console.error('KPI実績申請�E力�E琁E��ラー:', err);
    await message.reply('❁EKPI申請�E保存中にエラーが発生しました、E);
    activeReportSessions.delete(message.author.id);
  }
}

/**
 * KPI報告開始用の目標／申請�Eタンを送信するユーチE��リチE��
 * @param {import('discord.js').TextChannel | import('discord.js').DMChannel | import('discord.js').NewsChannel} channel
 */
async function sendKpiStartButtons(channel) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('kpi_target_start_button')
      .setLabel('KPI目樁E)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('kpi_report_start_button')
      .setLabel('KPI申諁E)
      .setStyle(ButtonStyle.Success)
  );

  await channel.send({
    content: 'KPI報告　目標設宁E申請�Eタン',
    components: [row],
  });
}

module.exports = {
  activeReportSessions,
  handleStepChatMessage,
};
