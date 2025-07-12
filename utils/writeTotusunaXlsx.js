// utils/writeTotusunaXlsx.js
const { loadOrCreateWorkbook, saveAndSyncWorkbook } = require('./spreadsheetHandler');

/**
 * 蜃ｸ繧ｹ繝雁ｱ蜻翫ョ繝ｼ繧ｿ繧脱xcel繝輔ぃ繧､繝ｫ縺ｫ霑ｽ險倥＠縲；CS縺ｫ繧ゅい繝・・繝ｭ繝ｼ繝峨☆繧・ * @param {string} guildId - 繧ｮ繝ｫ繝迂D
 * @param {Object} data - 霑ｽ險倥☆繧九ョ繝ｼ繧ｿ・・roup, name, tables[], detail, username・・ */
async function writeTotusunaReport(guildId, data) {
  const suffix = '蜃ｸ繧ｹ繝雁ｱ蜻・;
  const { workbook, sheet, localPath, gcsPath } = await loadOrCreateWorkbook(guildId, suffix);

  // 霑ｽ險倥ョ繝ｼ繧ｿ
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

