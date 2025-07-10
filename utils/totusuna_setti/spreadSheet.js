// utils/totusuna_setti/spreadSheet.js
const path = require('path');
const fs = require('fs');

async function writeToSheet(guildId, yearMonth, entry) {
  const dir = path.join(__dirname, `../../../data/${guildId}`);
  const csvPath = path.join(dir, `${guildId}-${yearMonth}-凸スナ報告.csv`);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // CSVへの追記
  const headers = ['報告者名', '日時', '何組', '何名', '卓1', '卓2', '卓3', '卓4', '詳細'];
  const values = [
    entry.username,
    entry.date,
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
  writeToSheet,
};
