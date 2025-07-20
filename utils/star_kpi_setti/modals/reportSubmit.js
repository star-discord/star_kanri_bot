const { logAndReplyError } = require('../../errorHelper');
const { createSuccessEmbed, createErrorEmbed } = require('../../embedHelper');
const { writeKpiReport } = require('../../writeKpiReport');

async function handle(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const { guildId, user, customId } = interaction;

  // customIdから店舗名を取得 (例: kpi_report_submit_modal:shopA)
  const shopName = customId.split(':')[1];
  if (!shopName) {
    return logAndReplyError(
      interaction,
      `Invalid modal customId: ${customId}`,
      '❌ 報告の送信に失敗しました。'
    );
  }

  const reportDate = interaction.fields.getTextInputValue('reportDate');
  const details = interaction.fields.getTextInputValue('details');

  // 日付形式のバリデーション
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) {
    return interaction.editReply({
      embeds: [createErrorEmbed('入力エラー', '日付は `YYYY-MM-DD` 形式で入力してください。')],
    });
  }

  try {
    const reportData = {
      username: user.tag,
      shopName,
      reportDate,
      details,
    };

    // CSVに書き込み
    await writeKpiReport(guildId, reportData);

    // 成功メッセージをEmbedで作成
    const successEmbed = createSuccessEmbed(
      '✅ KPI実績報告完了',
      `**${shopName}** の実績報告を受け付けました。ご協力ありがとうございます！`
    ).addFields(
      { name: '対象日', value: reportDate, inline: true },
      { name: '報告者', value: user.toString(), inline: true },
      { name: '実績内容', value: `\`\`\`\n${details}\n\`\`\`` }
    );

    await interaction.editReply({ embeds: [successEmbed] });
  } catch (error) {
    await logAndReplyError(interaction, error, '❌ KPI実績の保存中にエラーが発生しました。');
  }
}

module.exports = {
  customIdStart: 'kpi_report_submit_modal:',
  handle,
};