// utils/totusuna_setti/spreadSheet.js
const path = require('path');
const { getSpreadsheetPath, loadOrCreateWorkbook } = require('../../utils/spreadsheetHandler');

/**
 * 凸スナ報告内容をスプレッドシートに追記
 * @param {string} guildId - サーバーID
 * @param {{
 *   group: string,
 *   name: string,
 *   detail: string,
 *   tables: string[],      // 卓1〜4
 *   reporterName: string   // 報告者名（例: ユーザー名やニックネーム）
 * }} data
 */
async function writeTotusunaReport(guildId, data) {
  try {
    const filePath = getSpreadsheetPath(guildId, '凸スナ報告');
    const { workbook, sheet } = await loadOrCreateWorkbook(filePath);

    const now = new Date();
    const formattedDate = now.toLocaleString('ja-JP', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const row = [
      formattedDate,
      data.group,
      data.name,
      data.tables[0] || '',
      data.tables[1] || '',
      data.tables[2] || '',
      data.tables[3] || '',
      data.detail,
      data.reporterName  // 報告者名
    ];

    sheet.addRow(row);
    await workbook.xlsx.writeFile(filePath);
  } catch (err) {
    console.error('❌ スプレッドシート書き込み失敗:', err);
    throw err;
  }
}

module.exports = {
  writeTotusunaReport
};
