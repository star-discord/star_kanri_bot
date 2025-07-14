// checkData.js - 指定されたギルドのデータファイルを確認するデバッグ用スクリプト
const fs = require('fs');
const path = require('path');

/**
 * スクリプトの使用方法を表示する
 */
function printUsage() {
  console.log('\n--- データ確認スクリプト ---');
  console.log('使用法: node checkData.js <GUILD_ID>');
  console.log('例:     node checkData.js 123456789012345678\n');
}

// 1. コマンドライン引数からギルドIDを取得
const guildId = process.argv[2];

if (!guildId) {
  console.error('❌ エラー: ギルドIDが指定されていません。');
  printUsage();
  process.exit(1);
}

if (!/^\d+$/.test(guildId)) {
  console.error(`❌ エラー: 「${guildId}」は無効なギルドID形式です。数字のみを指定してください。`);
  printUsage();
  process.exit(1);
}

// 2. ファイルパスを構築
const filePath = path.join(__dirname, 'data', guildId, `${guildId}.json`);
console.log(`\n🔍 ファイルをチェック中: ${filePath}`);

// 3. ファイルの存在確認
if (!fs.existsSync(filePath)) {
  console.error('⚠️ ファイルが存在しません。ギルドIDが正しいか、Botがそのサーバーで活動しているか確認してください。');
  process.exit(1);
}

// 4. ファイルを読み込んで内容を表示
try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContent);

  console.log(`\n--- 📄 ${guildId}.json の内容 ---`);
  console.dir(data, { depth: null, colors: true }); // 色付きで見やすくする
  console.log('--- 📄 内容ここまで ---\n');
  console.log('✅ データチェック完了。');
} catch (error) {
  console.error('❌ ファイルの読み込みまたは解析中にエラーが発生しました:', error.message);
  process.exit(1);
}
