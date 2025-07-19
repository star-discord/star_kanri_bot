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

/**
 * Botのメイン処理を開始します。
 */
async function start() {
  /**
   * 指定されたディレクトリからモジュール（コマンドやイベント）を再帰的に読み込む
   * @param {string} dirPath モジュールが格納されているディレクトリのパス
   * @param {function(object, string): void} registerFn 読み込んだモジュールを登録する関数
   */
  function loadModules(dirPath, registerFn) {
    if (!fs.existsSync(dirPath)) {
      console.warn(`⚠️  モジュールディレクトリが見つかりません: ${dirPath}`);
      return 0;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    let count = 0;

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        count += loadModules(fullPath, registerFn); // 再帰
      } else if (entry.name.endsWith('.js')) {
        try {
          // 開発中にファイルを変更した場合でも最新版を読み込むためにキャッシュをクリア
          delete require.cache[require.resolve(fullPath)];
          const module = require(fullPath);
          registerFn(module, fullPath);
          count++;
        } catch (err) {
          console.error(`❌ モジュール読込失敗: ${path.relative(__dirname, fullPath)}`, err);
        }
      }
    }
    return count;
  }

  // ======== コマンド読み込み実行 ========
  const commandCount = loadModules(path.join(__dirname, 'commands'), (command, filePath) => {
    if (command?.data?.name && typeof command.execute === 'function') {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`⚠️  無効なコマンド形式: ${path.relative(__dirname, filePath)}`);
    }
  });
  console.log(`🧩 合計 ${commandCount} 個のコマンドを読み込みました。`);

  // ======== イベント読み込み ========
  const eventCount = loadModules(path.join(__dirname, 'events'), (event, filePath) => {
    if (event?.name && typeof event.execute === 'function') {
      const bindFn = (...args) => event.execute(...args, client);
      event.once ? client.once(event.name, bindFn) : client.on(event.name, bindFn);
    } else {
      console.warn(`⚠️  無効なイベント形式: ${path.relative(__dirname, filePath)}`);
    }
  });
  console.log(`🔔 合計 ${eventCount} 個のイベントを登録しました。`);

  // ======== ハンドラ読み込み ========
  const { unifiedHandler } = require('./utils/unifiedInteractionHandler');
  client.on('interactionCreate', async interaction => {
    const startTime = Date.now();

    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
          console.warn(`⚠️  未知のコマンド: ${interaction.commandName}`);
          return;
        }

        // コマンドファイル側で `deferReply: true` が設定されていれば、応答を保留する
        if (command.deferReply && !interaction.deferred) {
          await interaction.deferReply({ ephemeral: command.ephemeral ?? true });
        }

        await command.execute(interaction);

      } else {
        await unifiedHandler.handleInteraction(interaction);
      }

      const duration = Date.now() - startTime;
      console.log(`✅ 処理完了: ${interaction.commandName || interaction.customId} (${duration}ms)`);

    } catch (err) {
      const duration = Date.now() - startTime;
      console.error('❌ ハンドリングエラー:', {
        error: err.message,
        command: interaction.commandName || interaction.customId,
        user: interaction.user?.tag,
        duration,
        stack: err.stack?.split('\n').slice(0, 3).join('\n'),
      });

      try {
        const errorMessage = {
          content: '⚠️ 処理中にエラーが発生しました。しばらく時間をおいて再試行してください。',
          ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      } catch (replyError) {
        console.error('❌ エラーレスポンス送信失敗:', replyError.message);
      }
    }
  });

  // ======== Discordにログイン ========
  await client.login(process.env.DISCORD_TOKEN);
}

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

// ======== Bot起動 ========
start();

process.on('SIGINT', () => {
  console.log('📡 [SIGINT] 受信 - グレースフルシャットダウン開始');
  client.destroy();
  process.exit(0);
});
