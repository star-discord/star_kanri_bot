// utils/writeTotusunaXlsx.js
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

async function writeTotusunaReport(guildId, data) {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const dir = path.join(__dirname, `../data/${guildId}`);
  const file = path.join(dir, `${guildId}-${ym}-凸スナ報告.xlsx`);

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const workbook = fs.existsSync(file) ? await new ExcelJS.Workbook().xlsx.readFile(file) : new ExcelJS.Workbook();
  const sheet = workbook.getWorksheet('報告') || workbook.addWorksheet('報告');

  if (sheet.rowCount === 0) {
    sheet.addRow(['日時', '何組', '何名', '卓1', '卓2', '卓3', '卓4', '詳細', '名前']);
  }

  const row = [
    new Date().toLocaleString(),
    data.group,
    data.name,
    data.tables[0] || '',
    data.tables[1] || '',
    data.tables[2] || '',
    data.tables[3] || '',
    data.detail,
    data.username
  ];

  sheet.addRow(row);
  await workbook.xlsx.writeFile(file);
}

module.exports = { writeTotusunaReport };
