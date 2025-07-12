// utils/kpi_setti/buttons/kpi_report_start_button.js

const { activeReportSessions, handleStepChatMessage } = require('../stepChatHandler');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async (interaction) => {
  const userId = interaction.user.id;

  if (activeReportSessions.has(userId)) {
    await interaction.reply({ content: 'すでに申請入力中です。完了するまでお待ちください。', ephemeral: true });
    return;
  }

  // セッション開始
  activeReportSessions.set(userId, { step: 0, data: {} });

  // ステップチャット開始メッセージ
  await interaction.reply({ content: 'KPI申請を開始します。報告する日付を入力してください（例: 2025/07/13）' });

  // このハンドラは開始のみのため、実際のメッセージ受付処理は
  // botの messageCreate イベントで handleStepChatMessage が動作する想定です
};

// 申請完了時の処理は stepChatHandler の handleStepChatMessage 内で行うのが望ましいです。
// 例として、申請完了後のログ出力＋再案内メッセージ送信処理を
// stepChatHandler.js の saveKpiReport 関数呼び出し直後に実装してください。
