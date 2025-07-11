const fs = require('fs');
const path = require('path');

const guildId = 'YOUR_GUILD_ID_HERE'; // ← 実際のギルドIDに置き換え
const filePath = path.join(__dirname, 'data', guildId, `${guildId}.json`);

if (!fs.existsSync(filePath)) {
  console.log('⚠️ ファイルが存在しません:', filePath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
console.dir(data, { depth: null });
