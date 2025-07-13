const fs = require('fs');
const path = require('path');

const guildId = 'YOUR_GUILD_ID_HERE'; // ここを実際のギルドIDに置き換えconst filePath = path.join(__dirname, 'data', guildId, `${guildId}.json`);

if (!fs.existsSync(filePath)) {
  console.log('⚠�E�Eファイルが存在しません:', filePath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
console.dir(data, { depth: null });
