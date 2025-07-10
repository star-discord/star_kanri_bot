// deploy-commands.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// コマンドの読み込み
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[WARNING] スラッシュコマンド形式不正: ${filePath}`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`⏳ ${commands.length}個のスラッシュコマンドを登録中...`);

    // ギルドコマンド登録（即時反映：開発用）
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands },
      );
      console.log('✅ ギルドコマンド登録完了（即時反映）');
    } else {
      console.log('⚠️ GUILD_ID が未設定のため、ギルド登録はスキップされました');
    }

    // グローバルコマンド登録（反映に時間あり：本番用）
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    console.log('✅ グローバルコマンド登録完了（反映まで最大1時間）');

  } catch (error) {
    console.error('❌ コマンド登録失敗:', error);
  }
})();
