const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

// ======= Bot クライアント初期化 =======
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.MessageContent // 必要な場合だけ有効化
  ],
});

client.commands = new Collection();

// ======= コマンド再帰読み込み =======
function loadCommandFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadCommandFiles(fullPath);
    } else if (file.endsWith('.js')) {
      try {
        const command = require(fullPath);
        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command);
          console.log(`✅ コマンド読み込み: ${command.data.name}`);
        } else {
          console.warn(`⚠️ 無効なコマンドファイル: ${fullPath}`);
        }
      } catch (err) {
        console.error(`❌ コマンド読込失敗: ${fullPath}`, err);
      }
    }
  }
}
loadCommandFiles(path.join(__dirname, 'commands'));

// ======= イベント読み込み（任意）=======
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event && event.name && typeof event.execute === 'function') {
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
      console.log(`📡 イベント登録: ${event.name}`);
    } else {
      console.warn(`⚠️ 無効なイベントファイル: ${file}`);
    }
  }
}

// ======= interactionHandler 呼び出し =======
const interactionHandler = require('./utils/interactionHandler');
client.on('interactionCreate', interaction => interactionHandler.execute(interaction, client));

// ======= 起動時ログ =======
client.once('ready', () => {
  console.log(`🎉 Bot 起動完了！ログイン: ${client.user.tag}`);
});

// ======= トークン検証とログイン =======
if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN が .env に定義されていません。');
  process.exit(1);
}
client.login(process.env.DISCORD_TOKEN);
