// ======== 必要モジュール読み込み ========
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

// ======== .env チェック ========
if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN が .env に定義されていません。');
  process.exit(1);
}

// ======== Bot クライアント初期化 ========
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.MessageContent, // メッセージ本文が必要な場合のみ有効化
  ],
});

client.commands = new Collection();

// ======== コマンド読み込み関数 ========
function loadCommandFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      loadCommandFiles(fullPath); // 再帰
    } else if (entry.name.endsWith('.js')) {
      try {
        const command = require(fullPath);
        if (command?.data?.name && typeof command.execute === 'function') {
          client.commands.set(command.data.name, command);
          console.log(`✅ コマンド読み込み: ${command.data.name}`);
        } else {
          console.warn(`⚠️ 無効なコマンド形式: ${fullPath}`);
        }
      } catch (err) {
        console.error(`❌ コマンド読込失敗: ${fullPath}`, err);
      }
    }
  }
}

// ======== コマンド読み込み実行 ========
loadCommandFiles(path.join(__dirname, 'commands'));
console.log(`🧩 合計 ${client.commands.size} 個のコマンドを読み込みました。`);

// ======== イベント読み込み ========
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
      const event = require(filePath);
      if (event?.name && typeof event.execute === 'function') {
        const bindFn = (...args) => event.execute(...args, client);
        event.once ? client.once(event.name, bindFn) : client.on(event.name, bindFn);
        console.log(`📡 イベント登録: ${event.name}`);
      } else {
        console.warn(`⚠️ 無効なイベントファイル: ${file}`);
      }
    } catch (err) {
      console.error(`❌ イベント読込失敗: ${file}`, err);
    }
  }

  console.log(`🔔 合計 ${eventFiles.length} 個のイベントを登録しました。`);
}

// ======== インタラクションハンドラー ========
const interactionHandler = require('./utils/interactionHandler');
client.on('interactionCreate', interaction => interactionHandler.execute(interaction));

// ======== 起動ログ ========
client.once('ready', () => {
  console.log(`🎉 Bot 起動完了！ログイン: ${client.user.tag}`);
});

// ======== Discordにログイン ========
client.login(process.env.DISCORD_TOKEN);

// ======== エラーフック（開発中推奨） ========
process.on('unhandledRejection', (reason) => {
  console.error('❌ [UnhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('❌ [UncaughtException]', err);
});
