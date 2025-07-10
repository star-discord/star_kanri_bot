// utils/totusuna_setti/spreadSheet.js
const path = require('path');
const fs = require('fs');

/**
 * 凸スナ報告をCSVファイルに追記します
 * @param {string} guildId ギルドID
 * @param {string} yearMonth 例: "2025-07"
 * @param {object} entry 報告内容
 */
async function writeTotusunaReport(guildId, yearMonth, entry) {
  const dir = path.join(__dirname, `../../../data/${guildId}`);
  const csvPath = path.join(dir, `${guildId}-${yearMonth}-凸スナ報告.csv`);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 日付が未定義なら現在時刻で補完
  const dateStr = entry.date || new Date().toISOString();

  const headers = ['報告者名', '日時', '何組', '何名', '卓1', '卓2', '卓3', '卓4', '詳細'];
  const values = [
    entry.username,
    dateStr,
    entry.group,
    entry.name,
    entry.table1 || '',
    entry.table2 || '',
    entry.table3 || '',
    entry.table4 || '',
    entry.detail || ''
  ];

  const csvLine = `${values.map(v => `"${v}"`).join(',')}\n`;

  if (!fs.existsSync(csvPath)) {
    fs.writeFileSync(csvPath, `${headers.join(',')}\n`, 'utf8');
  }

  fs.appendFileSync(csvPath, csvLine, 'utf8');
}

module.exports = {
  writeTotusunaReport, // 🔁 関数名を統一
};
