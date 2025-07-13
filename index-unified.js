// index-unified.js (統合後のindex.jsの例)
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

// 設定読み込み
const config = require('./config.json');

// クライアント初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// コマンドコレクション初期化
client.commands = new Collection();

// ======== コマンド読み込み ========
async function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);

      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`🎯 コマンド登録: ${command.data.name}`);
      } else {
        console.warn(`⚠️ 無効なコマンドファイル: ${file}`);
      }
    } catch (err) {
      console.error(`❌ コマンド読込失敗: ${file}`, err);
    }
  }

  console.log(`📋 合計 ${commandFiles.length} 個のコマンドを登録しました。`);
}

// ======== イベント読み込み ========
async function loadEvents() {
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
      delete require.cache[require.resolve(filePath)];
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

// ======== 統合インタラクションハンドラー ========
const { unifiedHandler } = require('./utils/unifiedInteractionHandler');

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        console.warn(`⚠️ 未定義コマンド: ${interaction.commandName}`);
        return;
      }
      
      console.log(`🎯 コマンド実行: ${interaction.commandName} (${interaction.user.username})`);
      await command.execute(interaction);
    } else {
      // ボタン、モーダル、セレクトメニューを統一処理
      await unifiedHandler.handleInteraction(interaction);
    }
  } catch (error) {
    console.error('❌ インタラクション処理エラー:', error);
    
    const errorMessage = {
      content: '❌ 処理中にエラーが発生しました。管理者に報告してください。',
      ephemeral: true
    };

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    } catch (replyError) {
      console.error('❌ エラーレスポンス送信失敗:', replyError);
    }
  }
});

// ======== 初期化とログイン ========
async function main() {
  try {
    console.log('🚀 STAR管理Bot v2.0 (統合版) を起動中...');
    
    // コマンドとイベントを読み込み
    await loadCommands();
    await loadEvents();
    
    // Discord にログイン
    await client.login(config.token);
    
    console.log('✅ Bot が正常に起動しました！');
    
  } catch (error) {
    console.error('❌ Bot起動エラー:', error);
    process.exit(1);
  }
}

// ======== エラーハンドリング ========
process.on('unhandledRejection', error => {
  console.error('❌ 未処理のPromise拒否:', error);
});

process.on('uncaughtException', error => {
  console.error('❌ 未キャッチ例外:', error);
  process.exit(1);
});

// 優雅な終了処理
process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received. 終了処理を開始...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received. 終了処理を開始...');
  client.destroy();
  process.exit(0);
});

// ======== 起動 ========
main();

// ======== 開発用デバッグ機能 ========
if (process.env.NODE_ENV === 'development') {
  // 統合状況をチェック
  const { migrationHelper } = require('./utils/migrationHelper');
  
  client.once('ready', async () => {
    console.log('\n🔍 開発モード: コード統合状況をチェック中...');
    
    const analysis = migrationHelper.analyzeIntegrationPotential();
    console.log(`📊 統合可能ファイル: ${analysis.potentialSavings} 削減可能`);
    
    if (analysis.integrationCandidates.length > 0) {
      console.log('⚠️  統合推奨ファイルが見つかりました:');
      analysis.integrationCandidates.forEach(candidate => {
        console.log(`   - ${candidate.type}: ${candidate.count}ファイル`);
      });
      console.log('   詳細は `node utils/migrationHelper.js` で確認できます');
    }
  });
}

module.exports = client;
