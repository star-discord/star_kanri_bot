const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

// Discordクライアント初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.MessageContent // ← 必要な場合のみ追加
  ],
});

client.commands = new Collection();

/**
 * コマンドファイルを再帰的に読み込む
 */
function loadCommandFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      loadCommandFiles(fullPath);
    } else if (file.endsWith('.js')) {
      try {
        const command = require(fullPath);
        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command);
          console.log(`✅ コマンド読み込み: ${command.data.name}`);
        } else {
          console.warn(`⚠️ 無効なコマンド: ${fullPath}`);
        }
      } catch (err) {
        console.error(`❌ コマンド読み込み失敗: ${fullPath}`, err);
      }
    }
  }
}

// コマンド読み込み
loadCommandFiles(path.join(__dirname, 'commands'));

// イベント読み込み（任意）
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`📡 イベント登録: ${event.name}`);
  }
}

// interactionHandler
const interactionHandler = require('./utils/interactionHandler');
client.on('interactionCreate', interaction => interactionHandler.execute(interaction, client));

// Bot 起動
client.once('ready', () => {
  console.log(`🎉 ログイン完了: ${client.user.tag}`);
});

// トークンチェック & ログイン
if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN が .env に設定されていません。');
  process.exit(1);
}
client.login(process.env.DISCORD_TOKEN);
