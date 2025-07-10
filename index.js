// index.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

// クライアント初期化
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// コマンド読み込み
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`✅ コマンド読み込み成功: ${file}`);
  } else {
    console.warn(`⚠️ コマンド形式不正: ${file}`);
  }
}

// events フォルダのイベント読み込み（必要に応じて他イベントもここに）
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  console.log(`✅ イベント読み込み成功: ${file}`);
}

// 明示的に interactionCreate をバインド（utils に移動したため）
const interactionHandler = require('./utils/interactionHandler');
client.on('interactionCreate', (...args) => interactionHandler.execute(...args, client));

// Discordログイン
client.login(process.env.DISCORD_TOKEN);

// HTTP サーバー（UptimeRobot用など）
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running');
});

server.listen(3000, () => {
  console.log('HTTP server listening on port 3000');
});
