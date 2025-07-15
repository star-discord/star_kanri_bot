// ======== 基本モジュール読み込み ========
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, MessageFlagsBitField } = require('discord.js');
require('dotenv').config();

// ======== 起動時診断 ========
const { StartupDiagnostics } = require('./utils/startupDiagnostics');

async function runStartupDiagnostics() {
  const diagnostics = new StartupDiagnostics();
  const isHealthy = await diagnostics.runDiagnostics();
  
  if (!isHealthy) {
    console.log('❌ 重要なエラーによりBot起動を中止します。');
    process.exit(1);
  }
  
  console.log('🚀 診断完了 - Bot初期化を継続します...\n');
}

// 診断実行
runStartupDiagnostics().then(() => {
  console.log('📡 Bot初期化プロセス開始');
}).catch(console.error);

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
const { handleButton } = require('./utils/buttonsHandler');
const { handleModal } = require('./utils/modalsHandler');
const { handleSelect } = require('./utils/selectsHandler');

client.on('interactionCreate', async interaction => {
  const startTime = Date.now();
  const interactionId = interaction.id;
  
  console.log('🔔 [interactionCreate] 受信:', {
    type: interaction.type,
    commandName: interaction.commandName || interaction.customId || 'unknown',
    user: interaction.user.tag,
    guild: interaction.guild?.name || 'DM',
    timestamp: new Date().toISOString()
  });

  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        console.warn(`⚠️ [interactionCreate] 未知のコマンド: ${interaction.commandName}`);
        return;
      }

      // `凸スナ設置`は軽量なため、予防的デファーの対象外とします。
      // 重い処理を行うコマンドのみをここに追加してください。
      const shouldDefer = ['kpi_設定'].includes(interaction.commandName);
      if (shouldDefer && !interaction.deferred && !interaction.replied) {
        try {
          await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });
          console.log(`✅ [interactionCreate] 予防的デファー: ${interaction.commandName}`);
        } catch (deferError) {
          console.error('❌ [interactionCreate] デファー失敗:', deferError.message);
        }
      }

      await command.execute(interaction);

    } else if (interaction.isButton()) {
      await handleButton(interaction);
    } else if (interaction.isAnySelectMenu()) { // isStringSelectMenu() から isAnySelectMenu() に変更
      await handleSelect(interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModal(interaction);
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [interactionCreate] 処理完了: ${interaction.commandName || interaction.customId} (${duration}ms)`);

  } catch (err) {
    const duration = Date.now() - startTime;
    console.error('❌ [interactionCreate] ハンドリングエラー:', {
      error: err.message,
      full: err,
      stack: err.stack?.split('\n').slice(0, 3).join('\n'),
      commandName: interaction.commandName || interaction.customId,
      interactionId,
      duration,
      deferred: interaction.deferred,
      replied: interaction.replied,
      user: interaction.user?.tag
    });

    try {
      const errorMessage = '⚠️ 処理中にエラーが発生しました。しばらく時間をおいて再試行してください。';

      if (interaction.deferred) {
        await interaction.editReply({
          content: errorMessage,
          flags: MessageFlagsBitField.Flags.Ephemeral
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: errorMessage,
          flags: MessageFlagsBitField.Flags.Ephemeral
        });
      }

    } catch (replyError) {
      console.error('❌ [interactionCreate] エラーレスポンス送信失敗:', {
        error: replyError.message,
        interactionId,
        deferred: interaction.deferred,
        replied: interaction.replied
      });
    }
  }
});

// ======== 起動ログ ========
client.once('ready', () => {
  console.log(`🎉 Bot 起動完了！ログイン: ${client.user.tag}`);
});

// ======== Discordにログイン ========
client.login(process.env.DISCORD_TOKEN);

// ======== エラーフック（プロダクション対応強化） ========
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [UnhandledRejection]', {
    reason: reason?.message || reason,
    stack: reason?.stack?.split('\n').slice(0, 5).join('\n'),
    promise: promise.toString(),
    timestamp: new Date().toISOString()
  });
});

process.on('uncaughtException', (err, origin) => {
  console.error('❌ [UncaughtException]', {
    error: err.message,
    stack: err.stack?.split('\n').slice(0, 5).join('\n'),
    origin,
    timestamp: new Date().toISOString()
  });

  console.log('🔄 [UncaughtException] プロセス再起動...');
  process.exit(1);
});

process.on('warning', (warning) => {
  console.warn('⚠️ [ProcessWarning]', {
    name: warning.name,
    message: warning.message,
    stack: warning.stack?.split('\n').slice(0, 3).join('\n')
  });
});

// SIGTERM/SIGINT ハンドリング
process.on('SIGTERM', () => {
  console.log('📡 [SIGTERM] 受信 - グレースフルシャットダウン開始');
  client.destroy();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📡 [SIGINT] 受信 - グレースフルシャットダウン開始');
  client.destroy();
  process.exit(0);
});
