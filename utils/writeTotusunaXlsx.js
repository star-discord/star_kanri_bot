// utils/writeTotusunaXlsx.js
const { loadOrCreateWorkbook, saveAndSyncWorkbook } = require('./spreadsheetHandler');

/**
 * 凸スナ報告データをExcelファイルに追記し、GCSにもアチE�EロードすめE * @param {string} guildId - ギルドID
 * @param {Object} data - 追記するデータ�E�Eroup, name, tables[], detail, username�E�E */
async function writeTotusunaReport(guildId, data) {
  const suffix = '凸スナ報呁E;
  const { workbook, sheet, localPath, gcsPath } = await loadOrCreateWorkbook(guildId, suffix);

  // 追記データ
  const row = [
    new Date().toLocaleString(),
    data.group || '',
    data.name || '',
    data.tables?.[0] || '',
    data.tables?.[1] || '',
    data.tables?.[2] || '',
    data.tables?.[3] || '',
    data.detail || '',
    data.username || ''
  ];

  sheet.addRow(row);
  await saveAndSyncWorkbook(workbook, localPath, gcsPath);
}

module.exports = { writeTotusunaReport };

